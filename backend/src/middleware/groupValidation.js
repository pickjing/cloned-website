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
 * 设备分组数据验证规则
 */
const validateData = [
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
 * 设备分组id验证规则
 */
const validateId = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('分组ID必须是正整数'),
  
  handleValidationErrors
];

module.exports = {
  validateData,
  validateId
};
