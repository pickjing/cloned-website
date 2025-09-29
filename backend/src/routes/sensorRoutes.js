const express = require('express');
const SensorController = require('../controllers/sensorController');
const {
  validateCreate,
  validateUpdate,
  validateQuery,
  validateDelete
} = require('../middleware/sensorValidation');

const router = express.Router();

// ========================================
// 传感器管理相关路由
// ========================================

// 查询传感器
router.get('/get', validateQuery, SensorController.get);

// 创建传感器
router.post('/create', validateCreate, SensorController.create);

// 更新传感器
router.put('/update', validateUpdate, SensorController.update);

// 删除传感器
router.delete('/delete', validateDelete, SensorController.delete);

module.exports = router;
