const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} ${level} ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 创建日志传输器
const transports = [];

// 控制台输出（所有环境）
transports.push(
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat
  })
);

// 错误日志文件（所有环境）
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '50m',
    maxFiles: '30d',  // 错误日志保留30天
    zippedArchive: true
  })
);

// 应用日志文件（所有环境）
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: logFormat,
    maxSize: '100m',
    maxFiles: '14d',  // 应用日志保留14天
    zippedArchive: true
  })
);

// 调试日志文件（仅开发环境）
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'debug-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      format: logFormat,
      maxSize: '50m',
      maxFiles: '7d',  // 调试日志保留7天
      zippedArchive: true
    })
  );
}

// 创建Winston logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'iot-backend',
    version: '1.0.0'
  },
  transports,
  // 处理未捕获的异常
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '50m',
      maxFiles: '30d',  // 异常日志保留30天
      zippedArchive: true
    })
  ],
  // 处理未处理的Promise拒绝
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '50m',
      maxFiles: '30d',  // 拒绝日志保留30天
      zippedArchive: true
    })
  ]
});

// 添加自定义方法
logger.request = (req, message = 'Request received') => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId || 'unknown'
  });
};

logger.response = (req, res, message = 'Response sent') => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: res.responseTime || 'unknown',
    requestId: req.requestId || 'unknown'
  });
};

logger.database = (operation, query, params = [], duration = null) => {
  logger.debug('Database operation', {
    operation,
    query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
    params: params.length > 0 ? params : undefined,
    duration: duration ? `${duration}ms` : undefined
  });
};

logger.security = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    ...details
  });
};

logger.performance = (operation, duration, details = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// 创建子logger用于不同模块
logger.createChild = (module) => {
  return logger.child({ module });
};

module.exports = logger;
