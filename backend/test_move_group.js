const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试移动分组功能
async function testMoveGroup() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试移动分组功能 ===\n');
    
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
    
    // 显示设备分组信息
    console.log('\n设备分组信息:');
    devices.forEach(device => {
      console.log(`- ${device.device_name} (${device.device_id}): ${device.device_group || '未分组'}`);
    });
    
    // 2. 获取设备分组选项
    console.log('\n2. 获取设备分组选项...');
    const groupsResponse = await fetch(`${baseUrl}/options/groups`);
    const groupsData = await groupsResponse.json();
    
    if (!groupsData.success) {
      console.error('获取分组选项失败:', groupsData.message);
      return;
    }
    
    const groups = groupsData.data || [];
    console.log('可用分组:', groups);
    
    if (groups.length === 0) {
      console.log('没有可用分组，创建测试分组...');
      
      // 创建测试分组
      const createGroupResponse = await fetch(`${baseUrl}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: '测试分组',
          description: '用于测试移动分组功能'
        })
      });
      
      const createGroupData = await createGroupResponse.json();
      if (createGroupData.success) {
        console.log('测试分组创建成功');
        groups.push('测试分组');
      } else {
        console.error('创建测试分组失败:', createGroupData.message);
        return;
      }
    }
    
    // 3. 选择测试设备（选择前2个设备）
    const testDevices = devices.slice(0, Math.min(2, devices.length));
    const testDeviceIds = testDevices.map(device => device.device_id);
    const targetGroup = groups[0] || '测试分组';
    
    console.log(`\n3. 测试移动设备到分组...`);
    console.log(`测试设备: ${testDevices.map(d => d.device_name).join(', ')}`);
    console.log(`目标分组: ${targetGroup}`);
    
    // 4. 执行移动操作
    const moveResponse = await fetch(`${baseUrl}/dtu/move-to-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_ids: testDeviceIds,
        target_group: targetGroup
      })
    });
    
    const moveData = await moveResponse.json();
    
    if (moveData.success) {
      console.log('\n✅ 移动操作成功!');
      console.log(`移动数量: ${moveData.moved_count}`);
      console.log(`跳过数量: ${moveData.skipped_count}`);
      console.log(`消息: ${moveData.message}`);
    } else {
      console.error('\n❌ 移动操作失败:', moveData.message);
    }
    
    // 5. 验证结果
    console.log('\n4. 验证移动结果...');
    const verifyResponse = await fetch(`${baseUrl}/dtu`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      const updatedDevices = verifyData.data.devices || [];
      console.log('\n更新后的设备分组信息:');
      updatedDevices.forEach(device => {
        const isTestDevice = testDeviceIds.includes(device.device_id);
        const marker = isTestDevice ? '👉' : '  ';
        console.log(`${marker} ${device.device_name} (${device.device_id}): ${device.device_group || '未分组'}`);
      });
    }
    
    // 6. 测试重复移动（应该跳过）
    console.log('\n5. 测试重复移动（应该跳过）...');
    const repeatMoveResponse = await fetch(`${baseUrl}/dtu/move-to-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_ids: testDeviceIds,
        target_group: targetGroup
      })
    });
    
    const repeatMoveData = await repeatMoveResponse.json();
    
    if (repeatMoveData.success) {
      console.log('✅ 重复移动测试成功!');
      console.log(`移动数量: ${repeatMoveData.moved_count}`);
      console.log(`跳过数量: ${repeatMoveData.skipped_count}`);
      console.log(`消息: ${repeatMoveData.message}`);
    } else {
      console.error('❌ 重复移动测试失败:', repeatMoveData.message);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testMoveGroup();
