const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const performanceMonitor = require('./performance');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
  queueLimit: 0,
  // 连接池优化配置
  idleTimeout: 300000, // 空闲连接超时时间 (5分钟)
  // 查询优化配置
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: false,
  trace: false,
  // 字符集配置
  charset: 'utf8mb4',
  // 时区配置
  timezone: '+08:00'
});

// 监听连接事件
pool.on('connection', (connection) => {
  logger.debug('New database connection established', {
    threadId: connection.threadId
  });
});

pool.on('acquire', (connection) => {
  logger.debug('Database connection acquired', {
    threadId: connection.threadId
  });
});

pool.on('release', (connection) => {
  logger.debug('Database connection released', {
    threadId: connection.threadId
  });
});

pool.on('error', (err) => {
  logger.error('Database pool error', {
    error: err.message,
    code: err.code,
    stack: err.stack
  });
});

// 创建带性能监控的查询包装器
const originalExecute = pool.execute.bind(pool);

pool.execute = async function(sql, params = []) {
  const startTime = Date.now();
  
  try {
    const result = await originalExecute(sql, params);
    const duration = Date.now() - startTime;
    
    // 记录查询性能
    performanceMonitor.recordQuery(sql, duration, params);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 记录错误
    performanceMonitor.recordError(error, sql);
    
    throw error;
  }
};

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    logger.info('Database connected successfully', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      threadId: connection.threadId
    });
    connection.release();
  })
  .catch(err => {
    logger.error('Database connection failed', {
      error: err.message,
      code: err.code,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
  });

module.exports = pool;