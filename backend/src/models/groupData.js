const db = require('../services/database');
const logger = require('../utils/logger');
const cache = require('../services/cache');
const TransactionService = require('../services/transaction');

class GroupData {
  // 获取分组名称列表
  static async getGroupNames(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('device_groups_names');
    return await cache.cacheQuery(cacheKey, async () => {
      // 从device_groups表中获取所有分组名称
      const [rows] = await dbConnection.execute(`
        SELECT group_name 
        FROM device_groups 
        ORDER BY group_name
      `);
      return rows.map(row => row.group_name);
    }, 3600, 'long'); // 缓存1小时
  }

  // 获取所有分组详细信息
  static async getGroups(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('all_groups');
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(`
        SELECT id, group_name, description, is_default, created_at, updated_at
        FROM device_groups 
        ORDER BY is_default DESC, group_name
      `);
      return rows;
    }, 3600, 'long');
  }

  // 获取默认分组
  static async getDefaultGroup(connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('default_group');
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(`
        SELECT id, group_name, description, is_default, created_at, updated_at
        FROM device_groups 
        WHERE is_default = TRUE
        LIMIT 1
      `);
      return rows[0] || null;
    }, 3600, 'long');
  }

  // 根据ID获取分组
  static async getGroupById(id, connection = null) {
    const dbConnection = connection || db;
    const [rows] = await dbConnection.execute(`
      SELECT id, group_name, description, is_default, created_at, updated_at
      FROM device_groups 
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  }

  // 更新分组
  static async updateGroup(id, data, connection = null) {
    const dbConnection = connection || db;
    const { group_name, description } = data;
    const [result] = await dbConnection.execute(`
      UPDATE device_groups 
      SET group_name = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND is_default = FALSE
    `, [group_name, description, id]);
    
    if (result.affectedRows === 0) {
      throw new Error('分组不存在或为默认分组，无法修改');
    }
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('device_groups_names:.*', 'long');
      cache.deletePattern('all_groups:.*', 'long');
      cache.deletePattern('default_group:.*', 'long');
    }
    
    return result;
  }

  // 删除分组
  static async deleteGroup(id) {
    return await TransactionService.execute(async (connection) => {
      // 1. 检查分组是否存在且不是默认分组
      const [groupRows] = await connection.execute(`
        SELECT id, group_name, is_default 
        FROM device_groups 
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
        FROM device_groups 
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
        SET device_group = ?, updated_at = NOW()
        WHERE device_group = ?
      `, [defaultGroup.group_name, group.group_name]);
      
      // 4. 删除分组
      const [deleteResult] = await connection.execute(`
        DELETE FROM device_groups 
        WHERE id = ?
      `, [id]);
      
      logger.info('Group deleted successfully', {
        deletedGroupId: id,
        deletedGroupName: group.group_name,
        movedDevicesCount: moveResult.affectedRows,
        defaultGroupName: defaultGroup.group_name
      });
      
      // 清除相关缓存
      cache.deletePattern('device_groups_names:.*', 'long');
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

  // 检查分组名是否存在
  static async checkGroupNameExists(groupName, connection = null) {
    const dbConnection = connection || db;
    const [rows] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM device_groups WHERE group_name = ?',
      [groupName]
    );
    return rows[0].count > 0;
  }

  // 创建新分组
  static async createGroup(data, connection = null) {
    const dbConnection = connection || db;
    const { group_name, description } = data;
    const [result] = await dbConnection.execute(
      'INSERT INTO device_groups (group_name, description) VALUES (?, ?)',
      [group_name, description]
    );
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('device_groups_names:.*', 'long');
    }
    
    return result;
  }

}

module.exports = GroupData;
