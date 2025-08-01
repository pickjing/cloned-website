const DeviceData = require('../models/deviceData');

class DeviceController {
  // 获取所有设备数据
  static async getAllData(req, res) {
    try {
      const data = await DeviceData.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 根据设备ID获取数据
  static async getDataByDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const data = await DeviceData.getByDeviceId(deviceId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建新数据
  static async createData(req, res) {
    try {
      const result = await DeviceData.create(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 获取设备列表
  static async getDeviceList(req, res) {
    try {
      const devices = await DeviceData.getDeviceList();
      res.json({ success: true, data: devices });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = DeviceController;
