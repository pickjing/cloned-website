const db = require('../services/database');
const logger = require('../utils/logger');

class MbRtuData {
  // ========================================
  // MB-RTU协议相关数据库操作
  // ========================================
  // 1. 创建MB-RTU协议
  // 2. 更新MB-RTU协议
  // 3. 查询MB-RTU协议
  // 4. 删除MB-RTU协议

  // 1. 创建MB-RTU协议
  static async create(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      dtu_id, 
      sensor_id, 
      slave_address = 1, 
      function_code = '04只读', 
      offset_value = 0, 
      data_format = '16位有符号数', 
      data_bits, 
      byte_order_value, 
      collection_cycle = 2 
    } = data;
    
    logger.debug('Creating MB RTU', { params: data });
    
    const [result] = await dbConnection.execute(
      `INSERT INTO mb_rtu (
        dtu_id, sensor_id, slave_address, function_code, offset_value, 
        data_format, data_bits, byte_order_value, collection_cycle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dtu_id, sensor_id, slave_address, function_code, offset_value, 
       data_format, data_bits || null, byte_order_value || null, collection_cycle]
    );
    return result;
  }

  // 2. 更新MB-RTU协议
  static async update(data, connection = null) {
    const dbConnection = connection || db;
    
    logger.debug('Updating MB RTU', { data });
    
    // 统一处理：将单个对象转换为数组
    const configs = Array.isArray(data) ? data : [data];
    const results = [];
    
    for (const config of configs) {
      try {
        const result = await this.updateOne(config, dbConnection);
        results.push({
          success: true,
          dtu_id: config.dtu_id,
          sensor_id: config.sensor_id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          dtu_id: config.dtu_id,
          sensor_id: config.sensor_id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // 更新单个MB-RTU协议
  static async updateOne(config, connection = null) {
    const dbConnection = connection || db;
    const { 
      dtu_id,
      sensor_id,
      slave_address, 
      function_code, 
      offset_value, 
      data_format, 
      data_bits, 
      byte_order_value, 
      collection_cycle 
    } = config;
    
    logger.debug('Updating one MB RTU', { config });
    
    // 检查DTU和传感器是否存在
    const [dtuRows] = await dbConnection.execute('SELECT id FROM dtu_devices WHERE dtu_id = ?', [dtu_id]);
    if (dtuRows.length === 0) {
      throw new Error('DTU设备不存在');
    }
    
    const [sensorRows] = await dbConnection.execute('SELECT id FROM sensors WHERE sensor_id = ? AND dtu_id = ?', [sensor_id, dtu_id]);
    if (sensorRows.length === 0) {
      throw new Error('传感器不存在或不属于该DTU设备');
    }
    
    // 检查协议是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?',
      [dtu_id, sensor_id]
    );
    
    if (existingRows.length === 0) {
      throw new Error('MB-RTU协议不存在');
    }
    
    // 更新现有协议
    const updateFields = [];
    const updateValues = [];
    
    if (slave_address !== undefined) {
      updateFields.push('slave_address = ?');
      updateValues.push(slave_address);
    }
    if (function_code !== undefined) {
      updateFields.push('function_code = ?');
      updateValues.push(function_code);
    }
    if (offset_value !== undefined) {
      updateFields.push('offset_value = ?');
      updateValues.push(offset_value);
    }
    if (data_format !== undefined) {
      updateFields.push('data_format = ?');
      updateValues.push(data_format);
    }
    if (data_bits !== undefined) {
      updateFields.push('data_bits = ?');
      updateValues.push(data_bits);
    }
    if (byte_order_value !== undefined) {
      updateFields.push('byte_order_value = ?');
      updateValues.push(byte_order_value);
    }
    if (collection_cycle !== undefined) {
      updateFields.push('collection_cycle = ?');
      updateValues.push(collection_cycle);
    }
    
    if (updateFields.length === 0) {
      throw new Error('没有提供要更新的字段');
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(dtu_id, sensor_id);
    
    const [result] = await dbConnection.execute(
      `UPDATE mb_rtu SET ${updateFields.join(', ')} WHERE dtu_id = ? AND sensor_id = ?`,
      [...updateValues]
    );
    
    return result;
  }

  // 3. 查询MB-RTU协议
  static async get(params = {}, connection = null) {
    const dbConnection = connection || db;
    const { dtu_id, sensor_id } = params;
    
    logger.debug('Getting MB RTU configs', { dtu_id, sensor_id });
    
    // 如果传递了dtu_id和sensor_id，查询指定传感器的MB-RTU协议
    if (dtu_id && sensor_id) {
      const [rows] = await dbConnection.execute(
        `SELECT * FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?`,
        [dtu_id, sensor_id]
      );
      
      if (rows.length === 0) {
        throw new Error('MB-RTU协议不存在');
      }
      
      return rows[0];
    }
    
    // 如果只传递了dtu_id，查询该DTU下的所有MB-RTU协议
    if (dtu_id && !sensor_id) {
      const [rows] = await dbConnection.execute(
        `SELECT * FROM mb_rtu WHERE dtu_id = ? ORDER BY sensor_id`,
        [dtu_id]
      );
      return rows;
    }
    
    // 如果都没传递，返回空数组
    return [];
  }

}

module.exports = MbRtuData;
