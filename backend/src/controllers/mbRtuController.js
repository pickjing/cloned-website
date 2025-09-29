const MbRtuData = require('../models/mbRtuData');
const { asyncHandler } = require('../middleware/errorHandler');

class MbRtuController {
  // ========================================
  // MB-RTU协议相关操作
  // ========================================
  // 1. 查询MB-RTU协议
  // 2. 更新MB-RTU协议

  // 1. 查询MB-RTU协议
  static get = asyncHandler(async (req, res) => {
    const { dtuId, sensorId } = req.query;
    
    const params = {
      dtuId,
      sensorId
    };
    
    const result = await MbRtuData.get(params);
    
    res.json({
      success: true,
      data: result
    });
  });

  // 2. 更新MB-RTU协议
  static update = asyncHandler(async (req, res) => {
    const data = req.body['mb-rtu'];
    
    const result = await MbRtuData.update(data);
    
    // 统计成功和失败的数量
    const successCount = result.filter(r => r.success).length;
    const failCount = result.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `更新完成：成功${successCount}个，失败${failCount}个`,
      data: result
    });
  });
}

module.exports = MbRtuController;
