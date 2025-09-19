const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error('Application error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // MySQL 错误处理
  if (err.code === 'ER_DUP_ENTRY') {
    const message = '数据已存在，请检查唯一性约束';
    logger.warn('Duplicate entry error', { 
      code: err.code, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 400);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = '外键约束失败，请检查关联数据';
    logger.warn('Foreign key constraint error', { 
      code: err.code, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 400);
  }

  if (err.code === 'ER_LOCK_WAIT_TIMEOUT') {
    const message = '数据库操作超时，请重试';
    logger.warn('Database lock timeout', { 
      code: err.code, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 408);
  }

  if (err.code === 'ER_LOCK_DEADLOCK') {
    const message = '数据冲突，请重试';
    logger.warn('Database deadlock', { 
      code: err.code, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 409);
  }

  if (err.code === 'ECONNREFUSED') {
    const message = '数据库连接失败';
    logger.error('Database connection refused', { 
      code: err.code, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 503);
  }

  // 参数验证错误
  if (err.name === 'ValidationError') {
    const message = '数据验证失败';
    logger.warn('Validation error', { 
      name: err.name, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 400);
  }

  // 语法错误
  if (err.name === 'SyntaxError') {
    const message = '请求格式错误';
    logger.warn('Syntax error', { 
      name: err.name, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 400);
  }

  // 类型错误
  if (err.name === 'TypeError') {
    const message = '参数类型错误';
    logger.warn('Type error', { 
      name: err.name, 
      message: err.message,
      requestId: req.requestId 
    });
    error = new AppError(message, 400);
  }

  // 默认错误
  if (!error.isOperational) {
    error = new AppError('服务器内部错误', 500);
  }

  // 发送错误响应
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    })
  };

  // 如果是验证错误，添加详细错误信息
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * 404 错误处理中间件
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`路径 ${req.originalUrl} 不存在`, 404);
  next(error);
};

/**
 * 异步错误处理包装器
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
