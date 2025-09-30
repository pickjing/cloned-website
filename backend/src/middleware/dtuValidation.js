const { body, query, validationResult } = require('express-validator');

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
 * DTU设备复制/删除验证规则
 */
const validateIds = [
  body('dtu_ids')
    .isArray()
    .withMessage('dtu_ids必须是数组格式')
    .custom((dtu_ids) => {
      if (!Array.isArray(dtu_ids)) {
        throw new Error('dtu_ids必须是数组格式');
      }
      
      // 如果数组为空，直接返回true，不进行后续验证
      if (dtu_ids.length === 0) {
        return true;
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
  query('dtu_id')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  
  query('group')
    .optional()
    .isLength({ max: 100 })
    .withMessage('分组名长度不能超过100个字符'),
  
  query('status')
    .optional()
    .isIn(['已连接', '未连接', '已删除', '已禁用'])
    .withMessage('设备状态必须是：已连接、未连接、已删除、已禁用'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('搜索关键词长度不能超过100个字符'),
  
  handleValidationErrors
];

module.exports = {
  validateData,
  validateIds,
  validateQuery
};
