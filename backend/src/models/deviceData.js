const db = require('../services/database');

class DeviceData {
  // 获取所有DTU设备
  static async getAllDTUDevices(params = {}) {
    try {
      // 确保参数是有效的数字
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.max(1, parseInt(params.limit) || 20);
      const offset = (page - 1) * limit;
      
      console.log('getAllDTUDevices 参数:', { page, limit, offset, params });
      
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
        whereClause += ' AND (device_name LIKE ? OR device_id LIKE ? OR serial_number LIKE ?)';
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
      
      console.log('Count查询:', countQuery, '参数:', queryParams);
      
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
      
      console.log('Data查询:', dataQuery, 'LIMIT/OFFSET参数:', [limit, offset]);
      
      let devices;
      // 由于LIMIT和OFFSET已经直接写在SQL中，只需要传递WHERE条件的参数
      if (queryParams.length > 0) {
        console.log('执行查询，WHERE参数:', queryParams);
        [devices] = await db.execute(dataQuery, queryParams);
      } else {
        console.log('执行查询，无WHERE参数');
        [devices] = await db.execute(dataQuery);
      }
      
      const result = {
        devices: devices || [],
        total: total || 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((total || 0) / limit)
      };
      
      console.log('查询结果:', result);
      return result;
      
    } catch (error) {
      console.error('获取DTU设备失败:', error);
      console.error('错误详情:', {
        code: error.code,
        errno: error.errno,
        sql: error.sql,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
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

  // 根据DTU设备ID获取传感器列表
  static async getSensorsByDTUId(dtuId) {
    const [rows] = await db.execute(
      'SELECT * FROM sensors WHERE dtu_id = ? ORDER BY sensor_id',
      [dtuId]
    );
    return rows;
  }

  // 根据传感器ID获取传感器数据
  static async getTemperatureDataBySensorId(sensorId, limit = 100) {
    const [rows] = await db.execute(
      'SELECT * FROM sensor_data WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?',
      [sensorId, limit]
    );
    return rows;
  }

  // 根据DTU设备ID获取所有传感器的数据
  static async getTemperatureDataByDTUId(dtuId, limit = 100) {
    const [rows] = await db.execute(`
      SELECT td.*, s.sensor_name
      FROM sensor_data td
      JOIN sensors s ON td.sensor_id = s.sensor_id
      WHERE s.dtu_id = ?
      ORDER BY td.timestamp DESC
      LIMIT ?
    `, [dtuId, limit]);
    return rows;
  }

  // 创建DTU设备
  static async createDTUDevice(data) {
    const { 
      device_id, 
      serial_number, 
      device_group, 
      device_name, 
      device_image, 
      link_protocol, 
      offline_delay, 
      timezone_setting, 
      longitude, 
      latitude, 
      status 
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO dtu_devices (
        device_id, serial_number, device_group, device_name, device_image, 
        link_protocol, offline_delay, timezone_setting, longitude, latitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_id, serial_number, device_group, device_name, device_image, 
       link_protocol, offline_delay, timezone_setting, longitude, latitude, status]
    );
    return result;
  }

  // 创建传感器
  static async createSensor(data) {
    const { 
      sensor_id, dtu_id, icon = '/image/传感器图片.png', sensor_name, sensor_type, decimal_places, unit, sort_order,
      upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
      lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO sensors (
        sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
        upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
        lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sensor_id, dtu_id, icon, sensor_name, sensor_type, decimal_places, unit, sort_order,
       upper_mapping_x1, upper_mapping_y1, upper_mapping_x2, upper_mapping_y2,
       lower_mapping_x1, lower_mapping_y1, lower_mapping_x2, lower_mapping_y2]
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
  static async getTemperatureTrend(sensorId, hours = 24) {
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
    `, [sensorId, hours]);
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

  // 获取设备分组
  static async getDeviceGroups() {
    // 从设备表中获取所有不重复的分组名
    const [rows] = await db.execute(`
      SELECT DISTINCT device_group as group_name 
      FROM dtu_devices 
      WHERE device_group IS NOT NULL AND device_group != '' 
      ORDER BY device_group
    `);
    return rows.map(row => row.group_name);
  }

  // 检查分组名是否存在
  static async checkGroupNameExists(groupName) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM device_groups WHERE group_name = ?',
      [groupName]
    );
    return rows[0].count > 0;
  }

  // 创建新分组
  static async createGroup(data) {
    const { group_name, description } = data;
    const [result] = await db.execute(
      'INSERT INTO device_groups (group_name, description) VALUES (?, ?)',
      [group_name, description]
    );
    return result;
  }

  // 创建MB RTU协议配置
  static async createMBRTUConfig(data) {
    const { 
      dtu_id, 
      sensor_id, 
      slave_address = 1, 
      function_code = '04只读', 
      offset_value = 0, 
      data_format = '16位有符号数', 
      data_bits = null, 
      byte_order_value = null, 
      collection_cycle = 2 
    } = data;
    
    console.log('创建MB RTU配置，参数:', {
      dtu_id, sensor_id, slave_address, function_code, offset_value, 
      data_format, data_bits, byte_order_value, collection_cycle
    });
    
    const [result] = await db.execute(
      `INSERT INTO mb_rtu_config (
        dtu_id, sensor_id, slave_address, function_code, offset_value, 
        data_format, data_bits, byte_order_value, collection_cycle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dtu_id, sensor_id, slave_address, function_code, offset_value, 
       data_format, data_bits, byte_order_value, collection_cycle]
    );
    return result;
  }

  // 智能移动设备到分组（只移动分组不同的设备）
  static async moveDevicesToGroup(deviceIds, targetGroup) {
    try {
      console.log('开始移动设备到分组:', { deviceIds, targetGroup });
      
      // 1. 获取所有设备的当前分组信息
      const placeholders = deviceIds.map(() => '?').join(',');
      const [devices] = await db.execute(
        `SELECT device_id, device_name, device_group FROM dtu_devices WHERE device_id IN (${placeholders})`,
        deviceIds
      );
      
      console.log('查询到的设备信息:', devices);
      
      // 2. 筛选需要移动的设备（分组不同的设备）
      const devicesToMove = devices.filter(device => device.device_group !== targetGroup);
      const devicesInTargetGroup = devices.filter(device => device.device_group === targetGroup);
      
      console.log('需要移动的设备:', devicesToMove);
      console.log('已在目标分组的设备:', devicesInTargetGroup);
      
      // 3. 如果没有需要移动的设备，返回结果
      if (devicesToMove.length === 0) {
        return {
          moved_count: 0,
          skipped_count: devicesInTargetGroup.length,
          message: '所有设备已在目标分组中'
        };
      }
      
      // 4. 批量更新需要移动的设备
      const deviceIdsToMove = devicesToMove.map(device => device.device_id);
      const updatePlaceholders = deviceIdsToMove.map(() => '?').join(',');
      const updateParams = [targetGroup, ...deviceIdsToMove];
      
      const [result] = await db.execute(
        `UPDATE dtu_devices SET device_group = ? WHERE device_id IN (${updatePlaceholders})`,
        updateParams
      );
      
      console.log('更新结果:', result);
      
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
      console.log('开始软删除设备:', deviceIds);
      
      const placeholders = deviceIds.map(() => '?').join(',');
      const [result] = await db.execute(
        `UPDATE dtu_devices SET status = '已删除', updated_at = NOW() WHERE device_id IN (${placeholders})`,
        deviceIds
      );
      
      console.log('软删除结果:', result);
      return { affectedRows: result.affectedRows };
      
    } catch (error) {
      console.error('软删除设备失败:', error);
      throw error;
    }
  }

  // 恢复已删除的DTU设备
  static async restoreDTUDevices(deviceIds) {
    try {
      console.log('开始恢复设备:', deviceIds);
      
      const placeholders = deviceIds.map(() => '?').join(',');
      const [result] = await db.execute(
        `UPDATE dtu_devices SET status = '未连接', updated_at = NOW() WHERE device_id IN (${placeholders}) AND status = '已删除'`,
        deviceIds
      );
      
      console.log('恢复结果:', result);
      return { affectedRows: result.affectedRows };
      
    } catch (error) {
      console.error('恢复设备失败:', error);
      throw error;
    }
  }

  // 彻底删除DTU设备（从数据库中永久删除，包括相关传感器和协议）
  static async permanentlyDeleteDTUDevices(deviceIds) {
    const connection = await db.getConnection();
    
    try {
      console.log('开始彻底删除设备:', deviceIds);
      
      await connection.beginTransaction();
      
      const placeholders = deviceIds.map(() => '?').join(',');
      
      // 1. 删除MB RTU协议配置
      console.log('删除MB RTU协议配置...');
      const [mbRtuResult] = await connection.execute(
        `DELETE FROM mb_rtu_config WHERE dtu_id IN (${placeholders})`,
        deviceIds
      );
      console.log(`删除了 ${mbRtuResult.affectedRows} 条MB RTU协议配置`);
      
      // 2. 删除传感器数据
      console.log('删除传感器数据...');
      const [sensorsResult] = await connection.execute(
        `DELETE FROM sensors WHERE dtu_id IN (${placeholders})`,
        deviceIds
      );
      console.log(`删除了 ${sensorsResult.affectedRows} 条传感器数据`);
      
      // 3. 删除DTU设备
      console.log('删除DTU设备...');
      const [devicesResult] = await connection.execute(
        `DELETE FROM dtu_devices WHERE device_id IN (${placeholders}) AND status = '已删除'`,
        deviceIds
      );
      console.log(`删除了 ${devicesResult.affectedRows} 条设备数据`);
      
      await connection.commit();
      
      const totalAffected = mbRtuResult.affectedRows + sensorsResult.affectedRows + devicesResult.affectedRows;
      
      console.log('彻底删除完成:', {
        devices: devicesResult.affectedRows,
        sensors: sensorsResult.affectedRows,
        mbRtuConfig: mbRtuResult.affectedRows,
        total: totalAffected
      });
      
      return { 
        affectedRows: devicesResult.affectedRows,
        deletedSensors: sensorsResult.affectedRows,
        deletedMbRtuConfig: mbRtuResult.affectedRows,
        totalDeleted: totalAffected
      };
      
    } catch (error) {
      console.error('彻底删除设备失败:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
      console.log('开始级联复制设备:', deviceIds);
      
      for (const deviceId of deviceIds) {
        try {
          // 1. 获取原设备信息
          const [deviceRows] = await connection.execute(
            'SELECT * FROM dtu_devices WHERE device_id = ? AND status != "已删除"',
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
              device_id, serial_number, device_group, device_name, device_image,
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
              'SELECT * FROM mb_rtu_config WHERE dtu_id = ? AND sensor_id = ?',
              [deviceId, sensor.sensor_id]
            );
            
            if (configRows.length > 0) {
              const config = configRows[0];
              
              await connection.execute(
                `INSERT INTO mb_rtu_config (
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
          
          console.log(`设备 ${deviceId} 复制成功，新设备ID: ${newDeviceId}`);
          
        } catch (error) {
          // 单个设备复制失败，记录错误但继续处理其他设备
          results.failed.push({
            deviceId: deviceId,
            reason: error.message
          });
          console.error(`复制设备 ${deviceId} 失败:`, error);
        }
      }
      
      console.log('级联复制完成:', results);
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
}

module.exports = DeviceData;