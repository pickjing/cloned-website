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
 * 传感器创建验证规则（支持批量操作）
 */
const validateCreate = [
  body('sensors')
  .isArray({ min: 1 })
  .withMessage('请提供传感器数据')
  .custom((sensors) => {
    if (!Array.isArray(sensors) || sensors.length === 0) {
      throw new Error('传感器列表不能为空');
    }
    
    sensors.forEach((sensor, index) => {
      const prefix = `[${index}].`;
      
      // 验证必需字段
      if (!sensor.sensor_id) {
        throw new Error(`${prefix}sensor_id不能为空`);
      } else if (sensor.sensor_id.length < 1 || sensor.sensor_id.length > 50) {
        throw new Error(`${prefix}sensor_id长度必须在1-50个字符之间`);
      }
      
      if (!sensor.dtu_id) {
        throw new Error(`${prefix}dtu_id不能为空`);
      } else if (sensor.dtu_id.length < 1 || sensor.dtu_id.length > 50) {
        throw new Error(`${prefix}dtu_id长度必须在1-50个字符之间`);
      }
      
      if (!sensor.sensor_name) {
        throw new Error(`${prefix}sensor_name不能为空`);
      } else if (sensor.sensor_name.length < 1 || sensor.sensor_name.length > 100) {
        throw new Error(`${prefix}sensor_name长度必须在1-100个字符之间`);
      }
      
      // 验证可选字段
      if (sensor.sensor_type && !['数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串'].includes(sensor.sensor_type)) {
        throw new Error(`${prefix}sensor_type无效`);
      }
      
      if (sensor.decimal_places !== undefined && (sensor.decimal_places < 0 || sensor.decimal_places > 10)) {
        throw new Error(`${prefix}decimal_places必须在0-10之间`);
      }
      
      if (sensor.unit && sensor.unit.length > 20) {
        throw new Error(`${prefix}unit长度不能超过20个字符`);
      }
      
      if (sensor.sort_order !== undefined && sensor.sort_order < 0) {
        throw new Error(`${prefix}sort_order必须是非负整数`);
      }
      
      // 验证映射字段
      if (sensor.upper_mapping_x1 !== undefined && isNaN(sensor.upper_mapping_x1)) {
        throw new Error(`${prefix}upper_mapping_x1必须是数字`);
      }
      if (sensor.upper_mapping_y1 !== undefined && isNaN(sensor.upper_mapping_y1)) {
        throw new Error(`${prefix}upper_mapping_y1必须是数字`);
      }
      if (sensor.upper_mapping_x2 !== undefined && isNaN(sensor.upper_mapping_x2)) {
        throw new Error(`${prefix}upper_mapping_x2必须是数字`);
      }
      if (sensor.upper_mapping_y2 !== undefined && isNaN(sensor.upper_mapping_y2)) {
        throw new Error(`${prefix}upper_mapping_y2必须是数字`);
      }
      if (sensor.lower_mapping_x1 !== undefined && isNaN(sensor.lower_mapping_x1)) {
        throw new Error(`${prefix}lower_mapping_x1必须是数字`);
      }
      if (sensor.lower_mapping_y1 !== undefined && isNaN(sensor.lower_mapping_y1)) {
        throw new Error(`${prefix}lower_mapping_y1必须是数字`);
      }
      if (sensor.lower_mapping_x2 !== undefined && isNaN(sensor.lower_mapping_x2)) {
        throw new Error(`${prefix}lower_mapping_x2必须是数字`);
      }
      if (sensor.lower_mapping_y2 !== undefined && isNaN(sensor.lower_mapping_y2)) {
        throw new Error(`${prefix}lower_mapping_y2必须是数字`);
      }
    });
    
    return true;
  }),

  handleValidationErrors
]

/**
 * 传感器更新验证规则（支持批量操作）
 */
const validateUpdate = [
  body('sensors')
  .isArray({ min: 1 })
  .withMessage('请提供传感器数据')
  .custom((sensors) => {
    if (!Array.isArray(sensors) || sensors.length === 0) {
      throw new Error('传感器列表不能为空');
    }
    
    sensors.forEach((sensor, index) => {
      const prefix = `[${index}].`;
      
      // 验证必需字段（更新时只需要sensor_id）
      if (!sensor.sensor_id) {
        throw new Error(`${prefix}sensor_id不能为空`);
      } else if (sensor.sensor_id.length < 1 || sensor.sensor_id.length > 50) {
        throw new Error(`${prefix}sensor_id长度必须在1-50个字符之间`);
      }
      
      // 验证可选字段
      if (sensor.sensor_name !== undefined && (sensor.sensor_name.length < 1 || sensor.sensor_name.length > 100)) {
        throw new Error(`${prefix}sensor_name长度必须在1-100个字符之间`);
      }
      
      if (sensor.sensor_type && !['数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串'].includes(sensor.sensor_type)) {
        throw new Error(`${prefix}sensor_type无效`);
      }
      
      if (sensor.decimal_places !== undefined && (sensor.decimal_places < 0 || sensor.decimal_places > 10)) {
        throw new Error(`${prefix}decimal_places必须在0-10之间`);
      }
      
      if (sensor.unit && sensor.unit.length > 20) {
        throw new Error(`${prefix}unit长度不能超过20个字符`);
      }
      
      if (sensor.sort_order !== undefined && sensor.sort_order < 0) {
        throw new Error(`${prefix}sort_order必须是非负整数`);
      }
      
      // 验证映射字段
      if (sensor.upper_mapping_x1 !== undefined && isNaN(sensor.upper_mapping_x1)) {
        throw new Error(`${prefix}upper_mapping_x1必须是数字`);
      }
      if (sensor.upper_mapping_y1 !== undefined && isNaN(sensor.upper_mapping_y1)) {
        throw new Error(`${prefix}upper_mapping_y1必须是数字`);
      }
      if (sensor.upper_mapping_x2 !== undefined && isNaN(sensor.upper_mapping_x2)) {
        throw new Error(`${prefix}upper_mapping_x2必须是数字`);
      }
      if (sensor.upper_mapping_y2 !== undefined && isNaN(sensor.upper_mapping_y2)) {
        throw new Error(`${prefix}upper_mapping_y2必须是数字`);
      }
      if (sensor.lower_mapping_x1 !== undefined && isNaN(sensor.lower_mapping_x1)) {
        throw new Error(`${prefix}lower_mapping_x1必须是数字`);
      }
      if (sensor.lower_mapping_y1 !== undefined && isNaN(sensor.lower_mapping_y1)) {
        throw new Error(`${prefix}lower_mapping_y1必须是数字`);
      }
      if (sensor.lower_mapping_x2 !== undefined && isNaN(sensor.lower_mapping_x2)) {
        throw new Error(`${prefix}lower_mapping_x2必须是数字`);
      }
      if (sensor.lower_mapping_y2 !== undefined && isNaN(sensor.lower_mapping_y2)) {
        throw new Error(`${prefix}lower_mapping_y2必须是数字`);
      }
    });
    
    return true;
  }),

  handleValidationErrors
]

/**
 * 传感器查询参数验证规则
 */
const validateQuery = [
  query('sensorId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  query('dtuId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  // 自定义验证：至少需要提供sensorId或dtuId中的一种
  (req, res, next) => {
    const { sensorId, dtuId } = req.query;
    
    if (!sensorId && !dtuId) {
      return res.status(400).json({
        success: false,
        message: '查询参数错误：必须提供sensorId或dtuId中的至少一种'
      });
    }
    
    next();
  },
  
  handleValidationErrors
];

/**
 * 传感器删除参数验证规则
 */
const validateDelete = [
  body('sensorId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  body('dtuId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  // 自定义验证：至少需要提供sensorId或dtuId中的一种
  (req, res, next) => {
    const { sensorId, dtuId } = req.body;
    
    if (!sensorId && !dtuId) {
      return res.status(400).json({
        success: false,
        message: '删除参数错误：必须提供sensorId或dtuId中的至少一种'
      });
    }
    
    next();
  },
  
  handleValidationErrors
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateQuery,
  validateDelete
};
