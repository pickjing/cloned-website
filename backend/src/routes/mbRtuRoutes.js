const express = require('express');
const MbRtuController = require('../controllers/mbRtuController');
const {
  validateMBRTU,
  validateMBRTUs
} = require('../middleware/mbRtuValidation');

const router = express.Router();

// ========================================
// MB-RTU协议相关路由
// ========================================

// 查询单个传感器的MB-RTU协议
router.get('/:dtuId/:sensorId', MbRtuController.getMBRTU);

// 更新单个传感器的MB-RTU协议
router.put('/:dtuId/:sensorId', validateMBRTU, MbRtuController.updateMBRTU);

// 查询DTU下所有传感器的MB-RTU协议
router.get('/:dtuId', MbRtuController.getMBRTUs);

// 批量更新DTU下多个传感器的MB-RTU协议
router.put('/:dtuId', validateMBRTUs, MbRtuController.updateMBRTUs);

module.exports = router;
