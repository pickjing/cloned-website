const db = require('../services/database');

class DeviceData {
  // 获取所有DTU设备
  static async getAllDTUDevices(params = {}) {
    try {
      // 确保参数是有效的数字
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.max(1, parseInt(params.limit) || 20);
      const offset = (page - 1) * limit;
      
      console.log('getAllDTUDevices 参数:', { page, limit, offset, params });
      
      let whereClause = '';
      let queryParams = [];
      
      // 添加分组过滤
      if (params.group && params.group !== 'undefined' && params.group !== 'null' && params.group.trim() !== '') {
        whereClause += ' AND device_group = ?';
        queryParams.push(params.group.trim());
      }
      
      // 添加状态过滤
      if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status.trim() !== '') {
        whereClause += ' AND status = ?';
        queryParams.push(params.status.trim());
      }
      
      // 添加搜索过滤
      if (params.search && params.search !== 'undefined' && params.search !== 'null' && params.search.trim() !== '') {
        whereClause += ' AND (device_name LIKE ? OR device_id LIKE ? OR serial_number LIKE ?)';
        const searchPattern = `%${params.search.trim()}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      // 构建完整的WHERE子句
      if (whereClause) {
        whereClause = 'WHERE ' + whereClause.substring(5); // 移除开头的 ' AND '
      }
      
      // 获取总数量
      let countQuery = 'SELECT COUNT(*) as total FROM dtu_devices';
      if (whereClause) {
        countQuery += ' ' + whereClause;
      }
      
      console.log('Count查询:', countQuery, '参数:', queryParams);
      
      let countResult;
      if (queryParams.length > 0) {
        [countResult] = await db.execute(countQuery, queryParams);
      } else {
        [countResult] = await db.execute(countQuery);
      }
      const total = countResult[0].total;
      
      // 获取分页数据
      let dataQuery = 'SELECT * FROM dtu_devices';
      if (whereClause) {
        dataQuery += ' ' + whereClause;
      }
      // 直接使用数字而不是占位符，避免MySQL2的参数问题
      dataQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      console.log('Data查询:', dataQuery, 'LIMIT/OFFSET参数:', [limit, offset]);
      
      let devices;
      // 由于LIMIT和OFFSET已经直接写在SQL中，只需要传递WHERE条件的参数
      if (queryParams.length > 0) {
        console.log('执行查询，WHERE参数:', queryParams);
        [devices] = await db.execute(dataQuery, queryParams);
      } else {
        console.log('执行查询，无WHERE参数');
        [devices] = await db.execute(dataQuery);
      }
      
      const result = {
        devices: devices || [],
        total: total || 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((total || 0) / limit)
      };
      
      console.log('查询结果:', result);
      return result;
      
    } catch (error) {
      console.error('获取DTU设备失败:', error);
      console.error('错误详情:', {
        code: error.code,
        errno: error.errno,
        sql: error.sql,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      
      // 返回空结果而不是抛出错误
      return {
        devices: [],
        total: 0,
        page: parseInt(params.page || 1),
        limit: parseInt(params.limit || 20),
        totalPages: 0
      };
    }
  }

  // 根据DTU设备ID获取传感器列表
  static async getSensorsByDTUId(dtuId) {
    const [rows] = await db.execute(
      'SELECT * FROM sensors WHERE dtu_id = ? ORDER BY sensor_id',
      [dtuId]
    );
    return rows;
  }

  // 根据传感器ID获取温度数据
  static async getTemperatureDataBySensorId(sensorId, limit = 100) {
    const [rows] = await db.execute(
      'SELECT * FROM temperature_data WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?',
      [sensorId, limit]
    );
    return rows;
  }

  // 根据DTU设备ID获取所有传感器的温度数据
  static async getTemperatureDataByDTUId(dtuId, limit = 100) {
    const [rows] = await db.execute(`
      SELECT td.*, s.sensor_name
      FROM temperature_data td
      JOIN sensors s ON td.sensor_id = s.sensor_id
      WHERE s.dtu_id = ?
      ORDER BY td.timestamp DESC
      LIMIT ?
    `, [dtuId, limit]);
    return rows;
  }

  // 创建DTU设备
  static async createDTUDevice(data) {
    const { 
      device_id, 
      serial_number, 
      device_group, 
      device_name, 
      device_image, 
      link_protocol, 
      offline_delay, 
      timezone_setting, 
      longitude, 
      latitude, 
      status 
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO dtu_devices (
        device_id, serial_number, device_group, device_name, device_image, 
        link_protocol, offline_delay, timezone_setting, longitude, latitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_id, serial_number, device_group, device_name, device_image, 
       link_protocol, offline_delay, timezone_setting, longitude, latitude, status]
    );
    return result;
  }

  // 创建传感器
  static async createSensor(data) {
    const { 
      sensor_id, dtu_id, icon = '/image/传感器图片.png', sensor_name, sensor_type, decimal_places, unit, sort_order,
      upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
      lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO sensors (
        sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
        upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
        lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
       upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
       lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2]
    );
    return result;
  }

  // 创建温度数据
  static async createTemperatureData(data) {
    const { sensor_id, temperature, timestamp, data_quality } = data;
    const [result] = await db.execute(
      'INSERT INTO temperature_data (sensor_id, temperature, timestamp, data_quality) VALUES (?, ?, ?, ?)',
      [sensor_id, temperature, timestamp, data_quality]
    );
    return result;
  }

  // 记录DTU设备注册
  static async recordDTURegistration(data) {
    const { dtu_id, registration_time, ip_address, signal_strength, battery_level } = data;
    const [result] = await db.execute(
      'INSERT INTO dtu_registrations (dtu_id, registration_time, ip_address, signal_strength, battery_level) VALUES (?, ?, ?, ?, ?)',
      [dtu_id, registration_time, ip_address, signal_strength, battery_level]
    );
    return result;
  }

  // 获取设备统计信息
  static async getDeviceStatistics() {
    const [dtuCount] = await db.execute('SELECT COUNT(*) as count FROM dtu_devices');
    const [sensorCount] = await db.execute('SELECT COUNT(*) as count FROM sensors');
    const [dataCount] = await db.execute('SELECT COUNT(*) as count FROM temperature_data');
    
    return {
      dtu_count: dtuCount[0].count,
      sensor_count: sensorCount[0].count,
      data_count: dataCount[0].count
    };
  }

  // 获取传感器温度趋势数据（最近24小时，每小时一个数据点）
  static async getTemperatureTrend(sensorId, hours = 24) {
    const [rows] = await db.execute(`
      SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
        AVG(temperature) as avg_temperature,
        MIN(temperature) as min_temperature,
        MAX(temperature) as max_temperature
      FROM temperature_data 
      WHERE sensor_id = ? 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY hour
      ORDER BY hour
    `, [sensorId, hours]);
    return rows;
  }

  // 获取异常温度数据（超出阈值范围）
  static async getAbnormalTemperatureData(minTemp = -10, maxTemp = 50) {
    const [rows] = await db.execute(`
      SELECT td.*, s.sensor_name
      FROM temperature_data td
      JOIN sensors s ON td.sensor_id = s.sensor_id
      WHERE td.temperature < ? OR td.temperature > ?
      ORDER BY td.timestamp DESC
      LIMIT 100
    `, [minTemp, maxTemp]);
    return rows;
  }

  // 获取设备分组
  static async getDeviceGroups() {
    const [rows] = await db.execute('SELECT group_name FROM device_groups ORDER BY group_name');
    return rows.map(row => row.group_name);
  }

  // 检查分组名是否存在
  static async checkGroupNameExists(groupName) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM device_groups WHERE group_name = ?',
      [groupName]
    );
    return rows[0].count > 0;
  }

  // 创建新分组
  static async createGroup(data) {
    const { group_name, description } = data;
    const [result] = await db.execute(
      'INSERT INTO device_groups (group_name, description) VALUES (?, ?)',
      [group_name, description]
    );
    return result;
  }

  // 创建MB RTU协议配置
  static async createMBRTUConfig(data) {
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
    
    console.log('创建MB RTU配置，参数:', {
      dtu_id, sensor_id, slave_address, function_code, offset_value, 
      data_format, data_bits, byte_order_value, collection_cycle
    });
    
    const [result] = await db.execute(
      `INSERT INTO mb_rtu_config (
        dtu_id, sensor_id, slave_address, function_code, offset_value, 
        data_format, data_bits, byte_order_value, collection_cycle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dtu_id, sensor_id, slave_address, function_code, offset_value, 
       data_format, data_bits, byte_order_value, collection_cycle]
    );
    return result;
  }
}

module.exports = DeviceData;