const MbRtuData = require('../models/mbRtuData');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class MbRtuController {
  // ========================================
  // MB-RTU协议相关操作
  // ========================================
  // 1. 创建MB-RTU协议
  // 2. 更新单个传感器的MB-RTU协议
  // 3. 批量更新DTU下多个传感器的MB-RTU协议
  // 4. 查询单个传感器的MB-RTU协议
  // 5. 查询DTU下所有传感器的MB-RTU协议
  // 6. 删除MB-RTU协议

  // 1. 创建MB-RTU协议
  static async createMBRTU(req, res) {
    try {
      const result = await MbRtuData.createMBRTU(req.body);
      res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      console.error('创建MB RTU协议配置失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. 更新单个传感器的MB-RTU协议
  static updateMBRTU = asyncHandler(async (req, res) => {
    const { dtuId, sensorId } = req.params;
    const result = await MbRtuData.updateMBRTU(dtuId, sensorId, req.body);
    
    res.json({
      success: true,
      message: 'MB-RTU协议更新成功',
      data: result
    });
  });

  // 3. 批量更新DTU下多个传感器的MB-RTU协议
  static updateMBRTUs = asyncHandler(async (req, res) => {
    const { dtuId } = req.params;
    const { configs } = req.body;
    
    const results = await MbRtuData.updateMBRTUs(dtuId, configs);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `批量更新完成：成功${successCount}个，失败${failCount}个`,
      data: results
    });
  });

  // 4. 查询单个传感器的MB-RTU协议
  static getMBRTU = asyncHandler(async (req, res) => {
    const { dtuId, sensorId } = req.params;
    const config = await MbRtuData.getMBRTU(dtuId, sensorId);
    
    res.json({
      success: true,
      data: config
    });
  });

  // 5. 查询DTU下所有传感器的MB-RTU协议
  static getMBRTUs = asyncHandler(async (req, res) => {
    const { dtuId } = req.params;
    const configs = await MbRtuData.getMBRTUs(dtuId);
    
    res.json({
      success: true,
      data: configs
    });
  });

  // 6. 删除MB-RTU协议
  static deleteMBRTU = asyncHandler(async (req, res) => {
    const { dtuId, sensorId } = req.params;
    const result = await MbRtuData.deleteMBRTU(dtuId, sensorId);
    
    res.json({
      success: true,
      message: 'MB-RTU协议删除成功',
      data: result
    });
  });
}

module.exports = MbRtuController;
