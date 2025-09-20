const { body, param } = require('express-validator');

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
 * 传感器验证规则
 */
const validateSensor = [
  body('sensor_id')
    .notEmpty()
    .withMessage('传感器ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  body('dtu_id')
    .notEmpty()
    .withMessage('DTU设备ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  body('sensor_name')
    .notEmpty()
    .withMessage('传感器名称不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('传感器名称长度必须在1-100个字符之间'),
  
  body('sensor_type')
    .optional()
    .isIn(['数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串'])
    .withMessage('传感器类型无效'),
  
  body('decimal_places')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('小数位数必须在0-10之间'),
  
  body('unit')
    .optional()
    .isLength({ max: 20 })
    .withMessage('单位长度不能超过20个字符'),
  
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序必须是非负整数'),
  
  body('upper_mapping_x1')
    .optional()
    .isFloat()
    .withMessage('上行映射原始值下限必须是数字'),
  
  body('upper_mapping_y1')
    .optional()
    .isFloat()
    .withMessage('上行映射原始值上限必须是数字'),
  
  body('upper_mapping_x2')
    .optional()
    .isFloat()
    .withMessage('上行映射实际值下限必须是数字'),
  
  body('upper_mapping_y2')
    .optional()
    .isFloat()
    .withMessage('上行映射实际值上限必须是数字'),
  
  body('lower_mapping_x1')
    .optional()
    .isFloat()
    .withMessage('下行映射实际值下限必须是数字'),
  
  body('lower_mapping_y1')
    .optional()
    .isFloat()
    .withMessage('下行映射实际值上限必须是数字'),
  
  body('lower_mapping_x2')
    .optional()
    .isFloat()
    .withMessage('下行映射原始值下限必须是数字'),
  
  body('lower_mapping_y2')
    .optional()
    .isFloat()
    .withMessage('下行映射原始值上限必须是数字'),
  
  handleValidationErrors
];

/**
 * 传感器ID参数验证规则
 */
const validateSensorId = [
  param('sensorId')
    .notEmpty()
    .withMessage('传感器ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  handleValidationErrors
];

module.exports = {
  validateSensor,
  validateSensorId
};
