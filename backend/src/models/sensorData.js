const db = require('../services/database');
const cache = require('../services/cache');
const logger = require('../utils/logger');

class SensorData {
  // ========================================
  // 传感器管理相关数据库操作
  // ========================================
  // 1. 查询传感器
  // 2. 创建传感器
  // 3. 更新传感器
  // 4. 删除传感器

  // 1. 查询传感器
  static async get(params = {}, connection = null) {
    const dbConnection = connection || db;
    const { dtuId, sensorId } = params;
    
    // 生成缓存键
    const cacheKey = cache.generateKey('sensors', {
      dtuId: dtuId || '',
      sensorId: sensorId || ''
    });
    
    return await cache.cacheQuery(cacheKey, async () => {
      // 如果传递了sensorId，查询指定传感器
      if (sensorId) {
        const [rows] = await dbConnection.execute(
          'SELECT * FROM sensors WHERE sensor_id = ?',
          [sensorId]
        );
        
        if (rows.length === 0) {
          return null; // 返回null而不是抛出异常
        }
        
        return rows[0];
      }
      
      // 如果传递了dtuId，查询该DTU下的所有传感器
      if (dtuId) {
        const [rows] = await dbConnection.execute(
          'SELECT * FROM sensors WHERE dtu_id = ? ORDER BY sensor_id',
          [dtuId]
        );
        return rows;
      }
      
      // 如果都没传递，返回空数组
      return [];
    }, 300, 'default'); // 5分钟缓存
  }

  // 2. 创建传感器
  static async create(data, connection = null) {
    const dbConnection = connection || db;
    
    logger.debug('Creating sensor(s)', { data });
    
    const sensors = Array.isArray(data) ? data : [data];
    const results = [];
    
    for (const sensorData of sensors) {
      try {
        const { mbRtuConfig, ...sensorInfo } = sensorData;
        
        // 1. 创建传感器
        const sensorResult = await this.createOne(sensorInfo, dbConnection);
        
        // 2. 创建MB-RTU协议（总是创建，使用提供的参数或默认参数）
        const MbRtuData = require('./mbRtuData');
        const mbRtuData = {
          dtu_id: sensorInfo.dtu_id,
          sensor_id: sensorInfo.sensor_id,
          ...(mbRtuConfig || {})  // 如果提供了配置就使用，否则使用空对象
        };
        
        await MbRtuData.create(mbRtuData, dbConnection);
        
        results.push({
          success: true,
          sensor_id: sensorInfo.sensor_id,
          dtu_id: sensorInfo.dtu_id,
          data: sensorResult
        });
      } catch (error) {
        results.push({
          success: false,
          sensor_id: sensorData.sensor_id,
          dtu_id: sensorData.dtu_id,
          error: error.message
        });
      }
    }
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return results;
  }

  // 创建单个传感器
  static async createOne(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      sensor_id, dtu_id, icon = '/image/传感器图片.png', sensor_name, 
      sensor_type, decimal_places, unit, sort_order,
      upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
      lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
    } = data;
    
    const [result] = await dbConnection.execute(
      `INSERT INTO sensors (
        sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
        upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
        lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sensor_id, 
        dtu_id, 
        icon, 
        sensor_name, 
        sensor_type || null, 
        decimal_places || null, 
        unit || null, 
        sort_order || null,
        upper_mapping_x1 || null, 
        upper_mapping_y1 || null, 
        upper_mapping_x2 || null, 
        upper_mapping_y2 || null,
        lower_mapping_x1 || null, 
        lower_mapping_y1 || null, 
        lower_mapping_x2 || null, 
        lower_mapping_y2 || null
      ]
    );
    
    return result;
  }

  // 3. 更新传感器
  static async update(data, connection = null) {
    const dbConnection = connection || db;
    
    logger.debug('Updating sensor(s)', { data });
    
    // 统一处理：将单个对象转换为数组
    const sensors = Array.isArray(data) ? data : [data];
    const results = [];
    
    for (const sensorData of sensors) {
      try {
        const result = await this.updateOne(sensorData, dbConnection);
        results.push({
          success: true,
          sensor_id: sensorData.sensor_id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          sensor_id: sensorData.sensor_id,
          error: error.message
        });
      }
    }
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensor:.*', 'default');
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return results;
  }

  // 更新单个传感器
  static async updateOne(sensorData, connection = null) {
    const dbConnection = connection || db;
    const { 
      sensor_id, sensor_name, sensor_type, decimal_places, unit, sort_order,
      upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
      lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
    } = sensorData;
    
    // 检查传感器是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id FROM sensors WHERE sensor_id = ?',
      [sensor_id]
    );
    
    if (existingRows.length === 0) {
      throw new Error('传感器不存在');
    }
    
    // 更新传感器
    const updateFields = [];
    const updateValues = [];
    
    if (sensor_name !== undefined) {
      updateFields.push('sensor_name = ?');
      updateValues.push(sensor_name);
    }
    if (sensor_type !== undefined) {
      updateFields.push('sensor_type = ?');
      updateValues.push(sensor_type);
    }
    if (decimal_places !== undefined) {
      updateFields.push('decimal_places = ?');
      updateValues.push(decimal_places);
    }
    if (unit !== undefined) {
      updateFields.push('unit = ?');
      updateValues.push(unit);
    }
    if (sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(sort_order);
    }
    if (upper_mapping_x1 !== undefined) {
      updateFields.push('upper_mapping_x1 = ?');
      updateValues.push(upper_mapping_x1);
    }
    if (upper_mapping_y1 !== undefined) {
      updateFields.push('upper_mapping_y1 = ?');
      updateValues.push(upper_mapping_y1);
    }
    if (upper_mapping_x2 !== undefined) {
      updateFields.push('upper_mapping_x2 = ?');
      updateValues.push(upper_mapping_x2);
    }
    if (upper_mapping_y2 !== undefined) {
      updateFields.push('upper_mapping_y2 = ?');
      updateValues.push(upper_mapping_y2);
    }
    if (lower_mapping_x1 !== undefined) {
      updateFields.push('lower_mapping_x1 = ?');
      updateValues.push(lower_mapping_x1);
    }
    if (lower_mapping_y1 !== undefined) {
      updateFields.push('lower_mapping_y1 = ?');
      updateValues.push(lower_mapping_y1);
    }
    if (lower_mapping_x2 !== undefined) {
      updateFields.push('lower_mapping_x2 = ?');
      updateValues.push(lower_mapping_x2);
    }
    if (lower_mapping_y2 !== undefined) {
      updateFields.push('lower_mapping_y2 = ?');
      updateValues.push(lower_mapping_y2);
    }
    
    if (updateFields.length === 0) {
      throw new Error('没有提供要更新的字段');
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(sensor_id);
    
    const [result] = await dbConnection.execute(
      `UPDATE sensors SET ${updateFields.join(', ')} WHERE sensor_id = ?`,
      updateValues
    );
    
    return { action: 'updated', affectedRows: result.affectedRows };
  }

  // 4. 删除传感器
  static async delete(data, connection = null) {
    const dbConnection = connection || db;
    
    logger.debug('Deleting sensor(s)', { data });
    
    // 统一处理：将单个对象转换为数组
    const sensors = Array.isArray(data) ? data : [data];
    const results = [];
    
    for (const sensorData of sensors) {
      try {
        const result = await this.deleteOne(sensorData, dbConnection);
        results.push({
          success: true,
          sensor_id: sensorData.sensor_id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          sensor_id: sensorData.sensor_id,
          error: error.message
        });
      }
    }
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensor:.*', 'default');
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return results;
  }

  // 删除单个传感器
  static async deleteOne(sensorData, connection = null) {
    const dbConnection = connection || db;
    const { sensor_id } = sensorData;
    
    logger.debug('Deleting sensor', { sensor_id });
    
    // 检查传感器是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id, dtu_id FROM sensors WHERE sensor_id = ?',
      [sensor_id]
    );
    
    if (existingRows.length === 0) {
      throw new Error('传感器不存在');
    }
    
    // 删除对应的MB-RTU协议
    try {
      const MbRtuData = require('./mbRtuData');
      await MbRtuData.delete(existingRows[0].dtu_id, sensor_id, dbConnection);
    } catch (error) {
      // 如果MB-RTU协议不存在，记录日志但不影响删除流程
      logger.warn('MB-RTU协议不存在或已删除', { 
        dtu_id: existingRows[0].dtu_id, 
        sensor_id, 
        error: error.message 
      });
    }
    
    // 删除传感器
    const [result] = await dbConnection.execute(
      'DELETE FROM sensors WHERE sensor_id = ?',
      [sensor_id]
    );
    
    return { action: 'deleted', affectedRows: result.affectedRows };
  }
}

module.exports = SensorData;
