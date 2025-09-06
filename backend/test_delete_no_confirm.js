const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试删除设备功能（无需成功提示）
async function testDeleteNoConfirm() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试删除设备功能（无需成功提示） ===\n');
    
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
    
    // 2. 查找未删除的设备
    let activeDevices = devices.filter(d => d.status !== '已删除');
    
    if (activeDevices.length === 0) {
      console.log('\n没有未删除的设备可供测试，先创建一个设备...');
      
      // 创建一个测试设备
      const deviceId = 'DTU_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const deviceData = {
        device_id: deviceId,
        device_name: '删除测试设备',
        serial_number: 'TEST_DELETE_' + Date.now(),
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
    activeDevices = updatedDevices.filter(d => d.status !== '已删除');
    
    if (activeDevices.length === 0) {
      console.log('仍然没有未删除的设备');
      return;
    }
    
    const testDevice = activeDevices[0];
    console.log(`选择测试设备: ${testDevice.device_name} (${testDevice.device_id})`);
    
    // 4. 测试软删除（无需成功提示）
    console.log('\n3. 测试软删除（无需成功提示）...');
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
    
    // 5. 验证软删除结果
    console.log('\n4. 验证软删除结果...');
    const verifyResponse = await fetch(`${baseUrl}/dtu`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      const verifyDevices = verifyData.data.devices || [];
      const deletedDevice = verifyDevices.find(d => d.device_id === testDevice.device_id);
      
      if (deletedDevice && deletedDevice.status === '已删除') {
        console.log('✅ 设备已成功标记为"已删除"状态');
        console.log(`设备: ${deletedDevice.device_name} - 状态: ${deletedDevice.status}`);
      } else {
        console.log('❌ 设备删除状态不正确');
        console.log(`设备状态: ${deletedDevice ? deletedDevice.status : '未找到'}`);
      }
    }
    
    // 6. 测试恢复设备（无需成功提示）
    console.log('\n5. 测试恢复设备（无需成功提示）...');
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
    
    // 7. 验证恢复结果
    console.log('\n6. 验证恢复结果...');
    const finalResponse = await fetch(`${baseUrl}/dtu`);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const finalDevices = finalData.data.devices || [];
      const restoredDevice = finalDevices.find(d => d.device_id === testDevice.device_id);
      
      if (restoredDevice && restoredDevice.status === '未连接') {
        console.log('✅ 设备已成功恢复为"未连接"状态');
        console.log(`设备: ${restoredDevice.device_name} - 状态: ${restoredDevice.status}`);
      } else {
        console.log('❌ 设备恢复状态不正确');
        console.log(`设备状态: ${restoredDevice ? restoredDevice.status : '未找到'}`);
      }
    }
    
    console.log('\n=== 删除设备测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testDeleteNoConfirm();
