const DeviceData = require('../models/deviceData');

class DeviceController {
  // 获取所有DTU设备
  static async getAllDTUDevices(req, res) {
    try {
      const { page, limit, group, status, search } = req.query;
      const params = { page, limit, group, status, search };
      const result = await DeviceData.getAllDTUDevices(params);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('获取DTU设备失败:', error);
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

  // 根据传感器ID获取传感器数据
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

  // 根据DTU设备ID获取所有传感器的数据
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

  // 创建传感器数据
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

  // 获取传感器数据趋势
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

  // 获取异常数据
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

  // 复制DTU设备
  static async copyDTUDevices(req, res) {
    try {
      const { device_ids } = req.body;
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要复制的设备' });
      }
      
      const result = await DeviceData.copyDTUDevices(device_ids);
      
      // 只返回失败信息，不显示成功信息
      if (result.failed.length > 0) {
        const failedMessages = result.failed.map(f => `${f.deviceId}: ${f.reason}`).join('\n');
        return res.json({ 
          success: false, 
          message: `以下设备复制失败：\n${failedMessages}`,
          data: result 
        });
      }
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 软删除DTU设备（标记为已删除状态）
  static async deleteDTUDevices(req, res) {
    try {
      const { device_ids } = req.body;
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的设备' });
      }
      
      const result = await DeviceData.softDeleteDTUDevices(device_ids);
      res.json({ success: true, message: '设备已删除', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 恢复已删除的DTU设备
  static async restoreDTUDevices(req, res) {
    try {
      const { device_ids } = req.body;
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要恢复的设备' });
      }
      
      const result = await DeviceData.restoreDTUDevices(device_ids);
      res.json({ success: true, message: '设备恢复成功', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 彻底删除DTU设备（从数据库中永久删除）
  static async permanentlyDeleteDTUDevices(req, res) {
    try {
      const { device_ids } = req.body;
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要彻底删除的设备' });
      }
      
      const result = await DeviceData.permanentlyDeleteDTUDevices(device_ids);
      
      const message = `设备已彻底删除：删除了 ${result.affectedRows} 个设备、${result.deletedSensors} 个传感器、${result.deletedMbRtuConfig} 个协议配置，共 ${result.totalDeleted} 条记录`;
      
      res.json({ 
        success: true, 
        message: message, 
        data: result 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 重置DTU设备
  static async resetDTUDevices(req, res) {
    try {
      const { device_ids } = req.body;
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要重置的设备' });
      }
      
      const result = await DeviceData.resetDTUDevices(device_ids);
      res.json({ success: true, message: '设备重置成功', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 智能移动设备到分组（只移动分组不同的设备）
  static async moveDevicesToGroup(req, res) {
    try {
      const { device_ids, target_group } = req.body;
      
      if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要移动的设备' });
      }
      
      if (!target_group || target_group.trim() === '') {
        return res.status(400).json({ success: false, message: '目标分组不能为空' });
      }

      const result = await DeviceData.moveDevicesToGroup(device_ids, target_group.trim());
      
      res.json({ 
        success: true, 
        message: `成功移动 ${result.moved_count} 个设备到"${target_group}"分组`,
        moved_count: result.moved_count,
        skipped_count: result.skipped_count
      });
    } catch (error) {
      console.error('移动设备到分组失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 创建MB RTU协议配置
  static async createMBRTUConfig(req, res) {
    try {
      const result = await DeviceData.createMBRTUConfig(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      console.error('创建MB RTU协议配置失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 批量创建MB RTU协议配置
  static async createMBRTUConfigs(req, res) {
    try {
      const { configs } = req.body;
      if (!configs || !Array.isArray(configs) || configs.length === 0) {
        return res.status(400).json({ success: false, message: '配置数据不能为空' });
      }
      
      const results = [];
      for (const config of configs) {
        const result = await DeviceData.createMBRTUConfig(config);
        results.push({ id: result.insertId });
      }
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('批量创建MB RTU协议配置失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = DeviceController;
