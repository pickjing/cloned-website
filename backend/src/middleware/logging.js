const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.requestId = uuidv4();
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.request(req, 'Incoming request');
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.responseTime = duration;
    
    // 记录响应信息
    logger.response(req, res, 'Request completed');
    
    // 记录性能指标
    if (duration > 1000) {
      logger.performance('slow_request', duration, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

/**
 * 数据库查询日志中间件
 */
const databaseLogger = (req, res, next) => {
  // 存储原始的数据库连接池查询方法
  const originalQuery = req.app.locals.db?.query;
  
  if (originalQuery) {
    req.app.locals.db.query = function(sql, values) {
      const startTime = Date.now();
      
      return originalQuery.call(this, sql, values)
        .then(result => {
          const duration = Date.now() - startTime;
          logger.database('query', sql, values, duration);
          return result;
        })
        .catch(error => {
          const duration = Date.now() - startTime;
          logger.error('Database query failed', {
            query: sql,
            params: values,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack
          });
          throw error;
        });
    };
  }
  
  next();
};

/**
 * 安全事件日志中间件
 */
const securityLogger = (req, res, next) => {
  // 检测可疑活动
  const suspiciousPatterns = [
    /\.\.\//,  // 路径遍历
    /<script/i,  // XSS尝试
    /union\s+select/i,  // SQL注入尝试
    /drop\s+table/i,  // SQL注入尝试
    /exec\s*\(/i,  // 命令注入尝试
  ];
  
  const checkSuspiciousActivity = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // 检查查询参数
  const querySuspicious = Object.values(req.query).some(checkSuspiciousActivity);
  if (querySuspicious) {
    logger.security('suspicious_query_params', {
      url: req.originalUrl,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  // 检查请求体
  if (req.body && typeof req.body === 'object') {
    const bodyString = JSON.stringify(req.body);
    const bodySuspicious = suspiciousPatterns.some(pattern => pattern.test(bodyString));
    if (bodySuspicious) {
      logger.security('suspicious_request_body', {
        url: req.originalUrl,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  }
  
  next();
};

/**
 * 错误日志中间件
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId
  });
  
  next(err);
};

/**
 * 健康检查日志中间件（跳过健康检查的详细日志）
 */
const healthCheckLogger = (req, res, next) => {
  if (req.originalUrl === '/health') {
    // 健康检查只记录错误，不记录正常请求
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      if (res.statusCode >= 400) {
        logger.error('Health check failed', {
          statusCode: res.statusCode,
          url: req.originalUrl
        });
      }
      originalEnd.call(this, chunk, encoding);
    };
  }
  
  next();
};

module.exports = {
  requestLogger,
  databaseLogger,
  securityLogger,
  errorLogger,
  healthCheckLogger
};
