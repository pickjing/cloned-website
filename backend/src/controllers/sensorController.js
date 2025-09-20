const SensorData = require('../models/sensorData');
const MbRtuData = require('../models/mbRtuData');
const TransactionService = require('../services/transaction');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class SensorController {
  // ========================================
  // 传感器管理相关操作
  // ========================================
  // 1. 根据DTU设备ID获取连接的传感器详情
  // 2. 根据传感器ID获取传感器详情
  // 3. 创建传感器
  // 4. 更新传感器
  // 5. 删除传感器

  // 1. 根据DTU设备ID获取连接的传感器详情
  static getSensorsByDTUId = asyncHandler(async (req, res) => {
    const { dtuId } = req.params;
    const sensors = await SensorData.getSensorsByDTUId(dtuId);
    
    res.json({ success: true, data: sensors });
  });

  // 2. 根据传感器ID获取传感器详情
  static getSensorById = asyncHandler(async (req, res) => {
    const { sensorId } = req.params;
    const sensor = await SensorData.getSensorById(sensorId);
    
    res.json({ success: true, data: sensor });
  });

  // 3. 创建传感器
  static createSensor = asyncHandler(async (req, res) => {
    const { mbRtuConfig, ...sensorData } = req.body;
    
    // 使用事务确保传感器和MB-RTU协议的创建是原子性的
    const result = await TransactionService.execute(async (connection) => {
      // 1. 创建传感器
      const sensorResult = await SensorData.createSensor(sensorData, connection);
      
      // 2. 创建MB-RTU协议（总是创建，使用提供的参数或默认参数）
      const mbRtuData = {
        dtu_id: sensorData.dtu_id,
        sensor_id: sensorData.sensor_id,
        ...mbRtuConfig  // 如果提供了配置就使用，否则使用 createMBRTU 中的默认值
      };
      
      await MbRtuData.createMBRTU(mbRtuData, connection);
      
      return sensorResult;
    });
    
    // 清除相关缓存
    const cache = require('../services/cache');
    cache.deletePattern('sensors_by_dtu:.*', 'default');
    
    res.json({ 
      success: true, 
      message: '传感器和MB-RTU协议创建成功',
      data: { id: result.insertId } 
    });
  });

  // 4. 更新传感器
  static updateSensor = asyncHandler(async (req, res) => {
    const { sensorId } = req.params;
    const result = await SensorData.updateSensor(sensorId, req.body);
    
    res.json({
      success: true,
      message: '传感器更新成功',
      data: result
    });
  });

  // 5. 删除传感器
  static deleteSensor = asyncHandler(async (req, res) => {
    const { sensorId } = req.params;
    
    // 使用事务确保传感器和MB-RTU协议的删除是原子性的
    const result = await TransactionService.execute(async (connection) => {
      // 1. 先获取传感器信息，用于删除对应的MB-RTU协议
      const sensor = await SensorData.getSensorById(sensorId, connection);
      
      // 2. 删除传感器
      const sensorResult = await SensorData.deleteSensor(sensorId, connection);
      
      // 3. 删除对应的MB-RTU协议
      try {
        await MbRtuData.deleteMBRTU(sensor.dtu_id, sensorId, connection);
      } catch (error) {
        // 如果MB-RTU协议不存在，记录日志但不影响删除流程
        logger.warn('MB-RTU协议不存在或已删除', { 
          dtuId: sensor.dtu_id, 
          sensorId, 
          error: error.message 
        });
      }
      
      return sensorResult;
    });
    
    // 清除相关缓存
    const cache = require('../services/cache');
    cache.deletePattern('sensor:.*', 'default');
    cache.deletePattern('sensors_by_dtu:.*', 'default');
    
    res.json({
      success: true,
      message: '传感器和MB-RTU协议删除成功',
      data: result
    });
  });
}

module.exports = SensorController;
