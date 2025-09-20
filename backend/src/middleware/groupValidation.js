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
 * 设备分组验证规则
 */
const validateGroup = [
  body('group_name')
    .notEmpty()
    .withMessage('分组名不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('分组名长度必须在1-100个字符之间'),
  
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('分组描述长度不能超过255个字符'),
  
  handleValidationErrors
];

/**
 * 分组ID参数验证
 */
const validateGroupId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('分组ID必须是正整数'),
  
  handleValidationErrors
];

module.exports = {
  validateGroup,
  validateGroupId
};
