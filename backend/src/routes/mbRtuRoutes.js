const express = require('express');
const MbRtuController = require('../controllers/mbRtuController');
const {
  validateDeviceId
} = require('../middleware/commonValidation');
const {
  validateSensorId
} = require('../middleware/sensorValidation');
const {
  validateMBRTU,
  validateMBRTUs
} = require('../middleware/mbRtuValidation');

const router = express.Router();

// ========================================
// MB-RTU协议相关路由
// ========================================

// 查询单个传感器的MB-RTU协议
router.get('/:dtuId/:sensorId', validateDeviceId, validateSensorId, MbRtuController.getMBRTU);

// 更新单个传感器的MB-RTU协议
router.put('/:dtuId/:sensorId', validateDeviceId, validateSensorId, validateMBRTU, MbRtuController.updateMBRTU);

// 查询DTU下所有传感器的MB-RTU协议
router.get('/:dtuId', validateDeviceId, MbRtuController.getMBRTUs);

// 批量更新DTU下多个传感器的MB-RTU协议
router.put('/:dtuId', validateDeviceId, validateMBRTUs, MbRtuController.updateMBRTUs);

module.exports = router;
