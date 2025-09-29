const { body, validationResult } = require('express-validator');

/**
 * 处理验证错误
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

/**
 * DTU设备数据验证规则
 */
const validateData = [
  body('dtu_id')
    .notEmpty()
    .withMessage('DTU设备ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  body('dtu_name')
    .notEmpty()
    .withMessage('DTU设备名称不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('DTU设备名称长度必须在1-100个字符之间'),
  
  body('dtu_group')
    .notEmpty()
    .withMessage('DTU设备分组不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('DTU设备分组长度必须在1-100个字符之间'),
  
  body('serial_number')
    .optional()
    .isLength({ max: 100 })
    .withMessage('设备序列号长度不能超过100个字符'),
  
  body('dtu_image')
    .optional()
    .isLength({ max: 255 })
    .withMessage('DTU设备图片路径长度不能超过255个字符'),
  
  body('link_protocol')
    .optional()
    .isLength({ max: 50 })
    .withMessage('链接协议长度不能超过50个字符'),
  
  body('offline_delay')
    .optional()
    .isInt({ min: 1, max: 86400 })
    .withMessage('掉线延时必须在1-86400秒之间'),
  
  body('timezone_setting')
    .optional()
    .matches(/^[+-]\d{2}:\d{2}$/)
    .withMessage('时区设置格式必须为+08:00或-05:00'),
  
  body('longitude')
    .optional()
    .isDecimal({ decimal_digits: '0,7' })
    .withMessage('经度必须是有效的十进制数，最多7位小数')
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
          throw new Error('经度必须在-180到180之间');
        }
      }
      return true;
    }),
  
  body('latitude')
    .optional()
    .isDecimal({ decimal_digits: '0,7' })
    .withMessage('纬度必须是有效的十进制数，最多7位小数')
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
          throw new Error('纬度必须在-90到90之间');
        }
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['已连接', '未连接', '已删除', '已禁用'])
    .withMessage('设备状态必须是：已连接、未连接、已删除、已禁用'),
  
  handleValidationErrors
];

/**
 * DTU设备ID验证规则
 */
const validateId = [
  body('dtu_id')
    .notEmpty()
    .withMessage('DTU设备ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  handleValidationErrors
];

/**
 * DTU设备复制验证规则
 */
const validateIds = [
  body('dtu_ids')
    .isArray({ min: 1 })
    .withMessage('请提供要复制的DTU设备ID列表')
    .custom((dtu_ids) => {
      if (!Array.isArray(dtu_ids) || dtu_ids.length === 0) {
        throw new Error('DTU设备ID列表不能为空');
      }
      
      for (const dtu_id of dtu_ids) {
        if (typeof dtu_id !== 'string' || dtu_id.trim().length === 0) {
          throw new Error('DTU设备ID必须是有效的字符串');
        }
        if (dtu_id.length < 1 || dtu_id.length > 50) {
          throw new Error('DTU设备ID长度必须在1-50个字符之间');
        }
      }
      
      return true;
    }),
  
  handleValidationErrors
];

/**
 * DTU设备查询参数验证规则
 */
const validateQuery = [
  (req, res, next) => {
    const { dtuId, page, limit, group, status, search } = req.query;
    const errors = [];
    
    // 验证dtuId（如果提供）
    if (dtuId && (dtuId.length < 1 || dtuId.length > 50)) {
      errors.push({ msg: 'DTU设备ID长度必须在1-50个字符之间' });
    }
    
    // 验证分页参数
    if (page && (isNaN(page) || parseInt(page) < 1)) {
      errors.push({ msg: '页码必须是大于0的整数' });
    }
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
      errors.push({ msg: '每页数量必须在1-100之间' });
    }
    
    // 验证分组（如果提供）
    if (group && group.length > 100) {
      errors.push({ msg: '分组名长度不能超过100个字符' });
    }
    
    // 验证状态（如果提供）
    if (status && !['已连接', '未连接', '已删除', '已禁用'].includes(status)) {
      errors.push({ msg: '设备状态必须是：已连接、未连接、已删除、已禁用' });
    }
    
    // 验证搜索关键词（如果提供）
    if (search && search.length > 100) {
      errors.push({ msg: '搜索关键词长度不能超过100个字符' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '查询参数验证失败',
        errors: errors.map(err => err.msg)
      });
    }
    
    next();
  }
];

module.exports = {
  validateData,
  validateId,
  validateIds,
  validateQuery
};
