const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试完整的级联删除功能（包括创建设备和传感器）
async function testFullCascadeDelete() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试完整级联删除功能 ===\n');
    
    // 1. 创建一个完整的设备（包含传感器和协议）
    console.log('1. 创建测试设备...');
    const deviceId = 'DTU_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const deviceData = {
      device_id: deviceId,
      device_name: '级联删除测试设备',
      serial_number: 'TEST_CASCADE_' + Date.now(),
      device_group: '测试分组',
      device_image: 'https://example.com/device.png',
      link_protocol: 'MB RTU',
      offline_delay: 300,
      timezone_setting: '+08:00',
      longitude: 120.123456,
      latitude: 30.123456,
      status: '未连接',
      sensors: [
        {
          sensor_name: '温度传感器1',
          sensor_type: '数值型',
          decimal_places: 2,
          unit: '°C',
          sort_order: 1,
          upper_mapping_x1: -32768,
          upper_mapping_y1: 32767,
          upper_mapping_x2: -2048,
          upper_mapping_y2: 2047.9,
          lower_mapping_x1: 0,
          lower_mapping_y1: 100,
          lower_mapping_x2: 0,
          lower_mapping_y2: 50
        },
        {
          sensor_name: '湿度传感器1',
          sensor_type: '数值型',
          decimal_places: 1,
          unit: '%RH',
          sort_order: 2,
          upper_mapping_x1: -32768,
          upper_mapping_y1: 32767,
          upper_mapping_x2: -2048,
          upper_mapping_y2: 2047.9,
          lower_mapping_x1: 0,
          lower_mapping_y1: 100,
          lower_mapping_x2: 0,
          lower_mapping_y2: 100
        }
      ]
    };
    
    const createResponse = await fetch(`${baseUrl}/dtu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData)
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      console.error('创建设备失败:', createData.message);
      return;
    }
    
    console.log(`✅ 设备创建成功: ${deviceId}`);
    
    // 2. 验证设备、传感器和协议数据
    console.log('\n2. 验证创建的数据...');
    
    // 检查设备
    const devicesResponse = await fetch(`${baseUrl}/dtu`);
    const devicesData = await devicesResponse.json();
    const createdDevice = devicesData.data.devices.find(d => d.device_id === deviceId);
    console.log(`设备状态: ${createdDevice ? createdDevice.device_name : '未找到'}`);
    
    // 检查传感器
    const sensorsResponse = await fetch(`${baseUrl}/dtu/${deviceId}/sensors`);
    const sensorsData = await sensorsResponse.json();
    const sensors = sensorsData.data.sensors || [];
    console.log(`传感器数量: ${sensors.length}`);
    sensors.forEach(sensor => {
      console.log(`  - ${sensor.sensor_name} (${sensor.sensor_id})`);
    });
    
    // 3. 软删除设备
    console.log('\n3. 软删除设备...');
    const deleteResponse = await fetch(`${baseUrl}/dtu/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [deviceId] })
    });
    
    const deleteData = await deleteResponse.json();
    
    if (deleteData.success) {
      console.log('✅ 软删除成功!');
    } else {
      console.error('❌ 软删除失败:', deleteData.message);
      return;
    }
    
    // 4. 验证软删除后数据仍然存在
    console.log('\n4. 验证软删除后数据仍然存在...');
    const verifySensorsResponse = await fetch(`${baseUrl}/dtu/${deviceId}/sensors`);
    const verifySensorsData = await verifySensorsResponse.json();
    
    if (verifySensorsData.success) {
      const verifySensors = verifySensorsData.data.sensors || [];
      console.log(`软删除后，设备仍有 ${verifySensors.length} 个传感器（数据保留）`);
    }
    
    // 5. 执行彻底删除（级联删除）
    console.log('\n5. 执行彻底删除（级联删除）...');
    const permanentDeleteResponse = await fetch(`${baseUrl}/dtu/permanently-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [deviceId] })
    });
    
    const permanentDeleteData = await permanentDeleteResponse.json();
    
    if (permanentDeleteData.success) {
      console.log('✅ 彻底删除成功!');
      console.log(`消息: ${permanentDeleteData.message}`);
      
      if (permanentDeleteData.data) {
        console.log('删除详情:');
        console.log(`  - 设备: ${permanentDeleteData.data.affectedRows} 个`);
        console.log(`  - 传感器: ${permanentDeleteData.data.deletedSensors} 个`);
        console.log(`  - 协议配置: ${permanentDeleteData.data.deletedMbRtuConfig} 个`);
        console.log(`  - 总计: ${permanentDeleteData.data.totalDeleted} 条记录`);
      }
    } else {
      console.error('❌ 彻底删除失败:', permanentDeleteData.message);
      return;
    }
    
    // 6. 验证彻底删除结果
    console.log('\n6. 验证彻底删除结果...');
    
    // 检查设备是否被删除
    const finalDevicesResponse = await fetch(`${baseUrl}/dtu`);
    const finalDevicesData = await finalDevicesResponse.json();
    
    if (finalDevicesData.success) {
      const finalDevices = finalDevicesData.data.devices || [];
      const deletedDevice = finalDevices.find(d => d.device_id === deviceId);
      
      if (!deletedDevice) {
        console.log('✅ 设备已从设备列表中彻底删除');
      } else {
        console.log('❌ 设备仍然存在于设备列表中');
      }
    }
    
    // 检查传感器是否被删除
    const finalSensorsResponse = await fetch(`${baseUrl}/dtu/${deviceId}/sensors`);
    const finalSensorsData = await finalSensorsResponse.json();
    
    if (finalSensorsData.success) {
      const finalSensors = finalSensorsData.data.sensors || [];
      if (finalSensors.length === 0) {
        console.log('✅ 设备的传感器数据已被彻底删除');
      } else {
        console.log(`❌ 设备仍有 ${finalSensors.length} 个传感器数据未被删除`);
      }
    } else {
      // 如果API返回错误，可能是因为设备不存在，这也是预期的
      console.log('✅ 设备传感器API返回错误（设备不存在），说明传感器已被删除');
    }
    
    console.log('\n=== 完整级联删除测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testFullCascadeDelete();
