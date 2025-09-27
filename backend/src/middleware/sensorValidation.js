/**
 * 传感器验证规则（支持批量操作）
 */
const validateData = [
  // 自定义验证：支持单个对象或数组
  (req, res, next) => {
    const data = req.body;
    
    // 统一处理：将单个对象转换为数组
    const sensors = Array.isArray(data) ? data : [data];
    const errors = [];
    
    sensors.forEach((sensor, index) => {
      const prefix = Array.isArray(data) ? `[${index}].` : '';
      
      // 验证必需字段
      if (!sensor.sensor_id) {
        errors.push({ msg: `${prefix}sensor_id不能为空` });
      } else if (sensor.sensor_id.length < 1 || sensor.sensor_id.length > 50) {
        errors.push({ msg: `${prefix}sensor_id长度必须在1-50个字符之间` });
      }
      
      if (!sensor.dtu_id) {
        errors.push({ msg: `${prefix}dtu_id不能为空` });
      } else if (sensor.dtu_id.length < 1 || sensor.dtu_id.length > 50) {
        errors.push({ msg: `${prefix}dtu_id长度必须在1-50个字符之间` });
      }
      
      if (!sensor.sensor_name) {
        errors.push({ msg: `${prefix}sensor_name不能为空` });
      } else if (sensor.sensor_name.length < 1 || sensor.sensor_name.length > 100) {
        errors.push({ msg: `${prefix}sensor_name长度必须在1-100个字符之间` });
      }
      
      // 验证可选字段
      if (sensor.sensor_type && !['数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串'].includes(sensor.sensor_type)) {
        errors.push({ msg: `${prefix}sensor_type无效` });
      }
      
      if (sensor.decimal_places !== undefined && (sensor.decimal_places < 0 || sensor.decimal_places > 10)) {
        errors.push({ msg: `${prefix}decimal_places必须在0-10之间` });
      }
      
      if (sensor.unit && sensor.unit.length > 20) {
        errors.push({ msg: `${prefix}unit长度不能超过20个字符` });
      }
      
      if (sensor.sort_order !== undefined && sensor.sort_order < 0) {
        errors.push({ msg: `${prefix}sort_order必须是非负整数` });
      }
      
      // 验证映射字段
      if (sensor.upper_mapping_x1 !== undefined && isNaN(sensor.upper_mapping_x1)) {
        errors.push({ msg: `${prefix}upper_mapping_x1必须是数字` });
      }
      if (sensor.upper_mapping_y1 !== undefined && isNaN(sensor.upper_mapping_y1)) {
        errors.push({ msg: `${prefix}upper_mapping_y1必须是数字` });
      }
      if (sensor.upper_mapping_x2 !== undefined && isNaN(sensor.upper_mapping_x2)) {
        errors.push({ msg: `${prefix}upper_mapping_x2必须是数字` });
      }
      if (sensor.upper_mapping_y2 !== undefined && isNaN(sensor.upper_mapping_y2)) {
        errors.push({ msg: `${prefix}upper_mapping_y2必须是数字` });
      }
      if (sensor.lower_mapping_x1 !== undefined && isNaN(sensor.lower_mapping_x1)) {
        errors.push({ msg: `${prefix}lower_mapping_x1必须是数字` });
      }
      if (sensor.lower_mapping_y1 !== undefined && isNaN(sensor.lower_mapping_y1)) {
        errors.push({ msg: `${prefix}lower_mapping_y1必须是数字` });
      }
      if (sensor.lower_mapping_x2 !== undefined && isNaN(sensor.lower_mapping_x2)) {
        errors.push({ msg: `${prefix}lower_mapping_x2必须是数字` });
      }
      if (sensor.lower_mapping_y2 !== undefined && isNaN(sensor.lower_mapping_y2)) {
        errors.push({ msg: `${prefix}lower_mapping_y2必须是数字` });
      }
    });
    
    // 如果有错误，返回验证失败
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
 * 传感器查询参数验证规则
 */
const validateQuery = [
  // 自定义验证：至少需要提供sensorId或dtuId中的一种
  (req, res, next) => {
    const { sensorId, dtuId } = req.query;
    
    if (!sensorId && !dtuId) {
      return res.status(400).json({
        success: false,
        message: '查询参数错误：必须提供sensorId或dtuId中的至少一种'
      });
    }
    
    // 验证sensorId格式（如果提供）
    if (sensorId && (sensorId.length < 1 || sensorId.length > 50)) {
      return res.status(400).json({
        success: false,
        message: '传感器ID长度必须在1-50个字符之间'
      });
    }
    
    // 验证dtuId格式（如果提供）
    if (dtuId && (dtuId.length < 1 || dtuId.length > 50)) {
      return res.status(400).json({
        success: false,
        message: 'DTU设备ID长度必须在1-50个字符之间'
      });
    }
    
    next();
  }
];

module.exports = {
  validateData,
  validateQuery
};
