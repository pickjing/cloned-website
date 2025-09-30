const db = require('../services/database');
const logger = require('../utils/logger');
const cache = require('../services/cache');
const TransactionService = require('../services/transaction');

class DeviceData {
  // 获取所有DTU设备
  static async getAllDTUDevices(params = {}) {
    try {
      // 确保参数是有效的数字
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.max(1, parseInt(params.limit) || 20);
      const offset = (page - 1) * limit;
      
      logger.debug('Getting all DTU devices', { page, limit, offset, params });
      
      // 生成缓存键
      const cacheKey = cache.generateKey('dtu_devices', {
        page,
        limit,
        group: params.group || '',
        status: params.status || '',
        search: params.search || ''
      });
      
      // 尝试从缓存获取
      const cached = cache.get(cacheKey, 'short');
      if (cached) {
        logger.debug('Cache hit for DTU devices', { cacheKey });
        return cached;
      }
      
      let whereClause = '';
      let queryParams = [];
      
      // 添加分组过滤
      if (params.group && params.group !== 'undefined' && params.group !== 'null' && params.group.trim() !== '') {
        whereClause += ' AND device_group = ?';
        queryParams.push(params.group.trim());
      }
      
      // 添加状态过滤
      if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status.trim() !== '') {
        whereClause += ' AND status = ?';
        queryParams.push(params.status.trim());
      }
      
      // 添加搜索过滤
      if (params.search && params.search !== 'undefined' && params.search !== 'null' && params.search.trim() !== '') {
        whereClause += ' AND (dtu_name LIKE ? OR dtu_id LIKE ? OR serial_number LIKE ?)';
        const searchPattern = `%${params.search.trim()}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      // 构建完整的WHERE子句
      if (whereClause) {
        whereClause = 'WHERE ' + whereClause.substring(5); // 移除开头的 ' AND '
      }
      
      // 获取总数量
      let countQuery = 'SELECT COUNT(*) as total FROM dtu_devices';
      if (whereClause) {
        countQuery += ' ' + whereClause;
      }
      
      logger.debug('Count query', { query: countQuery, params: queryParams });
      
      let countResult;
      if (queryParams.length > 0) {
        [countResult] = await db.execute(countQuery, queryParams);
      } else {
        [countResult] = await db.execute(countQuery);
      }
      const total = countResult[0].total;
      
      // 获取分页数据
      let dataQuery = 'SELECT * FROM dtu_devices';
      if (whereClause) {
        dataQuery += ' ' + whereClause;
      }
      // 直接使用数字而不是占位符，避免MySQL2的参数问题
      dataQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      logger.debug('Data query', { query: dataQuery, limit, offset });
      
      let devices;
      // 由于LIMIT和OFFSET已经直接写在SQL中，只需要传递WHERE条件的参数
      if (queryParams.length > 0) {
        logger.debug('Executing query with WHERE params', { params: queryParams });
        [devices] = await db.execute(dataQuery, queryParams);
      } else {
        logger.debug('Executing query without WHERE params');
        [devices] = await db.execute(dataQuery);
      }
      
      const cleanDevices = devices || [];
      
      const result = {
        devices: cleanDevices,
        total: total || 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((total || 0) / limit)
      };
      
      // 缓存结果（1分钟）
      cache.set(cacheKey, result, 60, 'short');
      
      logger.debug('Query result', { 
        deviceCount: result.devices.length, 
        total: result.total, 
        page: result.page 
      });
      return result;
      
    } catch (error) {
      logger.error('Failed to get DTU devices', {
        error: error.message,
        code: error.code,
        errno: error.errno,
        sql: error.sql,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      
      // 返回空结果而不是抛出错误
      return {
        devices: [],
        total: 0,
        page: parseInt(params.page || 1),
        limit: parseInt(params.limit || 20),
        totalPages: 0
      };
    }
  }


  // 根据传感器ID获取传感器数据
  static async getTemperatureDataBySensorId(sensor_id, limit = 100) {
    const cacheKey = cache.generateKey('sensor_data', { sensor_id, limit });
    
    return await cache.cacheQuery(cacheKey, async () => {
      const [rows] = await db.execute(
        'SELECT * FROM sensor_data WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?',
        [sensor_id, limit]
      );
      return rows;
    }, 60, 'short'); // 1分钟缓存，因为传感器数据变化频繁
  }

  // 根据DTU设备ID获取所有传感器的数据
  static async getTemperatureDataByDTUId(dtu_id, limit = 100) {
    const [rows] = await db.execute(`
      SELECT td.*, s.sensor_name
      FROM sensor_data td
      JOIN sensors s ON td.sensor_id = s.sensor_id
      WHERE s.dtu_id = ?
      ORDER BY td.timestamp DESC
      LIMIT ?
    `, [dtu_id, limit]);
    return rows;
  }

  // 创建DTU设备
  static async createDTUDevice(data) {
    const { 
      dtu_id, 
      serial_number, 
      dtu_group, 
      dtu_name, 
      dtu_image, 
      link_protocol, 
      offline_delay, 
      timezone_setting, 
      longitude, 
      latitude, 
      status 
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO dtu_devices (
        dtu_id, serial_number, dtu_group, dtu_name, dtu_image, 
        link_protocol, offline_delay, timezone_setting, longitude, latitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dtu_id, serial_number, dtu_group, dtu_name, dtu_image, 
       link_protocol, offline_delay, timezone_setting, longitude, latitude, status]
    );
    return result;
  }


  // 创建传感器数据
  static async createTemperatureData(data) {
    const { sensor_id, data_value, timestamp, data_quality } = data;
    const [result] = await db.execute(
      'INSERT INTO sensor_data (sensor_id, data_value, timestamp, data_quality) VALUES (?, ?, ?, ?)',
      [sensor_id, data_value, timestamp, data_quality]
    );
    return result;
  }

  // 记录DTU设备注册
  static async recordDTURegistration(data) {
    const { dtu_id, registration_time, ip_address, port, firmware_version, software_version } = data;
    const [result] = await db.execute(
      'INSERT INTO dtu_registrations (dtu_id, registration_time, ip_address, port, firmware_version, software_version) VALUES (?, ?, ?, ?, ?, ?)',
      [dtu_id, registration_time, ip_address, port, firmware_version, software_version]
    );
    return result;
  }

  // 获取设备统计信息
  static async getDeviceStatistics() {
    const [dtuCount] = await db.execute('SELECT COUNT(*) as count FROM dtu_devices');
    const [sensorCount] = await db.execute('SELECT COUNT(*) as count FROM sensors');
    const [dataCount] = await db.execute('SELECT COUNT(*) as count FROM sensor_data');
    
    return {
      dtu_count: dtuCount[0].count,
      sensor_count: sensorCount[0].count,
      data_count: dataCount[0].count
    };
  }

  // 获取传感器数据趋势（最近24小时，每小时一个数据点）
  static async getTemperatureTrend(sensor_id, hours = 24) {
    const [rows] = await db.execute(`
      SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
        AVG(data_value) as avg_temperature,
        MIN(data_value) as min_temperature,
        MAX(data_value) as max_temperature
      FROM sensor_data 
      WHERE sensor_id = ? 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY hour
      ORDER BY hour
    `, [sensor_id, hours]);
    return rows;
  }

  // 获取异常数据（超出阈值范围）
  static async getAbnormalTemperatureData(minTemp = -10, maxTemp = 50) {
    const [rows] = await db.execute(`
      SELECT td.*, s.sensor_name
      FROM sensor_data td
      JOIN sensors s ON td.sensor_id = s.sensor_id
      WHERE td.data_value < ? OR td.data_value > ?
      ORDER BY td.timestamp DESC
      LIMIT 100
    `, [minTemp, maxTemp]);
    return rows;
  }




  // 智能移动设备到分组（只移动分组不同的设备）
  static async moveDevicesToGroup(deviceIds, targetGroup) {
    try {
      logger.info('Starting device group move', { deviceIds, targetGroup });
      
      // 1. 获取所有设备的当前分组信息
      const placeholders = deviceIds.map(() => '?').join(',');
      const [devices] = await db.execute(`
        SELECT dtu_id, dtu_name, dtu_group 
        FROM dtu_devices 
        WHERE dtu_id IN (${placeholders})
      `, deviceIds);
      
      logger.debug('Found devices for group move', { deviceCount: devices.length });
      
      // 2. 筛选需要移动的设备（分组不同的设备）
      const devicesToMove = devices.filter(device => device.device_group !== targetGroup);
      const devicesInTargetGroup = devices.filter(device => device.device_group === targetGroup);
      
      logger.debug('Devices to move', { count: devicesToMove.length });
      logger.debug('Devices already in target group', { count: devicesInTargetGroup.length });
      
      // 3. 如果没有需要移动的设备，返回结果
      if (devicesToMove.length === 0) {
        return {
          moved_count: 0,
          skipped_count: devicesInTargetGroup.length,
          message: '所有设备已在目标分组中'
        };
      }
      
      // 4. 批量更新需要移动的设备
      const deviceIdsToMove = devicesToMove.map(device => device.dtu_id);
      const updatePlaceholders = deviceIdsToMove.map(() => '?').join(',');
      const updateParams = [targetGroup, ...deviceIdsToMove];
      
      const [result] = await db.execute(
        `UPDATE dtu_devices SET dtu_group = ? WHERE dtu_id IN (${updatePlaceholders})`,
        updateParams
      );
      
      logger.info('Group move completed', { affectedRows: result.affectedRows });
      
      // 清除相关缓存，确保前端能立即看到更新
      cache.deletePattern('dtu_devices:.*', 'short');
      cache.deletePattern('dtu_groups_names:.*', 'long');
      
      return {
        moved_count: result.affectedRows,
        skipped_count: devicesInTargetGroup.length,
        message: `成功移动 ${result.affectedRows} 个设备到"${targetGroup}"分组`
      };
      
    } catch (error) {
      console.error('移动设备到分组失败:', error);
      throw error;
    }
  }

  // 软删除DTU设备（标记为已删除状态）
  static async softDeleteDTUDevices(deviceIds) {
    try {
      logger.info('Starting soft delete', { deviceIds });
      
      const placeholders = deviceIds.map(() => '?').join(',');
      const [result] = await db.execute(
        `UPDATE dtu_devices SET status = '已删除', updated_at = NOW() WHERE dtu_id IN (${placeholders})`,
        deviceIds
      );
      
      logger.info('Soft delete completed', { affectedRows: result.affectedRows });
      return { affectedRows: result.affectedRows };
      
    } catch (error) {
      console.error('软删除设备失败:', error);
      throw error;
    }
  }

  // 恢复已删除的DTU设备
  static async restoreDTUDevices(deviceIds) {
    try {
      logger.info('Starting device restore', { deviceIds });
      
      const placeholders = deviceIds.map(() => '?').join(',');
      const [result] = await db.execute(
        `UPDATE dtu_devices SET status = '未连接', updated_at = NOW() WHERE dtu_id IN (${placeholders}) AND status = '已删除'`,
        deviceIds
      );
      
      logger.info('Device restore completed', { affectedRows: result.affectedRows });
      return { affectedRows: result.affectedRows };
      
    } catch (error) {
      console.error('恢复设备失败:', error);
      throw error;
    }
  }

  // 彻底删除DTU设备（从数据库中永久删除，包括相关传感器和协议）
  static async permanentlyDeleteDTUDevices(deviceIds) {
    const cascadeTables = [
      { table: 'mb_rtu', field: 'dtu_id' },
      { table: 'sensors', field: 'dtu_id' }
    ];

    return await TransactionService.cascadeDelete(
      'dtu_devices',
      'dtu_id',
      deviceIds,
      cascadeTables,
      {
        isolationLevel: 'READ COMMITTED',
        timeout: 30000,
        retries: 3
      }
    );
  }

  // 级联复制DTU设备（包括传感器和协议）
  static async copyDTUDevices(deviceIds) {
    const connection = await db.getConnection();
    const results = {
      success: [],
      failed: [],
      totalSensors: 0,
      totalConfigs: 0
    };
    
    try {
      logger.info('Starting cascade copy', { deviceIds });
      
      for (const deviceId of deviceIds) {
        try {
          // 1. 获取原设备信息
          const [deviceRows] = await connection.execute(
            'SELECT * FROM dtu_devices WHERE dtu_id = ? AND status != "已删除"',
            [deviceId]
          );
          
          if (deviceRows.length === 0) {
            results.failed.push({ deviceId, reason: '设备不存在或已删除' });
            continue;
          }
          
          const originalDevice = deviceRows[0];
          
          // 2. 生成新设备信息
          const newDeviceId = this.generateDeviceId();
          const newDeviceName = originalDevice.device_name + '复制';
          const newSerialNumber = this.generateSerialNumber();
          
          // 3. 复制设备
          await connection.execute(
            `INSERT INTO dtu_devices (
              dtu_id, serial_number, dtu_group, dtu_name, dtu_image,
              link_protocol, offline_delay, timezone_setting, longitude, latitude, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newDeviceId,
              newSerialNumber,
              originalDevice.device_group,
              newDeviceName,
              originalDevice.device_image,
              originalDevice.link_protocol,
              originalDevice.offline_delay,
              originalDevice.timezone_setting,
              originalDevice.longitude,
              originalDevice.latitude,
              '未连接' // 新设备默认为未连接状态
            ]
          );
          
          // 4. 查询该设备下的所有传感器
          const [sensorRows] = await connection.execute(
            'SELECT * FROM sensors WHERE dtu_id = ?',
            [deviceId]
          );
          
          // 5. 复制每个传感器
          for (const sensor of sensorRows) {
            const newSensorId = this.generateSensorId();
            
            await connection.execute(
              `INSERT INTO sensors (
                sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit,
                sort_order, upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
                lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newSensorId,
                newDeviceId,
                sensor.icon,
                sensor.sensor_name, // 传感器名称保持不变
                sensor.sensor_type,
                sensor.decimal_places,
                sensor.unit,
                sensor.sort_order,
                sensor.upper_mapping_x1,
                sensor.upper_mapping_y1,
                sensor.upper_mapping_x2,
                sensor.upper_mapping_y2,
                sensor.lower_mapping_x1,
                sensor.lower_mapping_y1,
                sensor.lower_mapping_x2,
                sensor.lower_mapping_y2
              ]
            );
            
            results.totalSensors++;
            
            // 6. 复制该传感器对应的MB RTU协议
            const [configRows] = await connection.execute(
              'SELECT * FROM mb_rtu WHERE dtu_id = ? AND sensor_id = ?',
              [deviceId, sensor.sensor_id]
            );
            
            if (configRows.length > 0) {
              const config = configRows[0];
              
              await connection.execute(
                `INSERT INTO mb_rtu (
                  dtu_id, sensor_id, slave_address, function_code, offset_value,
                  data_format, data_bits, byte_order_value, collection_cycle
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  newDeviceId,
                  newSensorId,
                  config.slave_address,
                  config.function_code,
                  config.offset_value,
                  config.data_format,
                  config.data_bits,
                  config.byte_order_value,
                  config.collection_cycle
                ]
              );
              
              results.totalConfigs++;
            }
          }
          
          results.success.push({
            originalDeviceId: deviceId,
            newDeviceId: newDeviceId,
            newDeviceName: newDeviceName,
            sensorsCount: sensorRows.length
          });
          
          logger.info('Device copied successfully', { originalId: deviceId, newId: newDeviceId });
          
        } catch (error) {
          // 单个设备复制失败，记录错误但继续处理其他设备
          results.failed.push({
            deviceId: deviceId,
            reason: error.message
          });
          console.error(`复制设备 ${deviceId} 失败:`, error);
        }
      }
      
      logger.info('Cascade copy completed', { results });
      return results;
      
    } finally {
      connection.release();
    }
  }

  // 生成设备ID
  static generateDeviceId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `DTU_${timestamp}_${random}`;
  }

  // 生成传感器ID
  static generateSensorId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `SENSOR_${timestamp}_${random}`;
  }

  // 生成序列号
  static generateSerialNumber() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `COPY_${timestamp}_${random}`;
  }

  // 批量创建设备（包含传感器和MB-RTU配置）- 使用事务
  static async createDeviceWithSensors(deviceData, sensors, mbRtuConfigs) {
    return await TransactionService.execute(async (connection) => {
      logger.info('Starting device creation with sensors', {
        deviceId: deviceData.dtu_id,
        sensorsCount: sensors.length,
        mbRtuConfigsCount: mbRtuConfigs.length
      });

      // 1. 创建设备
      const [deviceResult] = await connection.execute(
        `INSERT INTO dtu_devices (
          dtu_id, serial_number, dtu_group, dtu_name, dtu_image, 
          link_protocol, offline_delay, timezone_setting, longitude, latitude, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
              deviceData.dtu_id, deviceData.serial_number, deviceData.dtu_group, 
              deviceData.dtu_name, deviceData.dtu_image, deviceData.link_protocol, 
          deviceData.offline_delay, deviceData.timezone_setting, deviceData.longitude, 
          deviceData.latitude, deviceData.status
        ]
      );

      logger.debug('Device created', { deviceId: deviceData.dtu_id, insertId: deviceResult.insertId });

      // 2. 创建传感器
      const sensorResults = [];
      for (const sensor of sensors) {
        const [sensorResult] = await connection.execute(
          `INSERT INTO sensors (
            sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit,
            sort_order, upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
            lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sensor.sensor_id, sensor.dtu_id, sensor.icon, sensor.sensor_name, sensor.sensor_type,
            sensor.decimal_places, sensor.unit, sensor.sort_order, sensor.upper_mapping_x1,
            sensor.upper_mapping_y1, sensor.upper_mapping_x2, sensor.upper_mapping_y2,
            sensor.lower_mapping_x1, sensor.lower_mapping_y1, sensor.lower_mapping_x2, sensor.lower_mapping_y2
          ]
        );
        sensorResults.push({ sensor_id: sensor.sensor_id, insertId: sensorResult.insertId });
      }

      logger.debug('Sensors created', { count: sensorResults.length });

      // 3. 创建MB-RTU协议配置
      const mbRtuResults = [];
      for (const config of mbRtuConfigs) {
        const [mbRtuResult] = await connection.execute(
          `INSERT INTO mb_rtu (
            dtu_id, sensor_id, slave_address, function_code, offset_value,
            data_format, data_bits, byte_order_value, collection_cycle
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            config.dtu_id, config.sensor_id, config.slave_address, config.function_code,
            config.offset_value, config.data_format, config.data_bits, config.byte_order_value, config.collection_cycle
          ]
        );
        mbRtuResults.push({ configId: `${config.dtu_id}_${config.sensor_id}`, insertId: mbRtuResult.insertId });
      }

      logger.debug('MB-RTU configs created', { count: mbRtuResults.length });

      // 清除相关缓存
      cache.deletePattern('dtu_devices:.*', 'short');
      cache.deletePattern('sensors:.*', 'short');
      cache.deletePattern('mb_rtu:.*', 'short');

      const result = {
        device: {
          deviceId: deviceData.dtu_id,
          insertId: deviceResult.insertId
        },
        sensors: sensorResults,
        mbRtuConfigs: mbRtuResults,
        summary: {
          deviceCreated: 1,
          sensorsCreated: sensorResults.length,
          mbRtuConfigsCreated: mbRtuResults.length
        }
      };

      logger.info('Device creation completed successfully', result.summary);
      return result;
    });
  }
}

module.exports = DeviceData;