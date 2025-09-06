const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试分组显示功能
async function testGroupDisplay() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('=== 测试分组显示功能 ===\n');
    
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
    
    // 显示设备及其分组
    console.log('\n设备分组信息:');
    devices.forEach(device => {
      console.log(`- ${device.device_name}: ${device.device_group || '未分组'}`);
    });
    
    // 2. 获取分组选项
    console.log('\n2. 获取分组选项...');
    const groupsResponse = await fetch(`${baseUrl}/options/groups`);
    const groupsData = await groupsResponse.json();
    
    if (groupsData.success) {
      const groups = groupsData.data || [];
      console.log(`找到 ${groups.length} 个分组:`);
      groups.forEach(group => {
        console.log(`  - ${group}`);
      });
    } else {
      console.error('获取分组失败:', groupsData.message);
      return;
    }
    
    // 3. 检查设备分组是否都在分组选项中
    console.log('\n3. 检查分组一致性...');
    const deviceGroups = devices
      .map(d => d.device_group)
      .filter(group => group && group !== '未分组')
      .filter((group, index, arr) => arr.indexOf(group) === index); // 去重
    
    console.log('设备中的分组:', deviceGroups);
    console.log('分组选项中的分组:', groupsData.data);
    
    const missingGroups = deviceGroups.filter(group => !groupsData.data.includes(group));
    const extraGroups = groupsData.data.filter(group => !deviceGroups.includes(group));
    
    if (missingGroups.length === 0) {
      console.log('✅ 所有设备分组都在分组选项中');
    } else {
      console.log('❌ 以下设备分组不在分组选项中:', missingGroups);
    }
    
    if (extraGroups.length > 0) {
      console.log('ℹ️ 以下分组选项没有对应设备:', extraGroups);
    }
    
    // 4. 测试移动分组功能
    console.log('\n4. 测试移动分组功能...');
    const testDevice = devices.find(d => d.device_group && d.device_group !== '未分组');
    
    if (testDevice) {
      console.log(`测试设备: ${testDevice.device_name} (当前分组: ${testDevice.device_group})`);
      
      // 选择一个不同的分组作为目标
      const targetGroup = groupsData.data.find(group => group !== testDevice.device_group);
      
      if (targetGroup) {
        console.log(`目标分组: ${targetGroup}`);
        
        // 测试移动分组API
        const moveResponse = await fetch(`${baseUrl}/dtu/move-to-group`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            device_ids: [testDevice.device_id], 
            target_group: targetGroup 
          })
        });
        
        const moveData = await moveResponse.json();
        
        if (moveData.success) {
          console.log('✅ 移动分组API调用成功');
          console.log(`消息: ${moveData.message}`);
        } else {
          console.log('❌ 移动分组API调用失败:', moveData.message);
        }
      } else {
        console.log('没有找到不同的目标分组进行测试');
      }
    } else {
      console.log('没有找到有分组的设备进行测试');
    }
    
    console.log('\n=== 分组显示测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testGroupDisplay();
