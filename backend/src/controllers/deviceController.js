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

  // 获取设备状态选项
  static async getDeviceStatusOptions(req, res) {
    try {
      const statusOptions = ['已连接', '未连接', '已删除', '已禁用'];
      res.json({ success: true, data: statusOptions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 获取设备分组选项
  static async getDeviceGroupOptions(req, res) {
    try {
      const groups = await DeviceData.getDeviceGroups();
      res.json({ success: true, data: groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 检查分组名是否存在
  static async checkGroupNameExists(req, res) {
    try {
      const { group_name } = req.query;
      if (!group_name) {
        return res.status(400).json({ success: false, message: '分组名不能为空' });
      }
      
      const exists = await DeviceData.checkGroupNameExists(group_name);
      res.json({ success: true, data: { exists } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建新分组
  static async createGroup(req, res) {
    try {
      const { group_name, description } = req.body;
      
      if (!group_name || group_name.trim() === '') {
        return res.status(400).json({ success: false, message: '分组名不能为空' });
      }
      
      // 检查分组名是否已存在
      const exists = await DeviceData.checkGroupNameExists(group_name.trim());
      if (exists) {
        return res.status(400).json({ success: false, message: '分组名已存在' });
      }
      
      const result = await DeviceData.createGroup({
        group_name: group_name.trim(),
        description: description || ''
      });
      
      res.json({ 
        success: true, 
        message: '分组创建成功',
        data: { id: result.insertId, group_name: group_name.trim() }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = DeviceController;
