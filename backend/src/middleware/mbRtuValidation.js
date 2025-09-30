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
 * MB-RTU更新数据验证规则
 * 验证每个MB-RTU配置的所有数据字段
 */
const validateData = [
  body('mb-rtu')
    .isArray({ min: 1 })
    .withMessage('请提供MB-RTU配置数据')
    .custom((configs) => {
      if (!Array.isArray(configs) || configs.length === 0) {
        throw new Error('MB-RTU配置列表不能为空');
      }
      
      configs.forEach((config, index) => {
        const prefix = `[${index}].`;
        
        // 验证必需字段
        if (!config.dtu_id) {
          throw new Error(`${prefix}dtu_id不能为空`);
        } else if (config.dtu_id.length < 1 || config.dtu_id.length > 50) {
          throw new Error(`${prefix}dtu_id长度必须在1-50个字符之间`);
        }
        
        if (!config.sensor_id) {
          throw new Error(`${prefix}sensor_id不能为空`);
        } else if (config.sensor_id.length < 1 || config.sensor_id.length > 50) {
          throw new Error(`${prefix}sensor_id长度必须在1-50个字符之间`);
        }
        
        // 验证从站地址
        if (config.slave_address !== undefined) {
          if (!Number.isInteger(config.slave_address) || config.slave_address < 1 || config.slave_address > 247) {
            throw new Error(`${prefix}slave_address必须在1-247之间`);
          }
        }
        
        // 验证功能码
        if (config.function_code !== undefined) {
          const validFunctionCodes = ['01读写', '02只读', '03读写', '04只读'];
          if (!validFunctionCodes.includes(config.function_code)) {
            throw new Error(`${prefix}function_code无效，必须是：${validFunctionCodes.join('、')}`);
          }
        }
        
        // 验证偏置值
        if (config.offset_value !== undefined && isNaN(config.offset_value)) {
          throw new Error(`${prefix}offset_value必须是数字`);
        }
        
        // 验证数据格式
        if (config.data_format !== undefined) {
          const validDataFormats = ['16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码'];
          if (!validDataFormats.includes(config.data_format)) {
            throw new Error(`${prefix}data_format无效，必须是：${validDataFormats.join('、')}`);
          }
        }
        
        // 验证采集周期
        if (config.collection_cycle !== undefined) {
          if (!Number.isInteger(config.collection_cycle) || config.collection_cycle < 1 || config.collection_cycle > 3600) {
            throw new Error(`${prefix}collection_cycle必须在1-3600秒之间`);
          }
        }
      });
      
      return true;
    }),
  
  handleValidationErrors
];

/**
 * MB-RTU查询参数验证规则
 * 至少需要提供dtu_id，可选提供sensor_id
 */
const validateQuery = [
  query('dtu_id')
    .notEmpty()
    .withMessage('必须提供dtu_id')
    .isLength({ min: 1, max: 50 })
    .withMessage('DTU设备ID长度必须在1-50个字符之间'),
  
  query('sensor_id')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('传感器ID长度必须在1-50个字符之间'),
  
  handleValidationErrors
];

module.exports = {
  validateData,
  validateQuery,
};
