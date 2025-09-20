const db = require('../services/database');
const logger = require('../utils/logger');

class MbRtuData {
  // 创建MB-RTU协议
  static async createMBRTU(data, connection = null) {
    const dbConnection = connection || db;
    const { 
      dtu_id, 
      sensor_id, 
      slave_address = 1, 
      function_code = '04只读', 
      offset_value = 0, 
      data_format = '16位有符号数', 
      data_bits = null, 
      byte_order_value = null, 
      collection_cycle = 2 
    } = data;
    
    logger.debug('Creating MB RTU', { params: data });
    
    const [result] = await dbConnection.execute(
      `INSERT INTO mb_rtu (
        dtu_id, sensor_id, slave_address, function_code, offset_value, 
        data_format, data_bits, byte_order_value, collection_cycle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dtu_id, sensor_id, slave_address, function_code, offset_value, 
       data_format, data_bits, byte_order_value, collection_cycle]
    );
    return result;
  }

  // 更新MB-RTU协议
  static async updateMBRTU(dtuId, sensorId, data, connection = null) {
    const dbConnection = connection || db;
    const { 
      slave_address, 
      function_code, 
      offset_value, 
      data_format, 
      data_bits, 
      byte_order_value, 
      collection_cycle 
    } = data;
    
    logger.debug('Updating MB RTU', { dtuId, sensorId, data });
    
    // 检查DTU和传感器是否存在
    const [dtuRows] = await dbConnection.execute('SELECT id FROM dtu_devices WHERE device_id = ?', [dtuId]);
    if (dtuRows.length === 0) {
      throw new Error('DTU设备不存在');
    }
    
    const [sensorRows] = await dbConnection.execute('SELECT id FROM sensors WHERE sensor_id = ? AND dtu_id = ?', [sensorId, dtuId]);
    if (sensorRows.length === 0) {
      throw new Error('传感器不存在或不属于该DTU设备');
    }
    
    // 检查协议是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?',
      [dtuId, sensorId]
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
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(dtuId, sensorId);
    
    const [result] = await dbConnection.execute(
      `UPDATE mb_rtu SET ${updateFields.join(', ')} WHERE dtu_id = ? AND sensor_id = ?`,
      updateValues
    );
    
    return { action: 'updated', affectedRows: result.affectedRows };
  }

  // 批量更新DTU下多个传感器的MB-RTU协议
  static async updateMBRTUs(dtuId, configs, connection = null) {
    const dbConnection = connection || db;
    logger.debug('Updating MB RTUs', { dtuId, configCount: configs.length });
    
    // 检查DTU是否存在
    const [dtuRows] = await dbConnection.execute('SELECT id FROM dtu_devices WHERE device_id = ?', [dtuId]);
    if (dtuRows.length === 0) {
      throw new Error('DTU设备不存在');
    }
    
    const results = [];
    
    for (const config of configs) {
      try {
        const result = await this.updateMBRTU(dtuId, config.sensor_id, config, dbConnection);
        results.push({
          sensor_id: config.sensor_id,
          success: true,
          action: result.action,
          ...result
        });
      } catch (error) {
        results.push({
          sensor_id: config.sensor_id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // 查询单个传感器的MB-RTU协议
  static async getMBRTU(dtuId, sensorId, connection = null) {
    const dbConnection = connection || db;
    logger.debug('Getting MB RTU config', { dtuId, sensorId });
    
    const [rows] = await dbConnection.execute(
      `SELECT * FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?`,
      [dtuId, sensorId]
    );
    
    if (rows.length === 0) {
      throw new Error('MB-RTU协议不存在');
    }
    
    return rows[0];
  }

  // 查询DTU下所有传感器的MB-RTU协议
  static async getMBRTUs(dtuId, connection = null) {
    const dbConnection = connection || db;
    logger.debug('Getting MB RTUs by DTU', { dtuId });
    
    const [rows] = await dbConnection.execute(
      `SELECT * FROM mb_rtu WHERE dtu_id = ? ORDER BY sensor_id`,
      [dtuId]
    );
    
    return rows;
  }

  // 删除MB-RTU协议
  static async deleteMBRTU(dtuId, sensorId, connection = null) {
    const dbConnection = connection || db;
    logger.debug('Deleting MB RTU', { dtuId, sensorId });
    
    // 检查DTU和传感器是否存在
    const [dtuRows] = await dbConnection.execute('SELECT id FROM dtu_devices WHERE device_id = ?', [dtuId]);
    if (dtuRows.length === 0) {
      throw new Error('DTU设备不存在');
    }
    
    const [sensorRows] = await dbConnection.execute('SELECT id FROM sensors WHERE sensor_id = ? AND dtu_id = ?', [sensorId, dtuId]);
    if (sensorRows.length === 0) {
      throw new Error('传感器不存在或不属于该DTU设备');
    }
    
    // 检查协议是否存在
    const [existingRows] = await dbConnection.execute(
      'SELECT id FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?',
      [dtuId, sensorId]
    );
    
    if (existingRows.length === 0) {
      throw new Error('MB-RTU协议不存在');
    }
    
    // 删除协议
    const [result] = await dbConnection.execute(
      'DELETE FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?',
      [dtuId, sensorId]
    );
    
    return { action: 'deleted', affectedRows: result.affectedRows };
  }
}

module.exports = MbRtuData;
