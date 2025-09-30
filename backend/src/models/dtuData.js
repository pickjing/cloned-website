const db = require('../services/database');
const logger = require('../utils/logger');
const cache = require('../services/cache');
const TransactionService = require('../services/transaction');

class DtuData {
  // ========================================
  // DTU设备相关数据库操作
  // ========================================
  // 1. 创建DTU设备
  // 2. 查询DTU设备
  // 3. 更新DTU设备
  // 4. 复制DTU设备
  // 5. 删除DTU设备

  // 1. 创建DTU设备
  static async create(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      dtu_id, 
      serial_number, 
      dtu_group, 
      dtu_name, 
      dtu_image, 
      link_protocol, 
      offline_delay, 
      timezone_setting, 
      longitude, 
      latitude, 
      status 
    } = data;
    
    // 检查DTU设备ID是否已存在
    const [existingRows] = await dbConnection.execute(
      'SELECT dtu_id FROM dtu_devices WHERE dtu_id = ?',
      [dtu_id]
    );
    
    if (existingRows.length > 0) {
      throw new Error('DTU设备ID已存在');
    }
    
    // 检查分组是否存在
    const [groupRows] = await dbConnection.execute(
      'SELECT group_name FROM dtu_groups WHERE group_name = ?',
      [dtu_group]
    );
    
    if (groupRows.length === 0) {
      throw new Error('指定的分组不存在');
    }
    
    const [result] = await dbConnection.execute(`
      INSERT INTO dtu_devices (
        dtu_id, serial_number, dtu_group, dtu_name, dtu_image, 
        link_protocol, offline_delay, timezone_setting, longitude, latitude, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      dtu_id, 
      serial_number || null, 
      dtu_group, 
      dtu_name, 
      dtu_image || null, 
      link_protocol || 'MB RTU', 
      offline_delay || 300, 
      timezone_setting || '+08:00', 
      longitude || null, 
      latitude || null, 
      status || '未连接'
    ]);
    
    // 清除相关缓存
    if (!connection) {
      cache.deletePattern('dtu_devices:*', 'short');
    }
    
    return {
      insertId: result.insertId,
      dtu_id,
      dtu_name
    };
  }

  // 2. 查询DTU设备
  static async get(params = {}, connection = null) {
    const dbConnection = connection || db;
    const { dtu_id, page = 1, limit = 20, group, status, search } = params;
    
    // 生成缓存键
    const cacheKey = cache.generateKey('dtu_devices', {
      dtu_id: dtu_id || '',
      page,
      limit,
      group: group || '',
      status: status || '',
      search: search || ''
    });
    
    // 尝试从缓存获取
    const cached = cache.get(cacheKey, 'short');
    if (cached && !connection) {
      logger.debug('Cache hit for DTU devices', { cacheKey });
      return cached;
    }
    
    let sql = `
      SELECT 
        id,
        dtu_id,
        serial_number,
        created_date,
        dtu_group,
        dtu_name,
        dtu_image,
        link_protocol,
        offline_delay,
        timezone_setting,
        longitude,
        latitude,
        status,
        created_at,
        updated_at
      FROM dtu_devices 
      WHERE 1=1
    `;
    const queryParams = [];
    
    // 根据dtu_id查询单个设备
    if (dtu_id) {
      sql += ' AND dtu_id = ?';
      queryParams.push(dtu_id);
    }
    
    // 根据分组筛选
    if (group) {
      sql += ' AND dtu_group = ?';
      queryParams.push(group);
    }
    
    // 根据状态筛选
    if (status) {
      sql += ' AND status = ?';
      queryParams.push(status);
    }
    
    // 根据搜索关键词筛选
    if (search) {
      sql += ' AND (dtu_name LIKE ? OR dtu_id LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }
    
    // 如果不是查询单个设备，添加分页
    if (!dtu_id) {
      // 先获取总数
      const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const [countRows] = await dbConnection.execute(countSql, queryParams);
      const total = countRows[0].total;
      
      // 添加排序和分页
      sql += ' ORDER BY created_at DESC';
      sql += ' LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const [rows] = await dbConnection.execute(sql, queryParams);
      
      const result = {
        devices: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
      
      // 缓存结果
      if (!connection) {
        cache.set(cacheKey, result, 'short');
      }
      
      return result;
    } else {
      // 查询单个设备
      const [rows] = await dbConnection.execute(sql, queryParams);
      
      if (rows.length === 0) {
        throw new Error('DTU设备不存在');
      }
      
      const result = rows[0];
      
      // 缓存结果
      if (!connection) {
        cache.set(cacheKey, result, 'short');
      }
      
      return result;
    }
  }

  // 3. 更新DTU设备
  static async update(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      dtu_id, 
      serial_number, 
      dtu_group, 
      dtu_name, 
      dtu_image, 
      link_protocol, 
      offline_delay, 
      timezone_setting, 
      longitude, 
      latitude, 
      status 
    } = data;
    
    // 检查DTU设备是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT dtu_id FROM dtu_devices WHERE dtu_id = ?',
      [dtu_id]
    );
    
    if (existingRows.length === 0) {
      throw new Error('DTU设备不存在');
    }
    
    // 检查分组是否存在（如果提供了新分组）
    if (dtu_group) {
      const [groupRows] = await dbConnection.execute(
        'SELECT group_name FROM dtu_groups WHERE group_name = ?',
        [dtu_group]
      );
      
      if (groupRows.length === 0) {
        throw new Error('指定的分组不存在');
      }
    }
    
    const [result] = await dbConnection.execute(`
      UPDATE dtu_devices 
      SET 
        serial_number = ?, 
        dtu_group = ?, 
        dtu_name = ?, 
        dtu_image = ?, 
        link_protocol = ?, 
        offline_delay = ?, 
        timezone_setting = ?, 
        longitude = ?, 
        latitude = ?, 
        status = ?, 
        updated_at = NOW()
      WHERE dtu_id = ?
    `, [
      serial_number || null, 
      dtu_group, 
      dtu_name, 
      dtu_image || null, 
      link_protocol || 'MB RTU', 
      offline_delay || 300, 
      timezone_setting || '+08:00', 
      longitude || null, 
      latitude || null, 
      status || '未连接', 
      dtu_id
    ]);
    
    // 清除相关缓存
    if (!connection) {
      cache.deletePattern('dtu_devices:*', 'short');
    }
    
    return {
      affectedRows: result.affectedRows,
      dtu_id,
      dtu_name
    };
  }

  // 4. 复制DTU设备
  static async copy(data, connection = null) {
    const dbConnection = connection || db;
    const { dtu_ids } = data;
    
    if (!Array.isArray(dtu_ids) || dtu_ids.length === 0) {
      throw new Error('请提供要复制的DTU设备ID列表');
    }
    
    const results = [];
    
    for (const dtu_id of dtu_ids) {
      try {
        // 获取原始设备信息
        const [originalRows] = await dbConnection.execute(
          'SELECT serial_number, dtu_group, dtu_name, dtu_image, link_protocol, offline_delay, timezone_setting, longitude, latitude, status FROM dtu_devices WHERE dtu_id = ?',
          [dtu_id]
        );
        
        if (originalRows.length === 0) {
          results.push({
            success: false,
            dtu_id,
            error: '原始DTU设备不存在'
          });
          continue;
        }
        
        const original = originalRows[0];
        
        // 生成新的DTU设备ID
        const newDtuId = `${dtu_id}_copy_${Date.now()}`;
        
        // 创建新设备
        const [result] = await dbConnection.execute(`
          INSERT INTO dtu_devices (
            dtu_id, serial_number, dtu_group, dtu_name, dtu_image, 
            link_protocol, offline_delay, timezone_setting, longitude, latitude, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          newDtuId,
          original.serial_number,
          original.dtu_group,
          `${original.dtu_name}_副本`,
          original.dtu_image,
          original.link_protocol,
          original.offline_delay,
          original.timezone_setting,
          original.longitude,
          original.latitude,
          original.status
        ]);
        
        results.push({
          success: true,
          originalDtuId: dtu_id,
          newDtuId,
          dtuName: `${original.dtu_name}_副本`
        });
        
      } catch (error) {
        results.push({
          success: false,
          dtu_id,
          error: error.message
        });
      }
    }
    
    // 清除相关缓存
    if (!connection) {
      cache.deletePattern('dtu_devices:*', 'short');
    }
    
    return results;
  }

  // 5. 删除DTU设备
  static async delete(data, connection = null) {
    const dbConnection = connection || db;
    
    // 统一处理：将单个对象转换为数组
    const dtuIds = Array.isArray(data) ? data : [data];
    
    // 检查所有DTU设备是否存在
    const placeholders = dtuIds.map(() => '?').join(',');
    const [existingRows] = await dbConnection.execute(
      `SELECT dtu_id, dtu_name FROM dtu_devices WHERE dtu_id IN (${placeholders})`,
      dtuIds
    );
    
    const existingDtuIds = existingRows.map(row => row.dtu_id);
    const missingDtuIds = dtuIds.filter(id => !existingDtuIds.includes(id));
    
    // 批量删除存在的DTU设备（级联删除相关的传感器和MB-RTU配置）
    let deletedCount = 0;
    if (existingDtuIds.length > 0) {
      const deletePlaceholders = existingDtuIds.map(() => '?').join(',');
      const [result] = await dbConnection.execute(
        `DELETE FROM dtu_devices WHERE dtu_id IN (${deletePlaceholders})`,
        existingDtuIds
      );
      deletedCount = result.affectedRows;
    }
    
    // 构建结果
    const results = [];
    
    // 成功删除的DTU设备
    existingDtuIds.forEach(dtu_id => {
      const device = existingRows.find(row => row.dtu_id === dtu_id);
      results.push({
        success: true,
        dtu_id,
        data: {
          affectedRows: 1,
          deletedDtuId: device.dtu_id,
          deletedDtuName: device.dtu_name
        }
      });
    });
    
    // 不存在的DTU设备
    missingDtuIds.forEach(dtu_id => {
      results.push({
        success: false,
        dtu_id,
        error: 'DTU设备不存在'
      });
    });
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('dtu_devices:*', 'short');
      cache.deletePattern('sensors:*', 'default');
      cache.deletePattern('mb_rtu:*', 'default');
    }
    
    return results;
  }
}

module.exports = DtuData;
