const express = require('express');
const DeviceController = require('../controllers/deviceController');
const {
  validateDTUDevice,
  validateSensor,
  validateSensorData,
  validatePagination,
  validateDeviceId,
  validateSensorId,
  validateGroup,
  validateGroupUpdate,
  validateGroupId,
  validateBatchOperation,
  validateMoveToGroup,
  validateMBRTUConfig
} = require('../middleware/validation');

const router = express.Router();

// DTU设备相关路由
router.get('/dtu', validatePagination, DeviceController.getAllDTUDevices);
router.post('/dtu', validateDTUDevice, DeviceController.createDTUDevice);
router.get('/dtu/:dtuId/sensors', validateDeviceId, DeviceController.getSensorsByDTUId);
router.get('/dtu/:dtuId/temperature', validateDeviceId, DeviceController.getTemperatureDataByDTUId);

// 设备管理高级功能
router.post('/dtu/copy', validateBatchOperation, DeviceController.copyDTUDevices);
router.post('/dtu/delete', validateBatchOperation, DeviceController.deleteDTUDevices);
router.post('/dtu/restore', validateBatchOperation, DeviceController.restoreDTUDevices);
router.post('/dtu/permanently-delete', validateBatchOperation, DeviceController.permanentlyDeleteDTUDevices);
router.post('/dtu/reset', validateBatchOperation, DeviceController.resetDTUDevices);
router.post('/dtu/move-to-group', validateMoveToGroup, DeviceController.moveDevicesToGroup);

// 传感器相关路由
router.post('/sensors', validateSensor, DeviceController.createSensor);
router.get('/sensors/:sensorId/temperature', validateSensorId, DeviceController.getTemperatureDataBySensorId);
router.get('/sensors/:sensorId/trend', validateSensorId, DeviceController.getTemperatureTrend);

// MB RTU协议配置相关路由
router.post('/mb-rtu-config', validateMBRTUConfig, DeviceController.createMBRTUConfig);
router.post('/mb-rtu-configs', DeviceController.createMBRTUConfigs);

// 传感器数据相关路由
router.post('/temperature', validateSensorData, DeviceController.createTemperatureData);

// DTU设备注册
router.post('/dtu/register', DeviceController.recordDTURegistration);

// 统计和监控相关路由
router.get('/statistics', DeviceController.getDeviceStatistics);
router.get('/temperature/abnormal', DeviceController.getAbnormalTemperatureData);

// 获取设备状态选项
router.get('/options/status', DeviceController.getDeviceStatusOptions);

// 分组相关路由 - 集中管理
router.get('/groups/names', DeviceController.getDeviceGroupNames); // 获取分组名称列表（前端下拉列表）
router.get('/groups', DeviceController.getAllGroups); // 获取所有分组详细信息
router.get('/groups/check', DeviceController.checkGroupNameExists); // 检查分组名是否存在
router.get('/groups/default', DeviceController.getDefaultGroup); // 获取默认分组
router.get('/groups/:id', validateGroupId, DeviceController.getGroupById); // 根据ID获取分组
router.post('/groups', validateGroup, DeviceController.createGroup); // 创建分组
router.put('/groups/:id', validateGroupId, validateGroupUpdate, DeviceController.updateGroup); // 更新分组
router.delete('/groups/:id', validateGroupId, DeviceController.deleteGroup); // 删除分组

// 批量创建设备（包含传感器和MB-RTU配置）
router.post('/device-with-sensors', DeviceController.createDeviceWithSensors);

module.exports = router;