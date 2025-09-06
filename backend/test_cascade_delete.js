const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试级联删除功能
async function testCascadeDelete() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试级联删除功能 ===\n');
    
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
    
    if (devices.length === 0) {
      console.log('没有设备可供测试');
      return;
    }
    
    // 显示设备状态
    console.log('\n设备状态信息:');
    devices.forEach(device => {
      console.log(`- ${device.device_name} (${device.device_id}): ${device.status}`);
    });
    
    // 2. 选择一个设备进行测试
    const testDevice = devices.find(d => d.status !== '已删除') || devices[0];
    if (!testDevice) {
      console.log('没有可删除的设备');
      return;
    }
    
    console.log(`\n2. 测试设备: ${testDevice.device_name}`);
    
    // 3. 检查设备的传感器和协议数据
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
    
    // 4. 先软删除设备
    console.log('\n4. 软删除设备...');
    const deleteResponse = await fetch(`${baseUrl}/dtu/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
    });
    
    const deleteData = await deleteResponse.json();
    
    if (deleteData.success) {
      console.log('✅ 软删除成功!');
      console.log(`消息: ${deleteData.message}`);
    } else {
      console.error('❌ 软删除失败:', deleteData.message);
      return;
    }
    
    // 5. 验证软删除后的数据仍然存在
    console.log('\n5. 验证软删除后数据仍然存在...');
    const verifySensorsResponse = await fetch(`${baseUrl}/dtu/${testDevice.device_id}/sensors`);
    const verifySensorsData = await verifySensorsResponse.json();
    
    if (verifySensorsData.success) {
      const sensors = verifySensorsData.data.sensors || [];
      console.log(`软删除后，设备仍有 ${sensors.length} 个传感器（数据保留）`);
    }
    
    // 6. 执行彻底删除
    console.log('\n6. 执行彻底删除（级联删除）...');
    const permanentDeleteResponse = await fetch(`${baseUrl}/dtu/permanently-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
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
    
    // 7. 验证彻底删除结果
    console.log('\n7. 验证彻底删除结果...');
    
    // 检查设备是否被删除
    const finalDevicesResponse = await fetch(`${baseUrl}/dtu`);
    const finalDevicesData = await finalDevicesResponse.json();
    
    if (finalDevicesData.success) {
      const finalDevices = finalDevicesData.data.devices || [];
      const deletedDevice = finalDevices.find(d => d.device_id === testDevice.device_id);
      
      if (!deletedDevice) {
        console.log('✅ 设备已从设备列表中彻底删除');
      } else {
        console.log('❌ 设备仍然存在于设备列表中');
      }
    }
    
    // 检查传感器是否被删除
    const finalSensorsResponse = await fetch(`${baseUrl}/dtu/${testDevice.device_id}/sensors`);
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
    
    console.log('\n=== 级联删除测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testCascadeDelete();
