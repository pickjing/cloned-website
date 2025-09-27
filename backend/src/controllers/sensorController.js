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
    const { dtuId, sensorId } = req.query;
    
    const params = {
      dtuId,
      sensorId
    };
    
    const result = await SensorData.get(params);
    
    res.json({ success: true, data: result });
  });

  // 2. 创建传感器
  static create = asyncHandler(async (req, res) => {
    const data = req.body;
    
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
    const data = req.body;
    
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
    const { sensorId, dtuId } = req.query;
    
    // 使用事务确保传感器和MB-RTU协议的删除是原子性的
    const result = await TransactionService.execute(async (connection) => {
      if (sensorId) {
        // 删除指定传感器
        const sensorData = [{ sensor_id: sensorId }];
        return await SensorData.delete(sensorData, connection);
      } else if (dtuId) {
        // 删除DTU连接的所有传感器
        // 1. 先获取该DTU的所有传感器
        const sensors = await SensorData.get({ dtuId }, connection);
        
        if (sensors.length === 0) {
          return [{
            success: true,
            message: '该DTU没有连接的传感器',
            deletedCount: 0
          }];
        }
        
        // 2. 批量删除传感器
        const sensorDataList = sensors.map(sensor => ({ sensor_id: sensor.sensor_id }));
        return await SensorData.delete(sensorDataList, connection);
      } else {
        throw new Error('必须提供sensorId或dtuId参数');
      }
    });
    
    // 清除相关缓存
    const cache = require('../services/cache');
    cache.deletePattern('sensor:.*', 'default');
    cache.deletePattern('sensors_by_dtu:.*', 'default');
    
    // 统计成功和失败的数量
    const successCount = result.filter(r => r.success).length;
    const failCount = result.filter(r => !r.success).length;
    
    if (sensorId) {
      res.json({
        success: true,
        message: '传感器和MB-RTU协议删除成功',
        data: result[0]
      });
    } else if (dtuId) {
      res.json({
        success: true,
        message: `删除完成：成功${successCount}个，失败${failCount}个`,
        data: {
          deletedCount: successCount,
          results: result
        }
      });
    }
  });
}

module.exports = SensorController;
