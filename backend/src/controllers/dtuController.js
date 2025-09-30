const DtuData = require('../models/dtuData');
const SensorData = require('../models/sensorData');
const TransactionService = require('../services/transaction');
const { asyncHandler } = require('../middleware/errorHandler');

class DtuController {
  // ========================================
  // DTU设备管理相关控制器方法
  // ========================================
  // 1. 创建DTU设备
  // 2. 复制DTU设备
  // 3. 查询DTU设备
  // 4. 更新DTU设备
  // 5. 删除DTU设备

  // 1. 创建DTU设备
  static create = asyncHandler(async (req, res) => {
    const data = req.body;
    const { sensors = [] } = data;
    
    // 1. 创建DTU设备
    const dtuResult = await DtuData.create(data);
    
    // 2. 如果有传感器数据，创建传感器
    let sensorResults = [];
    if (sensors && sensors.length > 0) {
      sensorResults = await SensorData.create(sensors);
    }
    
    // 统计传感器创建结果
    const successCount = sensorResults.filter(r => r.success).length;
    const failCount = sensorResults.filter(r => !r.success).length;
    
    res.status(201).json({
      success: true,
      message: `DTU设备创建成功，传感器：成功${successCount}个，失败${failCount}个`,
      data: {
        dtu: dtuResult,
        sensors: sensorResults
      }
    });
  });

  // 2. 复制DTU设备
  static copy = asyncHandler(async (req, res) => {
    const { dtu_ids } = req.body;
    
    if (!dtu_ids || !Array.isArray(dtu_ids) || dtu_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要复制的DTU设备ID列表'
      });
    }
    
    const results = await DtuData.copy({ dtu_ids });
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `DTU设备复制完成，成功：${successCount}个，失败：${failCount}个`,
      data: {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount
        }
      }
    });
  });

  // 3. 查询DTU设备
  static get = asyncHandler(async (req, res) => {
    const params = req.query;
    const result = await DtuData.get(params);
    
    res.json({
      success: true,
      message: 'DTU设备查询成功',
      data: result
    });
  });

  // 4. 更新DTU设备
  static update = asyncHandler(async (req, res) => {
    const data = req.body;
    const result = await DtuData.update(data);
    
    res.json({
      success: true,
      message: 'DTU设备更新成功',
      data: result
    });
  });

  // 5. 删除DTU设备
  static delete = asyncHandler(async (req, res) => {
    const { dtu_ids } = req.body;
    
    // 如果dtu_ids为空数组，直接返回成功
    if (!dtu_ids || dtu_ids.length === 0) {
      return res.json({
        success: true,
        message: 'DTU设备删除完成：没有需要删除的设备',
        data: {
          deletedCount: 0,
          results: []
        }
      });
    }
    
    // 调用Data层进行批量删除
    const results = await DtuData.delete(dtu_ids);
    
    // 统计成功和失败的数量
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `DTU设备删除完成：成功${successCount}个，失败${failCount}个`,
      data: {
        deletedCount: successCount,
        results
      }
    });
  });
}

module.exports = DtuController;
