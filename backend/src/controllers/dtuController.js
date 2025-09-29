const DtuData = require('../models/dtuData');
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
    const result = await DtuData.create(data);
    
    res.status(201).json({
      success: true,
      message: 'DTU设备创建成功',
      data: result
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
    const { dtu_id } = req.body;
    
    if (!dtu_id) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的DTU设备ID'
      });
    }
    
    const result = await DtuData.delete({ dtu_id });
    
    res.json({
      success: true,
      message: 'DTU设备删除成功',
      data: result
    });
  });
}

module.exports = DtuController;
