/**
 * MB-RTU更新数据验证规则
 * 验证每个MB-RTU配置的所有数据字段
 */
const validateData = [
  // 自定义验证：验证MB-RTU配置数据
  (req, res, next) => {
    const data = req.body;
    
    // 统一处理：将单个对象转换为数组
    const configs = Array.isArray(data) ? data : [data];
    const errors = [];
    
    configs.forEach((config, index) => {
      const prefix = Array.isArray(data) ? `[${index}].` : '';
      
      // 验证必需字段
      if (!config.dtu_id) {
        errors.push({ msg: `${prefix}dtu_id不能为空` });
      } else if (config.dtu_id.length < 1 || config.dtu_id.length > 50) {
        errors.push({ msg: `${prefix}dtu_id长度必须在1-50个字符之间` });
      }
      
      if (!config.sensor_id) {
        errors.push({ msg: `${prefix}sensor_id不能为空` });
      } else if (config.sensor_id.length < 1 || config.sensor_id.length > 50) {
        errors.push({ msg: `${prefix}sensor_id长度必须在1-50个字符之间` });
      }
      
      // 验证从站地址
      if (config.slave_address !== undefined) {
        if (!Number.isInteger(config.slave_address) || config.slave_address < 1 || config.slave_address > 247) {
          errors.push({ msg: `${prefix}slave_address必须在1-247之间` });
        }
      }
      
      // 验证功能码
      if (config.function_code !== undefined) {
        const validFunctionCodes = ['01读写', '02只读', '03读写', '04只读'];
        if (!validFunctionCodes.includes(config.function_code)) {
          errors.push({ msg: `${prefix}function_code无效，必须是：${validFunctionCodes.join('、')}` });
        }
      }
      
      // 验证偏置值
      if (config.offset_value !== undefined && isNaN(config.offset_value)) {
        errors.push({ msg: `${prefix}offset_value必须是数字` });
      }
      
      // 验证数据格式
      if (config.data_format !== undefined) {
        const validDataFormats = ['16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码'];
        if (!validDataFormats.includes(config.data_format)) {
          errors.push({ msg: `${prefix}data_format无效，必须是：${validDataFormats.join('、')}` });
        }
      }
      
      // 验证采集周期
      if (config.collection_cycle !== undefined) {
        if (!Number.isInteger(config.collection_cycle) || config.collection_cycle < 1 || config.collection_cycle > 3600) {
          errors.push({ msg: `${prefix}collection_cycle必须在1-3600秒之间` });
        }
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.map(err => err.msg)
      });
    }
    
    next();
  }
];

/**
 * MB-RTU查询参数验证规则
 * 至少需要提供dtuId，可选提供sensorId
 */
const validateQuery = [
  // 自定义验证：至少需要提供dtuId
  (req, res, next) => {
    const { dtuId, sensorId } = req.query;
    
    if (!dtuId) {
      return res.status(400).json({
        success: false,
        message: '查询参数错误：必须提供dtuId'
      });
    }
    
    // 验证dtuId格式
    if (dtuId.length < 1 || dtuId.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'DTU设备ID长度必须在1-50个字符之间'
      });
    }
    
    // 验证sensorId格式（如果提供）
    if (sensorId && (sensorId.length < 1 || sensorId.length > 50)) {
      return res.status(400).json({
        success: false,
        message: '传感器ID长度必须在1-50个字符之间'
      });
    }
    
    next();
  }
];

module.exports = {
  validateData,
  validateQuery,
};
