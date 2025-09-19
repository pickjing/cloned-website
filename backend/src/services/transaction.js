const db = require('./database');
const logger = require('../utils/logger');

class TransactionService {
  /**
   * 执行事务
   * @param {Function} callback - 事务回调函数，接收connection参数
   * @param {Object} options - 事务选项
   * @returns {Promise} 事务结果
   */
  static async execute(callback, options = {}) {
    const {
      isolationLevel = 'READ COMMITTED',
      timeout = 30000, // 30秒超时
      retries = 3, // 重试次数
      retryDelay = 1000 // 重试延迟
    } = options;

    let connection = null;
    let attempt = 0;

    while (attempt < retries) {
      try {
        // 获取连接
        connection = await db.getConnection();
        
        // 设置事务隔离级别
        await connection.execute(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
        
        // 开始事务
        await connection.beginTransaction();
        
        logger.debug('Transaction started', {
          isolationLevel,
          attempt: attempt + 1,
          threadId: connection.threadId
        });

        // 执行事务回调
        const result = await callback(connection);

        // 提交事务
        await connection.commit();
        
        logger.debug('Transaction committed', {
          threadId: connection.threadId,
          attempt: attempt + 1
        });

        return result;

      } catch (error) {
        if (connection) {
          try {
            await connection.rollback();
            logger.debug('Transaction rolled back', {
              threadId: connection.threadId,
              error: error.message,
              attempt: attempt + 1
            });
          } catch (rollbackError) {
            logger.error('Transaction rollback failed', {
              threadId: connection.threadId,
              originalError: error.message,
              rollbackError: rollbackError.message
            });
          }
        }

        // 检查是否应该重试
        if (this.shouldRetry(error) && attempt < retries - 1) {
          attempt++;
          logger.warn('Transaction retry', {
            error: error.message,
            attempt,
            retries,
            delay: retryDelay
          });
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        // 记录最终错误
        logger.error('Transaction failed', {
          error: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          attempt: attempt + 1,
          threadId: connection?.threadId
        });

        throw error;

      } finally {
        // 释放连接
        if (connection) {
          connection.release();
        }
      }
    }
  }

  /**
   * 判断是否应该重试
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否应该重试
   */
  static shouldRetry(error) {
    const retryableErrors = [
      'ER_LOCK_DEADLOCK',           // 死锁
      'ER_LOCK_WAIT_TIMEOUT',       // 锁等待超时
      'ER_QUERY_INTERRUPTED',       // 查询中断
      'ECONNRESET',                 // 连接重置
      'ECONNREFUSED',               // 连接拒绝
      'ETIMEDOUT'                   // 超时
    ];

    return retryableErrors.includes(error.code) || 
           error.message.includes('timeout') ||
           error.message.includes('connection');
  }

  /**
   * 批量操作事务
   * @param {Array} operations - 操作数组
   * @param {Object} options - 事务选项
   * @returns {Promise} 批量操作结果
   */
  static async batchExecute(operations, options = {}) {
    return await this.execute(async (connection) => {
      const results = [];
      
      for (const operation of operations) {
        const { query, params = [] } = operation;
        const [result] = await connection.execute(query, params);
        results.push(result);
      }
      
      return results;
    }, options);
  }

  /**
   * 级联删除事务
   * @param {string} table - 主表名
   * @param {string} idField - ID字段名
   * @param {Array} ids - 要删除的ID数组
   * @param {Array} cascadeTables - 级联删除的表配置
   * @param {Object} options - 事务选项
   * @returns {Promise} 删除结果
   */
  static async cascadeDelete(table, idField, ids, cascadeTables = [], options = {}) {
    return await this.execute(async (connection) => {
      const placeholders = ids.map(() => '?').join(',');
      const results = {};

      // 1. 级联删除相关表
      for (const cascadeTable of cascadeTables) {
        const { table: cascadeTableName, field = idField } = cascadeTable;
        const [result] = await connection.execute(
          `DELETE FROM ${cascadeTableName} WHERE ${field} IN (${placeholders})`,
          ids
        );
        results[cascadeTableName] = result.affectedRows;
        
        logger.debug('Cascade delete', {
          table: cascadeTableName,
          field,
          affectedRows: result.affectedRows
        });
      }

      // 2. 删除主表记录
      const [mainResult] = await connection.execute(
        `DELETE FROM ${table} WHERE ${idField} IN (${placeholders})`,
        ids
      );
      results[table] = mainResult.affectedRows;

      logger.info('Cascade delete completed', {
        mainTable: table,
        totalAffected: Object.values(results).reduce((sum, count) => sum + count, 0),
        results
      });

      return results;
    }, options);
  }

  /**
   * 数据迁移事务
   * @param {Array} sourceData - 源数据
   * @param {string} targetTable - 目标表
   * @param {Function} transformFn - 数据转换函数
   * @param {Object} options - 事务选项
   * @returns {Promise} 迁移结果
   */
  static async migrateData(sourceData, targetTable, transformFn, options = {}) {
    return await this.execute(async (connection) => {
      const results = [];
      const batchSize = options.batchSize || 100;

      // 分批处理数据
      for (let i = 0; i < sourceData.length; i += batchSize) {
        const batch = sourceData.slice(i, i + batchSize);
        const transformedBatch = batch.map(transformFn);
        
        // 构建批量插入SQL
        const fields = Object.keys(transformedBatch[0]);
        const values = transformedBatch.map(item => 
          fields.map(field => item[field])
        );
        
        const placeholders = values.map(() => 
          `(${fields.map(() => '?').join(', ')})`
        ).join(', ');
        
        const query = `INSERT INTO ${targetTable} (${fields.join(', ')}) VALUES ${placeholders}`;
        const params = values.flat();
        
        const [result] = await connection.execute(query, params);
        results.push(result);
        
        logger.debug('Batch insert completed', {
          table: targetTable,
          batchSize: batch.length,
          affectedRows: result.affectedRows
        });
      }

      return results;
    }, options);
  }

  /**
   * 健康检查事务
   * @returns {Promise} 健康检查结果
   */
  static async healthCheck() {
    try {
      return await this.execute(async (connection) => {
        // 执行简单查询测试连接
        const [result] = await connection.execute('SELECT 1 as test');
        return {
          status: 'healthy',
          test: result[0].test,
          timestamp: new Date().toISOString()
        };
      }, { timeout: 5000 });
    } catch (error) {
      logger.error('Transaction health check failed', {
        error: error.message
      });
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = TransactionService;
