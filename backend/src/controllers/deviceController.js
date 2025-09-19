const DeviceData = require('../models/deviceData');
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, ConflictError, DatabaseError } = require('../utils/errors');
const logger = require('../utils/logger');

class DeviceController {
  // 获取所有DTU设备
  static getAllDTUDevices = asyncHandler(async (req, res) => {
    const { page, limit, group, status, search } = req.query;
    const params = { page, limit, group, status, search };
    const result = await DeviceData.getAllDTUDevices(params);
    res.json({ success: true, data: result });
  });

  // 根据DTU设备ID获取传感器列表
  static getSensorsByDTUId = asyncHandler(async (req, res) => {
    const { dtuId } = req.params;
    const sensors = await DeviceData.getSensorsByDTUId(dtuId);
    res.json({ success: true, data: sensors });
  });

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
  static createDTUDevice = asyncHandler(async (req, res) => {
    const result = await DeviceData.createDTUDevice(req.body);
    res.json({ success: true, data: { id: result.insertId } });
  });

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

  // 获取设备分组名称列表
  static async getDeviceGroupNames(req, res) {
    try {
      const groups = await DeviceData.getDeviceGroupsNames();
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
  static createGroup = asyncHandler(async (req, res) => {
    const { group_name, description } = req.body;
    
    // 检查分组名是否已存在
    const exists = await DeviceData.checkGroupNameExists(group_name.trim());
    if (exists) {
      throw new ConflictError('分组名已存在');
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
  });

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

  // 批量创建设备（包含传感器和MB-RTU配置）- 使用事务
  static createDeviceWithSensors = asyncHandler(async (req, res) => {
    const { deviceData, sensors, mbRtuConfigs } = req.body;
    
    // 验证必需数据
    if (!deviceData || !deviceData.device_id || !deviceData.device_name) {
      return res.status(400).json({ 
        success: false, 
        message: '设备数据不完整，请检查设备ID和设备名称' 
      });
    }

    if (!sensors || !Array.isArray(sensors)) {
      return res.status(400).json({ 
        success: false, 
        message: '传感器数据格式错误' 
      });
    }

    if (!mbRtuConfigs || !Array.isArray(mbRtuConfigs)) {
      return res.status(400).json({ 
        success: false, 
        message: 'MB-RTU配置数据格式错误' 
      });
    }

    try {
      const result = await DeviceData.createDeviceWithSensors(deviceData, sensors, mbRtuConfigs);
      
      res.json({ 
        success: true, 
        message: '设备创建成功',
        data: result
      });
    } catch (error) {
      logger.error('批量创建设备失败', {
        error: error.message,
        stack: error.stack,
        deviceData,
        sensorsCount: sensors.length,
        mbRtuConfigsCount: mbRtuConfigs.length
      });
      
      res.status(500).json({ 
        success: false, 
        message: `设备创建失败: ${error.message}` 
      });
    }
  });

  // 获取所有分组详细信息
  static getAllGroups = asyncHandler(async (req, res) => {
    const groups = await DeviceData.getAllGroups();
    res.json({ success: true, data: groups });
  });

  // 获取默认分组
  static getDefaultGroup = asyncHandler(async (req, res) => {
    const defaultGroup = await DeviceData.getDefaultGroup();
    if (!defaultGroup) {
      return res.status(404).json({ 
        success: false, 
        message: '默认分组不存在' 
      });
    }
    res.json({ success: true, data: defaultGroup });
  });

  // 根据ID获取分组
  static getGroupById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const group = await DeviceData.getGroupById(id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: '分组不存在' 
      });
    }
    res.json({ success: true, data: group });
  });

  // 更新分组
  static updateGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { group_name, description } = req.body;
    
    // 检查新名称是否与其他分组重复
    const exists = await DeviceData.checkGroupNameExists(group_name.trim());
    if (exists) {
      // 检查是否是当前分组自己的名称
      const currentGroup = await DeviceData.getGroupById(id);
      if (!currentGroup || currentGroup.group_name !== group_name.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: '分组名已存在' 
        });
      }
    }
    
    const result = await DeviceData.updateGroup(id, {
      group_name: group_name.trim(),
      description: description || ''
    });
    
    res.json({ 
      success: true, 
      message: '分组更新成功',
      data: { id: parseInt(id), group_name: group_name.trim() }
    });
  });

  // 删除分组
  static deleteGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await DeviceData.deleteGroup(id);
    
    res.json({ 
      success: true, 
      message: `分组"${result.deletedGroupName}"删除成功，${result.movedDevicesCount}个设备已移至"${result.defaultGroupName}"分组`,
      data: result
    });
  });
}

module.exports = DeviceController;
