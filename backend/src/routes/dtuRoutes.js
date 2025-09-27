const express = require('express');
const DeviceController = require('../controllers/dtuController');
const {
  validateDTUDevice,
  validateSensorData,
  validatePagination,
  validateDeviceId,
  validateBatchOperation,
  validateMoveToGroup
} = require('../middleware/commonValidation');
const {
  
} = require('../middleware/dtuValidation');
const router = express.Router();

// ========================================
// DTU设备管理相关路由
// ========================================

// 创建DTU设备

// 复制DTU设备

// 获取所有DTU设备

// 根据ID获取DTU设备

// 软删除DTU设备

// 硬删除DTU设备

// 恢复DTU设备

module.exports = router;