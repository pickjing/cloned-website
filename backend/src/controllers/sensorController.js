const SensorData = require('../models/sensorData');
const TransactionService = require('../services/transaction');
const { asyncHandler } = require('../middleware/errorHandler');

class SensorController {
  // ========================================
  // 传感器管理相关操作
  // ========================================
  // 1. 查询传感器
  // 2. 创建传感器
  // 3. 更新传感器
  // 4. 删除传感器

  // 1. 查询传感器
  static get = asyncHandler(async (req, res) => {
    const { dtu_id, sensor_id } = req.query;
    
    const params = {
      dtu_id,
      sensor_id
    };
    
    const result = await SensorData.get(params);
    
    // 如果查询单个传感器但返回null，说明传感器不存在
    if (sensor_id && result === null) {
      return res.status(404).json({
        success: false,
        message: '传感器不存在'
      });
    }
    
    res.json({ success: true, data: result });
  });

  // 2. 创建传感器
  static create = asyncHandler(async (req, res) => {
    const data = req.body.sensors;
    
    // 使用事务确保传感器和MB-RTU协议的创建是原子性的
    const result = await TransactionService.execute(async (connection) => {
      return await SensorData.create(data, connection);
    });
    
    // 清除相关缓存
    const cache = require('../services/cache');
    cache.deletePattern('sensors_by_dtu:.*', 'default');
    
    // 统计成功和失败的数量
    const successCount = result.filter(r => r.success).length;
    const failCount = result.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `创建完成：成功${successCount}个，失败${failCount}个`,
      data: result
    });
  });

  // 3. 更新传感器
  static update = asyncHandler(async (req, res) => {
    const data = req.body.sensors;
    
    const result = await SensorData.update(data);
    
    // 统计成功和失败的数量
    const successCount = result.filter(r => r.success).length;
    const failCount = result.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `更新完成：成功${successCount}个，失败${failCount}个`,
      data: result
    });
  });

  // 4. 删除传感器
  static delete = asyncHandler(async (req, res) => {
    const { sensor_ids } = req.body;
    
    // 如果sensor_ids为空数组，直接返回成功
    if (!sensor_ids || sensor_ids.length === 0) {
      return res.json({
        success: true,
        message: '传感器删除完成：没有需要删除的传感器',
        data: {
          deletedCount: 0,
          results: []
        }
      });
    }
    
    // 调用Data层进行批量删除（数据库级联删除确保原子性）
    const result = await SensorData.delete(sensor_ids);
    
    // 清除相关缓存
    const cache = require('../services/cache');
    cache.deletePattern('sensor:.*', 'default');
    cache.deletePattern('sensors_by_dtu:.*', 'default');
    
    // 统计成功和失败的数量
    const successCount = result.filter(r => r.success).length;
    const failCount = result.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `传感器删除完成：成功${successCount}个，失败${failCount}个`,
      data: {
        deletedCount: successCount,
        results: result
      }
    });
  });
}

module.exports = SensorController;
