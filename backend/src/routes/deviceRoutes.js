const express = require('express');
const DeviceController = require('../controllers/deviceController');

const router = express.Router();

// 获取所有设备数据
router.get('/data', DeviceController.getAllData);

// 获取设备列表
router.get('/devices', DeviceController.getDeviceList);

// 根据设备ID获取数据
router.get('/data/:deviceId', DeviceController.getDataByDevice);

// 创建新数据
router.post('/data', DeviceController.createData);

module.exports = router;