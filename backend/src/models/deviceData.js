const db = require('../services/database');

class DeviceData {
  // 获取所有设备数据
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM device_data ORDER BY time DESC');
    return rows;
  }

  // 根据设备ID获取数据
  static async getByDeviceId(deviceId) {
    const [rows] = await db.execute(
      'SELECT * FROM device_data WHERE device_id = ? ORDER BY time DESC',
      [deviceId]
    );
    return rows;
  }

  // 创建新数据
  static async create(data) {
    const { device_id, name, time, temperature } = data;
    const [result] = await db.execute(
      'INSERT INTO device_data (device_id, name, time, temperature) VALUES (?, ?, ?, ?)',
      [device_id, name, time, temperature]
    );
    return result;
  }

  // 获取设备列表
  static async getDeviceList() {
    const [rows] = await db.execute(
      'SELECT DISTINCT device_id, name FROM device_data ORDER BY device_id'
    );
    return rows;
  }
}

module.exports = DeviceData;