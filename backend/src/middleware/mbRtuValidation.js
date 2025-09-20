const { body } = require('express-validator');

/**
 * 处理验证错误
 */
const handleValidationErrors = (req, res, next) => {
  const errors = req.validationErrors ? req.validationErrors() : [];
  if (errors && errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.map(err => err.msg)
    });
  }
  next();
};

/**
 * MB-RTU协议验证规则
 */
const validateMBRTU = [
  body('slave_address')
    .optional()
    .isInt({ min: 1, max: 247 })
    .withMessage('从站地址必须在1-247之间'),
  
  body('function_code')
    .optional()
    .isIn(['01读写', '02只读', '03读写', '04只读'])
    .withMessage('功能码无效'),
  
  body('offset_value')
    .optional()
    .isFloat()
    .withMessage('偏置值必须是数字'),
  
  body('data_format')
    .optional()
    .isIn(['16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码'])
    .withMessage('数据格式无效'),
  
  body('collection_cycle')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage('采集周期必须在1-3600秒之间'),
  
  handleValidationErrors
];

/**
 * 批量更新MB-RTU协议验证规则
 */
const validateMBRTUs = [
  body('configs')
    .isArray({ min: 1 })
    .withMessage('配置数据必须是数组且不能为空'),
  
  body('configs.*.sensor_id')
    .notEmpty()
    .withMessage('传感器ID不能为空'),
  
  body('configs.*.slave_address')
    .optional()
    .isInt({ min: 1, max: 247 })
    .withMessage('从站地址必须在1-247之间'),
  
  body('configs.*.function_code')
    .optional()
    .isIn(['01读写', '02只读', '03读写', '04只读'])
    .withMessage('功能码无效'),
  
  body('configs.*.offset_value')
    .optional()
    .isFloat()
    .withMessage('偏置值必须是数字'),
  
  body('configs.*.data_format')
    .optional()
    .isIn(['16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码'])
    .withMessage('数据格式无效'),
  
  body('configs.*.collection_cycle')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage('采集周期必须在1-3600秒之间'),
  
  handleValidationErrors
];

module.exports = {
  validateMBRTU,
  validateMBRTUs
};
