const db = require('../services/database');
const cache = require('../services/cache');
const logger = require('../utils/logger');

class SensorData {
  // ========================================
  // 传感器管理相关操作
  // ========================================
  // 1. 根据DTU设备ID获取连接的传感器详情
  // 2. 根据传感器ID获取传感器详情
  // 3. 创建传感器
  // 4. 更新传感器
  // 5. 删除传感器

  // 1. 根据DTU设备ID获取连接的传感器详情
  static async getSensorsByDTUId(dtuId, connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('sensors_by_dtu', { dtuId });
    
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM sensors WHERE dtu_id = ? ORDER BY sensor_id',
        [dtuId]
      );
      return rows;
    }, 300, 'default'); // 5分钟缓存
  }

  // 2. 根据传感器ID获取传感器详情
  static async getSensorById(sensorId, connection = null) {
    const dbConnection = connection || db;
    const cacheKey = cache.generateKey('sensor', { sensorId });
    
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM sensors WHERE sensor_id = ?',
        [sensorId]
      );
      
      if (rows.length === 0) {
        throw new Error('传感器不存在');
      }
      
      return rows[0];
    }, 300, 'default'); // 5分钟缓存
  }

  // 3. 创建传感器
  static async createSensor(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      sensor_id, dtu_id, icon = '/image/传感器图片.png', sensor_name, 
      sensor_type = null, decimal_places = null, unit = null, sort_order = null,
      upper_mapping_x1 = null, upper_mapping_y1 = null, upper_mapping_x2 = null, upper_mapping_y2 = null,
      lower_mapping_x1 = null, lower_mapping_y1 = null, lower_mapping_x2 = null, lower_mapping_y2 = null
    } = data;
    
    logger.debug('Creating sensor', { params: data });
    
    const [result] = await dbConnection.execute(
      `INSERT INTO sensors (
        sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
        upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
        lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
       upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
       lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2]
    );
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return result;
  }

  // 4. 更新传感器
  static async updateSensor(sensorId, data, connection = null) {
    const dbConnection = connection || db;
    const { 
      sensor_name, sensor_type, decimal_places, unit, sort_order,
      upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
      lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
    } = data;
    
    logger.debug('Updating sensor', { sensorId, data });
    
    // 检查传感器是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id FROM sensors WHERE sensor_id = ?',
      [sensorId]
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
    updateValues.push(sensorId);
    
    const [result] = await dbConnection.execute(
      `UPDATE sensors SET ${updateFields.join(', ')} WHERE sensor_id = ?`,
      updateValues
    );
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensor:.*', 'default');
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return { action: 'updated', affectedRows: result.affectedRows };
  }

  // 5. 删除传感器
  static async deleteSensor(sensorId, connection = null) {
    const dbConnection = connection || db;
    logger.debug('Deleting sensor', { sensorId });
    
    // 检查传感器是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id, dtu_id FROM sensors WHERE sensor_id = ?',
      [sensorId]
    );
    
    if (existingRows.length === 0) {
      throw new Error('传感器不存在');
    }
    
    // 删除传感器
    const [result] = await dbConnection.execute(
      'DELETE FROM sensors WHERE sensor_id = ?',
      [sensorId]
    );
    
    // 只有在非事务模式下才清除缓存
    if (!connection) {
      cache.deletePattern('sensor:.*', 'default');
      cache.deletePattern('sensors_by_dtu:.*', 'default');
    }
    
    return { action: 'deleted', affectedRows: result.affectedRows };
  }
}

module.exports = SensorData;
