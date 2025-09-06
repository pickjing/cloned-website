const express = require('express');
const DeviceController = require('../controllers/deviceController');

const router = express.Router();

// DTU设备相关路由
router.get('/dtu', DeviceController.getAllDTUDevices);
router.post('/dtu', DeviceController.createDTUDevice);
router.get('/dtu/:dtuId/sensors', DeviceController.getSensorsByDTUId);
router.get('/dtu/:dtuId/temperature', DeviceController.getTemperatureDataByDTUId);

// 设备管理高级功能
router.post('/dtu/copy', DeviceController.copyDTUDevices);
router.post('/dtu/delete', DeviceController.deleteDTUDevices);
router.post('/dtu/restore', DeviceController.restoreDTUDevices);
router.post('/dtu/permanently-delete', DeviceController.permanentlyDeleteDTUDevices);
router.post('/dtu/reset', DeviceController.resetDTUDevices);
router.post('/dtu/move-to-group', DeviceController.moveDevicesToGroup);

// 传感器相关路由
router.post('/sensors', DeviceController.createSensor);
router.get('/sensors/:sensorId/temperature', DeviceController.getTemperatureDataBySensorId);
router.get('/sensors/:sensorId/trend', DeviceController.getTemperatureTrend);

// MB RTU协议配置相关路由
router.post('/mb-rtu-config', DeviceController.createMBRTUConfig);
router.post('/mb-rtu-configs', DeviceController.createMBRTUConfigs);

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

// 分组相关路由
router.get('/groups/check', DeviceController.checkGroupNameExists);
router.post('/groups', DeviceController.createGroup);

module.exports = router;