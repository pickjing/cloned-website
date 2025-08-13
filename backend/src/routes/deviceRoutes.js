const express = require('express');
const DeviceController = require('../controllers/deviceController');

const router = express.Router();

// DTU设备相关路由
router.get('/dtu', DeviceController.getAllDTUDevices);
router.post('/dtu', DeviceController.createDTUDevice);
router.get('/dtu/:dtuId/sensors', DeviceController.getSensorsByDTUId);
router.get('/dtu/:dtuId/temperature', DeviceController.getTemperatureDataByDTUId);

// 传感器相关路由
router.post('/sensors', DeviceController.createSensor);
router.get('/sensors/:sensorId/temperature', DeviceController.getTemperatureDataBySensorId);
router.get('/sensors/:sensorId/trend', DeviceController.getTemperatureTrend);

// 温度数据相关路由
router.post('/temperature', DeviceController.createTemperatureData);

// DTU设备注册
router.post('/dtu/register', DeviceController.recordDTURegistration);

// 统计和监控相关路由
router.get('/statistics', DeviceController.getDeviceStatistics);
router.get('/temperature/abnormal', DeviceController.getAbnormalTemperatureData);

// 获取设备状态和设备分组选项
router.get('/options/status', DeviceController.getDeviceStatusOptions);
router.get('/options/groups', DeviceController.getDeviceGroupOptions);

module.exports = router;