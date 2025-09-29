const db = require('../services/database');
const logger = require('../utils/logger');
const cache = require('../services/cache');
const TransactionService = require('../services/transaction');

class GroupData {
  // ========================================
  // 设备分组相关数据库操作
  // ========================================
  // 1. 查询所有分组的名称
  // 2. 查询所有分组
  // 3. 查询默认分组
  // 4. 查询指定分组
  // 5. 检查分组名是否存在
  // 6. 创建分组
  // 7. 更新分组
  // 8. 删除分组

  // 1. 查询所有分组的名称
  static async getNames(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('dtu_groups_names');
    return await cache.cacheQuery(cacheKey, async () => {
      // 从dtu_groups表中获取所有分组名称
      const [rows] = await dbConnection.execute(`
        SELECT group_name 
        FROM dtu_groups 
        ORDER BY group_name
      `);
      return rows.map(row => row.group_name);
    }, 3600, 'long'); // 缓存1小时
  }

  // 2. 查询所有分组
  static async getAll(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('all_groups');
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(`
        SELECT id, group_name, description, is_default, created_at, updated_at
        FROM dtu_groups 
        ORDER BY is_default DESC, group_name
      `);
      return rows;
    }, 3600, 'long');
  }

  // 3. 查询默认分组
  static async getDefault(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('default_group');
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(`
        SELECT id, group_name, description, is_default, created_at, updated_at
        FROM dtu_groups 
        WHERE is_default = TRUE
        LIMIT 1
      `);
      return rows[0] || null;
    }, 3600, 'long');
  }

  // 4. 查询指定分组
  static async getById(id, connection = null) {
    const dbConnection = connection || db;
    const [rows] = await dbConnection.execute(`
      SELECT id, group_name, description, is_default, created_at, updated_at
      FROM dtu_groups 
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  }

  // 5. 检查分组名是否存在
  static async checkGroupNameExists(groupName, connection = null) {
    const dbConnection = connection || db;
    const [rows] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM dtu_groups WHERE group_name = ?',
      [groupName]
    );
    return rows[0].count > 0;
  }

  // 6. 创建分组
  static async create(data, connection = null) {
    const dbConnection = connection || db;
    const { group_name, description } = data;
    const [result] = await dbConnection.execute(
      'INSERT INTO dtu_groups (group_name, description) VALUES (?, ?)',
      [group_name, description]
    );
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('dtu_groups_names:.*', 'long');
    }
    
    return result;
  }

  // 7. 更新分组
  static async update(id, data, connection = null) {
    const dbConnection = connection || db;
    const { group_name, description } = data;
    const [result] = await dbConnection.execute(`
      UPDATE dtu_groups 
      SET group_name = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND is_default = FALSE
    `, [group_name, description, id]);
    
    if (result.affectedRows === 0) {
      throw new Error('分组不存在或为默认分组，无法修改');
    }
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('dtu_groups_names:.*', 'long');
      cache.deletePattern('all_groups:.*', 'long');
      cache.deletePattern('default_group:.*', 'long');
    }
    
    return result;
  }

  // 8. 删除分组
  static async delete(id) {
    return await TransactionService.execute(async (connection) => {
      // 1. 检查分组是否存在且不是默认分组
      const [groupRows] = await connection.execute(`
        SELECT id, group_name, is_default 
        FROM dtu_groups 
        WHERE id = ?
      `, [id]);
      
      if (groupRows.length === 0) {
        throw new Error('分组不存在');
      }
      
      const group = groupRows[0];
      if (group.is_default) {
        throw new Error('默认分组不能删除');
      }
      
      // 2. 获取默认分组
      const [defaultGroupRows] = await connection.execute(`
        SELECT id, group_name 
        FROM dtu_groups 
        WHERE is_default = TRUE
        LIMIT 1
      `);
      
      if (defaultGroupRows.length === 0) {
        throw new Error('默认分组不存在，无法删除分组');
      }
      
      const defaultGroup = defaultGroupRows[0];
      
      // 3. 将该分组下的所有设备移到默认分组
      const [moveResult] = await connection.execute(`
        UPDATE dtu_devices 
        SET dtu_group = ?, updated_at = NOW()
        WHERE dtu_group = ?
      `, [defaultGroup.group_name, group.group_name]);
      
      // 4. 删除分组
      const [deleteResult] = await connection.execute(`
        DELETE FROM dtu_groups 
        WHERE id = ?
      `, [id]);
      
      logger.info('Group deleted successfully', {
        deletedGroupId: id,
        deletedGroupName: group.group_name,
        movedDevicesCount: moveResult.affectedRows,
        defaultGroupName: defaultGroup.group_name
      });
      
      // 清除相关缓存
      cache.deletePattern('dtu_groups_names:.*', 'long');
      cache.deletePattern('all_groups:.*', 'long');
      cache.deletePattern('default_group:.*', 'long');
      
      return {
        deletedGroupId: id,
        deletedGroupName: group.group_name,
        movedDevicesCount: moveResult.affectedRows,
        defaultGroupName: defaultGroup.group_name
      };
    });
  }

}

module.exports = GroupData;
