const express = require('express');
const DeviceController = require('../controllers/deviceController');
const {
  validateDTUDevice,
  validateSensorData,
  validatePagination,
  validateDeviceId,
  validateBatchOperation,
  validateMoveToGroup
} = require('../middleware/commonValidation');
const {
  validateSensorId
} = require('../middleware/sensorValidation');
const router = express.Router();

// DTU设备相关路由
router.get('/dtu', validatePagination, DeviceController.getAllDTUDevices);
router.post('/dtu', validateDTUDevice, DeviceController.createDTUDevice);
router.get('/dtu/:dtuId/temperature', validateDeviceId, DeviceController.getTemperatureDataByDTUId);

// 设备管理高级功能
router.post('/dtu/copy', validateBatchOperation, DeviceController.copyDTUDevices);
router.post('/dtu/delete', validateBatchOperation, DeviceController.deleteDTUDevices);
router.post('/dtu/restore', validateBatchOperation, DeviceController.restoreDTUDevices);
router.post('/dtu/permanently-delete', validateBatchOperation, DeviceController.permanentlyDeleteDTUDevices);
router.post('/dtu/reset', validateBatchOperation, DeviceController.resetDTUDevices);
router.post('/dtu/move-to-group', validateMoveToGroup, DeviceController.moveDevicesToGroup);

router.get('/sensors/:sensorId/temperature', validateSensorId, DeviceController.getTemperatureDataBySensorId);
router.get('/sensors/:sensorId/trend', validateSensorId, DeviceController.getTemperatureTrend);


// 传感器数据相关路由
router.post('/temperature', validateSensorData, DeviceController.createTemperatureData);

// DTU设备注册
router.post('/dtu/register', DeviceController.recordDTURegistration);

// 统计和监控相关路由
router.get('/statistics', DeviceController.getDeviceStatistics);
router.get('/temperature/abnormal', DeviceController.getAbnormalTemperatureData);

// 获取设备状态选项
router.get('/options/status', DeviceController.getDeviceStatusOptions);

// 批量创建设备（包含传感器和MB-RTU配置）
router.post('/device-with-sensors', DeviceController.createDeviceWithSensors);



module.exports = router;