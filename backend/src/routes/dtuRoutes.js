const express = require('express');
const DtuController = require('../controllers/dtuController');
const {
  validateIds,
  validateData,
  validateQuery
} = require('../middleware/dtuValidation');
const {
  validateCreate: validateSensorCreate
} = require('../middleware/sensorValidation');

const router = express.Router();

// ========================================
// DTU设备管理相关路由
// ========================================

// 创建DTU设备
router.post('/create', validateData, validateSensorCreate, DtuController.create);

// 复制DTU设备
router.post('/copy', validateIds, DtuController.copy);

// 获取DTU设备
router.get('/get', validateQuery, DtuController.get);

// 更新DTU设备
router.put('/update', validateData, DtuController.update);

// 删除DTU设备
router.delete('/delete', validateIds, DtuController.delete);


module.exports = router;