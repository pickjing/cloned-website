const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

async function testDatabaseConnection() {
  console.log('开始测试数据库连接...');
  
  // 显示配置信息（隐藏密码）
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'iotuser',
    password: process.env.DB_PASSWORD ? '***' : '未设置',
    database: process.env.DB_NAME || 'dam_monitoring_system',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('数据库配置:', config);
  
  try {
    // 创建连接池
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    console.log('连接池创建成功，正在测试连接...');

    // 测试连接
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功！');

    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 查询测试成功:', rows);

    // 检查数据库是否存在
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    
    if (dbExists) {
      console.log(`✅ 数据库 '${process.env.DB_NAME}' 存在`);
      
      // 检查表是否存在
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`✅ 数据库中有 ${tables.length} 个表:`);
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      // 检查视图
      const [views] = await connection.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
      console.log(`✅ 数据库中有 ${views.length} 个视图:`);
      views.forEach(view => {
        console.log(`   - ${Object.values(view)[0]}`);
      });
      
    } else {
      console.log(`❌ 数据库 '${process.env.DB_NAME}' 不存在`);
      console.log('请先运行 database_init.sql 脚本创建数据库');
    }

    // 释放连接
    connection.release();
    
    // 关闭连接池
    await pool.end();
    console.log('✅ 数据库连接测试完成');

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 提示: 用户名或密码错误，请检查 .env 文件配置');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 无法连接到MySQL服务，请检查MySQL是否运行');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 提示: 数据库不存在，请先运行 database_init.sql 脚本');
    }
    
    console.log('\n请按照 DATABASE_SETUP.md 中的步骤进行设置');
  }
}

// 运行测试
testDatabaseConnection();
