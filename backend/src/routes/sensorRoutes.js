const express = require('express');
const SensorController = require('../controllers/sensorController');
const {
  validateDeviceId
} = require('../middleware/commonValidation');
const {
  validateSensor,
  validateSensorId
} = require('../middleware/sensorValidation');

const router = express.Router();

// ========================================
// 传感器管理相关路由
// ========================================

// 根据DTU设备ID获取连接的传感器详情
router.get('/dtu/:dtuId', validateDeviceId, SensorController.getSensorsByDTUId);

// 根据传感器ID获取传感器详情
router.get('/:sensorId', validateSensorId, SensorController.getSensorById);

// 创建传感器
router.post('/', validateSensor, SensorController.createSensor);

// 更新传感器
router.put('/:sensorId', validateSensorId, validateSensor, SensorController.updateSensor);

// 删除传感器
router.delete('/:sensorId', validateSensorId, SensorController.deleteSensor);

module.exports = router;
