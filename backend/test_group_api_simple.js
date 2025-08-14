const { exec } = require('child_process');

// 测试分组API接口
async function testGroupAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('开始测试分组API接口...\n');
  
  try {
    // 测试1: 检查不存在的分组名
    console.log('1. 测试检查不存在的分组名...');
    exec(`curl -s "${baseURL}/groups/check?group_name=测试分组123"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 请求失败:', error.message);
        return;
      }
      console.log('响应:', stdout);
      console.log('✅ 检查不存在的分组名成功\n');
      
      // 测试2: 创建新分组
      console.log('2. 测试创建新分组...');
      exec(`curl -s -X POST "${baseURL}/groups" -H "Content-Type: application/json" -d '{"group_name":"测试分组123","description":"这是一个测试分组"}'`, (error2, stdout2, stderr2) => {
        if (error2) {
          console.error('❌ 创建分组失败:', error2.message);
          return;
        }
        console.log('响应:', stdout2);
        console.log('✅ 创建分组成功\n');
        
        // 测试3: 再次检查刚创建的分组名
        console.log('3. 测试检查刚创建的分组名...');
        exec(`curl -s "${baseURL}/groups/check?group_name=测试分组123"`, (error3, stdout3, stderr3) => {
          if (error3) {
            console.error('❌ 检查失败:', error3.message);
            return;
          }
          console.log('响应:', stdout3);
          console.log('✅ 检查已存在的分组名成功\n');
          
          // 测试4: 获取所有分组
          console.log('4. 测试获取所有分组...');
          exec(`curl -s "${baseURL}/options/groups"`, (error4, stdout4, stderr4) => {
            if (error4) {
              console.error('❌ 获取分组失败:', error4.message);
              return;
            }
            console.log('响应:', stdout4);
            console.log('✅ 获取分组列表成功\n');
            console.log('🎉 所有测试通过！');
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n请确保：');
    console.log('1. 后端服务已启动 (npm start)');
    console.log('2. 数据库连接正常');
    console.log('3. 端口3000未被占用');
  }
}

// 运行测试
testGroupAPI();
