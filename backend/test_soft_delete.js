const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试软删除功能
async function testSoftDelete() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试软删除功能 ===\n');
    
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
    
    // 2. 选择一个设备进行软删除测试
    const testDevice = devices.find(d => d.status !== '已删除') || devices[0];
    if (!testDevice) {
      console.log('没有可删除的设备');
      return;
    }
    
    console.log(`\n2. 测试软删除设备: ${testDevice.device_name}`);
    
    // 3. 执行软删除
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
    
    // 4. 验证软删除结果
    console.log('\n3. 验证软删除结果...');
    const verifyResponse = await fetch(`${baseUrl}/dtu`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      const updatedDevices = verifyData.data.devices || [];
      const deletedDevice = updatedDevices.find(d => d.device_id === testDevice.device_id);
      
      if (deletedDevice && deletedDevice.status === '已删除') {
        console.log('✅ 设备状态已更新为"已删除"');
        console.log(`设备: ${deletedDevice.device_name} - 状态: ${deletedDevice.status}`);
      } else {
        console.log('❌ 设备状态未正确更新');
      }
    }
    
    // 5. 测试恢复设备
    console.log('\n4. 测试恢复设备...');
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
    }
    
    // 6. 验证恢复结果
    console.log('\n5. 验证恢复结果...');
    const finalResponse = await fetch(`${baseUrl}/dtu`);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const finalDevices = finalData.data.devices || [];
      const restoredDevice = finalDevices.find(d => d.device_id === testDevice.device_id);
      
      if (restoredDevice && restoredDevice.status === '未连接') {
        console.log('✅ 设备已恢复为"未连接"状态');
        console.log(`设备: ${restoredDevice.device_name} - 状态: ${restoredDevice.status}`);
      } else {
        console.log('❌ 设备恢复状态不正确');
      }
    }
    
    // 7. 测试彻底删除
    console.log('\n6. 测试彻底删除...');
    
    // 先再次软删除
    await fetch(`${baseUrl}/dtu/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
    });
    
    // 然后彻底删除
    const permanentDeleteResponse = await fetch(`${baseUrl}/dtu/permanently-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [testDevice.device_id] })
    });
    
    const permanentDeleteData = await permanentDeleteResponse.json();
    
    if (permanentDeleteData.success) {
      console.log('✅ 彻底删除成功!');
      console.log(`消息: ${permanentDeleteData.message}`);
    } else {
      console.error('❌ 彻底删除失败:', permanentDeleteData.message);
    }
    
    // 8. 验证彻底删除结果
    console.log('\n7. 验证彻底删除结果...');
    const finalCheckResponse = await fetch(`${baseUrl}/dtu`);
    const finalCheckData = await finalCheckResponse.json();
    
    if (finalCheckData.success) {
      const finalDevices = finalCheckData.data.devices || [];
      const deletedDevice = finalDevices.find(d => d.device_id === testDevice.device_id);
      
      if (!deletedDevice) {
        console.log('✅ 设备已从数据库中彻底删除');
      } else {
        console.log('❌ 设备仍然存在于数据库中');
      }
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testSoftDelete();
