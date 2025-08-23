const DeviceData = require('./src/models/deviceData');

async function testDatabaseWrite() {
  try {
    console.log('开始测试数据库写入功能...');
    
    // 测试创建DTU设备
    const dtuData = {
      device_id: 'TEST_DTU_' + Date.now(),
      serial_number: 'TEST_SN_001',
      device_group: '测试分组',
      device_name: '测试DTU设备',
      device_image: '/image/设备图片.png',
      link_protocol: 'MB-RTU',
      offline_delay: 60,
      timezone_setting: '+08:00',
      longitude: 116.404,
      latitude: 39.915,
      status: '未连接'
    };
    
    console.log('测试DTU设备数据:', dtuData);
    
    const dtuResult = await DeviceData.createDTUDevice(dtuData);
    console.log('DTU设备创建成功:', dtuResult);
    
    // 测试创建传感器
    const sensorData = {
      sensor_id: 'TEST_SENSOR_' + Date.now(),
      dtu_id: dtuData.device_id,
      sensor_name: '测试传感器',
      sensor_type: '数值型',
      decimal_places: 2,
      unit: '°C',
      sort_order: 1,
      upper_mapping_x1: -32768,
      upper_mapping_y1: 32767,
      upper_mapping_x2: -2048,
      upper_mapping_y2: 2047.9,
      lower_mapping_x1: null,
      lower_mapping_y1: null,
      lower_mapping_x2: null,
      lower_mapping_y2: null
    };
    
    console.log('测试传感器数据:', sensorData);
    
    const sensorResult = await DeviceData.createSensor(sensorData);
    console.log('传感器创建成功:', sensorResult);
    
    console.log('所有测试通过！数据库写入功能正常。');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testDatabaseWrite();
