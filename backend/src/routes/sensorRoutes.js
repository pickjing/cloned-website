const express = require('express');
const SensorController = require('../controllers/sensorController');
const {
  validateData,
  validateQuery
} = require('../middleware/sensorValidation');

const router = express.Router();

// ========================================
// 传感器管理相关路由
// ========================================

// 查询传感器
router.get('/', validateQuery, SensorController.get);

// 创建传感器
router.post('/', validateData, SensorController.create);

// 更新传感器
router.put('/', validateData, SensorController.update);

// 删除传感器
router.delete('/', validateQuery, SensorController.delete);

module.exports = router;
