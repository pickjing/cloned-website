const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const deviceRoutes = require('./routes/deviceRoutes');
// const dtuRoutes = require('./routes/dtuRoutes');
const groupRoutes = require('./routes/groupRoutes');
const mbRtuRoutes = require('./routes/mbRtuRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger, databaseLogger, securityLogger, healthCheckLogger } = require('./middleware/logging');
const logger = require('./utils/logger');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use(requestLogger);
app.use(databaseLogger);
app.use(securityLogger);
app.use(healthCheckLogger);

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'IoT Center Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 性能监控路由
app.get('/performance', (req, res) => {
  const performanceMonitor = require('./services/performance');
  const stats = performanceMonitor.getStats();
  res.json({
    success: true,
    data: stats
  });
});

// 性能报告路由
app.get('/performance/report', (req, res) => {
  const performanceMonitor = require('./services/performance');
  const report = performanceMonitor.generateReport();
  res.json({
    success: true,
    data: report
  });
});

// 设备路由
// app.use('/api', deviceRoutes);

// dtu路由
//app.use('/api/dtu', dtuRoutes);

// 分组路由
app.use('/api/groups', groupRoutes);

// 传感器路由
app.use('/api/sensors', sensorRoutes);

// MB-RTU协议路由
app.use('/api/mb-rtu', mbRtuRoutes);

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    healthCheckUrl: `http://localhost:${PORT}/health`
  });
  
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
