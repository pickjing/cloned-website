const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试恢复设备功能（无需确认）
async function testRestoreNoConfirm() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试恢复设备功能（无需确认） ===\n');
    
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
    
    // 2. 查找已删除的设备
    let deletedDevices = devices.filter(d => d.status === '已删除');
    
    if (deletedDevices.length === 0) {
      console.log('\n没有已删除的设备可供测试，先创建一个设备并删除...');
      
      // 创建一个测试设备
      const deviceId = 'DTU_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const deviceData = {
        device_id: deviceId,
        device_name: '恢复测试设备',
        serial_number: 'TEST_RESTORE_' + Date.now(),
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
        
        // 软删除设备
        console.log('\n软删除测试设备...');
        const deleteResponse = await fetch(`${baseUrl}/dtu/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_ids: [deviceId] })
        });
        
        const deleteData = await deleteResponse.json();
        
        if (deleteData.success) {
          console.log('✅ 设备软删除成功');
        } else {
          console.error('❌ 设备软删除失败:', deleteData.message);
          return;
        }
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
    deletedDevices = updatedDevices.filter(d => d.status === '已删除');
    
    if (deletedDevices.length === 0) {
      console.log('仍然没有已删除的设备');
      return;
    }
    
    const testDevice = deletedDevices[0];
    console.log(`选择测试设备: ${testDevice.device_name} (${testDevice.device_id})`);
    
    // 4. 直接恢复设备（无需确认）
    console.log('\n3. 直接恢复设备（无需确认）...');
    const restoreResponse = await fetch(`${baseUrl}/dtu/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
    });
    
    const restoreData = await restoreResponse.json();
    
    if (restoreData.success) {
      console.log('✅ 设备恢复成功!');
      console.log(`消息: ${restoreData.message}`);
    } else {
      console.error('❌ 设备恢复失败:', restoreData.message);
      return;
    }
    
    // 5. 验证恢复结果
    console.log('\n4. 验证恢复结果...');
    const finalDevicesResponse = await fetch(`${baseUrl}/dtu`);
    const finalDevicesData = await finalDevicesResponse.json();
    
    if (finalDevicesData.success) {
      const finalDevices = finalDevicesData.data.devices || [];
      const restoredDevice = finalDevices.find(d => d.device_id === testDevice.device_id);
      
      if (restoredDevice && restoredDevice.status === '未连接') {
        console.log('✅ 设备已成功恢复为"未连接"状态');
        console.log(`设备: ${restoredDevice.device_name} - 状态: ${restoredDevice.status}`);
      } else {
        console.log('❌ 设备恢复状态不正确');
        console.log(`设备状态: ${restoredDevice ? restoredDevice.status : '未找到'}`);
      }
    }
    
    console.log('\n=== 恢复设备测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testRestoreNoConfirm();
