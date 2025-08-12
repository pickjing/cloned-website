const DeviceData = require('../models/deviceData');

class DeviceController {
  // 获取所有DTU设备
  static async getAllDTUDevices(req, res) {
    try {
      const devices = await DeviceData.getAllDTUDevices();
      res.json({ success: true, data: devices });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 根据DTU设备ID获取传感器列表
  static async getSensorsByDTUId(req, res) {
    try {
      const { dtuId } = req.params;
      const sensors = await DeviceData.getSensorsByDTUId(dtuId);
      res.json({ success: true, data: sensors });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 根据传感器ID获取温度数据
  static async getTemperatureDataBySensorId(req, res) {
    try {
      const { sensorId } = req.params;
      const { limit = 100 } = req.query;
      const data = await DeviceData.getTemperatureDataBySensorId(sensorId, parseInt(limit));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 根据DTU设备ID获取所有传感器的温度数据
  static async getTemperatureDataByDTUId(req, res) {
    try {
      const { dtuId } = req.params;
      const { limit = 100 } = req.query;
      const data = await DeviceData.getTemperatureDataByDTUId(dtuId, parseInt(limit));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建DTU设备
  static async createDTUDevice(req, res) {
    try {
      const result = await DeviceData.createDTUDevice(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建传感器
  static async createSensor(req, res) {
    try {
      const result = await DeviceData.createSensor(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建温度数据
  static async createTemperatureData(req, res) {
    try {
      const result = await DeviceData.createTemperatureData(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 记录DTU设备注册
  static async recordDTURegistration(req, res) {
    try {
      const result = await DeviceData.recordDTURegistration(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 获取设备统计信息
  static async getDeviceStatistics(req, res) {
    try {
      const stats = await DeviceData.getDeviceStatistics();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 获取传感器温度趋势数据
  static async getTemperatureTrend(req, res) {
    try {
      const { sensorId } = req.params;
      const { hours = 24 } = req.query;
      const data = await DeviceData.getTemperatureTrend(sensorId, parseInt(hours));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 获取异常温度数据
  static async getAbnormalTemperatureData(req, res) {
    try {
      const { minTemp = -10, maxTemp = 50 } = req.query;
      const data = await DeviceData.getAbnormalTemperatureData(
        parseFloat(minTemp), 
        parseFloat(maxTemp)
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = DeviceController;
