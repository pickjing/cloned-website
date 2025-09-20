const { body, query, param, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * 验证结果处理中间件
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new ValidationError('输入数据验证失败', errorMessages);
  }
  
  next();
};

/**
 * DTU设备验证规则
 */
const validateDTUDevice = [
  body('device_id')
    .notEmpty()
    .withMessage('设备ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('设备ID长度必须在1-50个字符之间'),
  
  body('device_name')
    .notEmpty()
    .withMessage('设备名称不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('设备名称长度必须在1-100个字符之间'),
  
  body('device_group')
    .optional()
    .isLength({ max: 100 })
    .withMessage('设备分组长度不能超过100个字符'),
  
  body('serial_number')
    .optional()
    .isLength({ max: 100 })
    .withMessage('序列号长度不能超过100个字符'),
  
  body('status')
    .optional()
    .isIn(['已连接', '未连接', '已删除', '已禁用'])
    .withMessage('设备状态必须是：已连接、未连接、已删除、已禁用'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('经度必须在-180到180之间'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('纬度必须在-90到90之间'),
  
  body('offline_delay')
    .optional()
    .isInt({ min: 1, max: 86400 })
    .withMessage('掉线延时必须在1-86400秒之间'),
  
  handleValidationErrors
];

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
  
  handleValidationErrors
];

/**
 * 传感器数据验证规则
 */
const validateSensorData = [
  body('sensor_id')
    .notEmpty()
    .withMessage('传感器ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  body('data_value')
    .notEmpty()
    .withMessage('数据值不能为空')
    .isFloat()
    .withMessage('数据值必须是数字'),
  
  body('data_quality')
    .optional()
    .isIn(['good', 'bad', 'uncertain'])
    .withMessage('数据质量必须是：good、bad、uncertain'),
  
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('时间戳格式无效'),
  
  handleValidationErrors
];

/**
 * 分页参数验证规则
 */
const validatePagination = [
  query('page')
    .optional()
    .custom((value) => {
      if (value === 'undefined' || value === undefined || value === null || value === '') {
        return true; // 允许空值
      }
      const num = parseInt(value);
      return !isNaN(num) && num >= 1;
    })
    .withMessage('页码必须是正整数'),
  
  query('limit')
    .optional()
    .custom((value) => {
      if (value === 'undefined' || value === undefined || value === null || value === '') {
        return true; // 允许空值
      }
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 100;
    })
    .withMessage('每页数量必须在1-100之间'),
  
  query('group')
    .optional()
    .custom((value) => {
      if (value === 'undefined' || value === undefined || value === null || value === '') {
        return true; // 允许空值
      }
      return value.length <= 100;
    })
    .withMessage('分组名长度不能超过100个字符'),
  
  query('status')
    .optional()
    .custom((value) => {
      if (value === 'undefined' || value === undefined || value === null || value === '') {
        return true; // 允许空值
      }
      return ['已连接', '未连接', '已删除', '已禁用'].includes(value);
    })
    .withMessage('状态值无效'),
  
  query('search')
    .optional()
    .custom((value) => {
      if (value === 'undefined' || value === undefined || value === null || value === '') {
        return true; // 允许空值
      }
      return value.length <= 100;
    })
    .withMessage('搜索关键词长度不能超过100个字符'),
  
  handleValidationErrors
];

/**
 * 设备ID参数验证规则
 */
const validateDeviceId = [
  param('dtuId')
    .notEmpty()
    .withMessage('设备ID不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('设备ID长度必须在1-50个字符之间'),
  
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
 * 分组重命名验证规则
 */
const validateGroupUpdate = [
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

/**
 * 批量操作验证规则
 */
const validateBatchOperation = [
  body('device_ids')
    .isArray({ min: 1 })
    .withMessage('设备ID列表不能为空')
    .custom((deviceIds) => {
      if (!deviceIds.every(id => typeof id === 'string' && id.length > 0 && id.length <= 50)) {
        throw new Error('设备ID格式无效');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * 移动设备到分组验证规则
 */
const validateMoveToGroup = [
  body('device_ids')
    .isArray({ min: 1 })
    .withMessage('设备ID列表不能为空'),
  
  body('target_group')
    .notEmpty()
    .withMessage('目标分组不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('目标分组长度必须在1-100个字符之间'),
  
  handleValidationErrors
];

/**
 * MB RTU配置验证规则
 */
const validateMBRTUConfig = [
  body('dtu_id')
    .notEmpty()
    .withMessage('DTU设备ID不能为空'),
  
  body('sensor_id')
    .notEmpty()
    .withMessage('传感器ID不能为空'),
  
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

// MB-RTU配置更新验证（不需要dtu_id和sensor_id，从URL参数获取）
const validateMBRTUConfigUpdate = [
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

// 批量更新MB-RTU配置验证
const validateMBRTUConfigBatchUpdate = [
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
  validateDTUDevice,
  validateSensor,
  validateSensorData,
  validatePagination,
  validateDeviceId,
  validateSensorId,
  validateGroup,
  validateGroupUpdate,
  validateGroupId,
  validateBatchOperation,
  validateMoveToGroup,
  validateMBRTUConfig,
  validateMBRTUConfigUpdate,
  validateMBRTUConfigBatchUpdate,
  handleValidationErrors
};
