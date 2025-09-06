const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试级联复制功能
async function testCascadeCopy() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试级联复制功能 ===\n');
    
    // 1. 获取所有设备
    console.log('1. 获取所有设备...');
    const devicesResponse = await fetch(`${baseUrl}/dtu`);
    const devicesData = await devicesResponse.json();
    
    if (!devicesData.success) {
      console.error('获取设备失败:', devicesData.message);
      return;
    }
    
    const devices = devicesData.data.devices || [];
    console.log(`找到 ${devices.length} 个设备`);
    
    // 显示设备状态
    console.log('\n设备状态信息:');
    devices.forEach(device => {
      console.log(`- ${device.device_name} (${device.device_id}): ${device.status}`);
    });
    
    // 2. 选择一个未删除的设备进行测试
    let testDevice = devices.find(d => d.status !== '已删除');
    
    if (!testDevice) {
      console.log('\n没有未删除的设备可供测试，先创建一个设备...');
      
      // 创建一个测试设备
      const deviceId = 'DTU_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const deviceData = {
        device_id: deviceId,
        device_name: '复制测试设备',
        serial_number: 'TEST_COPY_' + Date.now(),
        device_group: '测试分组',
        device_image: 'https://example.com/device.png',
        link_protocol: 'MB RTU',
        offline_delay: 300,
        timezone_setting: '+08:00',
        longitude: 120.123456,
        latitude: 30.123456,
        status: '未连接'
      };
      
      const createResponse = await fetch(`${baseUrl}/dtu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      
      const createData = await createResponse.json();
      
      if (createData.success) {
        console.log(`✅ 测试设备创建成功: ${deviceId}`);
      } else {
        console.error('❌ 创建设备失败:', createData.message);
        return;
      }
    }
    
    // 3. 重新获取设备列表
    console.log('\n2. 重新获取设备列表...');
    const updatedDevicesResponse = await fetch(`${baseUrl}/dtu`);
    const updatedDevicesData = await updatedDevicesResponse.json();
    const updatedDevices = updatedDevicesData.data.devices || [];
    const activeDevices = updatedDevices.filter(d => d.status !== '已删除');
    
    if (activeDevices.length === 0) {
      console.log('仍然没有未删除的设备');
      return;
    }
    
    testDevice = activeDevices[0];
    console.log(`选择测试设备: ${testDevice.device_name} (${testDevice.device_id})`);
    
    // 4. 检查设备的传感器和协议数据
    console.log('\n3. 检查设备相关数据...');
    
    // 检查传感器数据
    const sensorsResponse = await fetch(`${baseUrl}/dtu/${testDevice.device_id}/sensors`);
    const sensorsData = await sensorsResponse.json();
    
    if (sensorsData.success) {
      const sensors = sensorsData.data.sensors || [];
      console.log(`设备有 ${sensors.length} 个传感器`);
      sensors.forEach(sensor => {
        console.log(`  - 传感器: ${sensor.sensor_name} (${sensor.sensor_id})`);
      });
    }
    
    // 5. 执行级联复制
    console.log('\n4. 执行级联复制...');
    const copyResponse = await fetch(`${baseUrl}/dtu/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
    });
    
    const copyData = await copyResponse.json();
    
    if (copyData.success) {
      console.log('✅ 级联复制成功!');
      console.log('复制结果:', copyData.data);
      
      if (copyData.data.success) {
        copyData.data.success.forEach(result => {
          console.log(`  - 原设备: ${result.originalDeviceId}`);
          console.log(`  - 新设备: ${result.newDeviceId}`);
          console.log(`  - 新名称: ${result.newDeviceName}`);
          console.log(`  - 传感器数: ${result.sensorsCount}`);
        });
      }
      
      if (copyData.data.failed && copyData.data.failed.length > 0) {
        console.log('复制失败的设备:');
        copyData.data.failed.forEach(failed => {
          console.log(`  - ${failed.deviceId}: ${failed.reason}`);
        });
      }
      
      console.log(`总计复制传感器: ${copyData.data.totalSensors} 个`);
      console.log(`总计复制协议: ${copyData.data.totalConfigs} 个`);
    } else {
      console.error('❌ 级联复制失败:', copyData.message);
      return;
    }
    
    // 6. 验证复制结果
    console.log('\n5. 验证复制结果...');
    
    // 检查新设备是否出现在设备列表中
    const finalDevicesResponse = await fetch(`${baseUrl}/dtu`);
    const finalDevicesData = await finalDevicesResponse.json();
    
    if (finalDevicesData.success) {
      const finalDevices = finalDevicesData.data.devices || [];
      const copiedDevices = finalDevices.filter(d => d.device_name.includes('复制'));
      
      console.log(`找到 ${copiedDevices.length} 个复制的设备:`);
      copiedDevices.forEach(device => {
        console.log(`  - ${device.device_name} (${device.device_id}): ${device.status}`);
      });
      
      // 检查第一个复制设备的传感器
      if (copiedDevices.length > 0) {
        const firstCopiedDevice = copiedDevices[0];
        const copiedSensorsResponse = await fetch(`${baseUrl}/dtu/${firstCopiedDevice.device_id}/sensors`);
        const copiedSensorsData = await copiedSensorsResponse.json();
        
        if (copiedSensorsData.success) {
          const copiedSensors = copiedSensorsData.data.sensors || [];
          console.log(`\n复制设备 ${firstCopiedDevice.device_name} 的传感器:`);
          copiedSensors.forEach(sensor => {
            console.log(`  - ${sensor.sensor_name} (${sensor.sensor_id})`);
          });
        }
      }
    }
    
    console.log('\n=== 级联复制测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testCascadeCopy();
