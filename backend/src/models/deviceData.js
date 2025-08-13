const db = require('../services/database');

class DeviceData {
  // 获取所有DTU设备
  static async getAllDTUDevices() {
    const [rows] = await db.execute('SELECT * FROM dtu_devices ORDER BY created_at DESC');
    return rows;
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
      SELECT td.*, s.sensor_name, s.location_description, s.installation_depth
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
    const { dtu_id, device_name, location, gps_coordinates, status } = data;
    const [result] = await db.execute(
      'INSERT INTO dtu_devices (dtu_id, device_name, location, gps_coordinates, status) VALUES (?, ?, ?, ?, ?)',
      [dtu_id, device_name, location, gps_coordinates, status]
    );
    return result;
  }

  // 创建传感器
  static async createSensor(data) {
    const { sensor_id, dtu_id, sensor_name, sensor_type, location_description, installation_depth, status } = data;
    const [result] = await db.execute(
      'INSERT INTO sensors (sensor_id, dtu_id, sensor_name, sensor_type, location_description, installation_depth, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sensor_id, dtu_id, sensor_name, sensor_type, location_description, installation_depth, status]
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
      SELECT td.*, s.sensor_name, s.location_description
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
}

module.exports = DeviceData;