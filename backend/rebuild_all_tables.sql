-- 完全重建数据库表结构脚本
-- 确保所有表结构与 database_init.sql 完全一致

USE dam_monitoring_system;

-- 1. 删除依赖表（按依赖顺序）
DROP TABLE IF EXISTS mb_rtu_config;
DROP TABLE IF EXISTS sensor_data;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS dtu_registrations;
DROP TABLE IF EXISTS dtu_devices;

-- 2. 重新创建DTU设备表（按照 database_init.sql 的准确结构）
CREATE TABLE dtu_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL COMMENT '设备ID',
    serial_number VARCHAR(100) COMMENT '序列号',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建日期',
    device_group VARCHAR(100) COMMENT '设备分组',
    device_name VARCHAR(100) NOT NULL COMMENT '设备名称',
    device_image VARCHAR(255) DEFAULT 'https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com/fileUpload/productImg/20210407/20210407120039_997.jpg' COMMENT '设备图片路径',
    link_protocol VARCHAR(50) DEFAULT 'MB RTU' COMMENT '链接协议',
    offline_delay INT DEFAULT 300 COMMENT '掉线延时（秒）',
    timezone_setting VARCHAR(50) DEFAULT '+08:00' COMMENT '时区设置',
    longitude DECIMAL(10,7) COMMENT '经度',
    latitude DECIMAL(10,7) COMMENT '纬度',
    status ENUM('已连接', '未连接', '已删除', '已禁用') DEFAULT '未连接' COMMENT '设备状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_device_id (device_id),
    INDEX idx_device_name (device_name),
    INDEX idx_device_group (device_group),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DTU设备信息表';

-- 3. 重新创建传感器表（按照 database_init.sql 的准确结构）
CREATE TABLE sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50) UNIQUE NOT NULL COMMENT '传感器唯一标识',
    dtu_id VARCHAR(50) NOT NULL COMMENT '所属DTU设备ID',
    icon VARCHAR(255) DEFAULT 'https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com//images/temperature.png' COMMENT '传感器图标路径',
    sensor_name VARCHAR(100) NOT NULL COMMENT '传感器名称',
    sensor_type ENUM('数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串') DEFAULT '数值型' COMMENT '传感器类型',
    decimal_places INT DEFAULT 1 COMMENT '小数位数',
    unit VARCHAR(20) DEFAULT '°C' COMMENT '单位',
    sort_order INT COMMENT '排序（为空则自动排序）',
    upper_mapping_x1 DECIMAL(10,4) DEFAULT -32768 COMMENT '上行映射原始值下限',
    upper_mapping_y1 DECIMAL(10,4) DEFAULT 32767 COMMENT '上行映射原始值上限',
    upper_mapping_x2 DECIMAL(10,4) DEFAULT -2048 COMMENT '上行映射实际值下限',
    upper_mapping_y2 DECIMAL(10,4) DEFAULT 2047.9 COMMENT '上行映射实际值上限',
    lower_mapping_x1 DECIMAL(10,4) COMMENT '下行映射实际值下限',
    lower_mapping_y1 DECIMAL(10,4) COMMENT '下行映射实际值上限',
    lower_mapping_x2 DECIMAL(10,4) COMMENT '下行映射原始值下限',
    lower_mapping_y2 DECIMAL(10,4) COMMENT '下行映射原始值上限',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(device_id) ON DELETE CASCADE,
    INDEX idx_sensor_id (sensor_id),
    INDEX idx_dtu_id (dtu_id),
    INDEX idx_sensor_name (sensor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传感器信息表';

-- 4. 重新创建MB RTU协议配置表
CREATE TABLE mb_rtu_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dtu_id VARCHAR(50) NOT NULL COMMENT '所属DTU设备ID',
    sensor_id VARCHAR(50) NOT NULL COMMENT '关联传感器ID',
    slave_address INT DEFAULT 1 COMMENT '从站地址',
    function_code ENUM('01读写', '02只读', '03读写', '04只读') DEFAULT '04只读' COMMENT '功能码',
    offset_value DECIMAL(10,4) DEFAULT 0 COMMENT '偏置（按传感器order设置）',
    data_format ENUM('16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码') DEFAULT '16位有符号数' COMMENT '数据格式',
    data_bits INT COMMENT '数据位（正整数，默认为空）',
    byte_order_value INT COMMENT '字节顺序（正整数，默认为空）',
    collection_cycle INT DEFAULT 2 COMMENT '采集周期（秒，默认2）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (dtu_id, sensor_id),
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    INDEX idx_dtu_sensor (dtu_id, sensor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modbus RTU协议配置表';

-- 5. 重新创建传感器数据表
CREATE TABLE sensor_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL COMMENT '传感器唯一标识',
    data_value DECIMAL(18,8) NOT NULL COMMENT '数据值',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '数据采集时间',
    data_quality VARCHAR(50) DEFAULT 'good' COMMENT '数据质量 (如 good, bad, uncertain)',
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    INDEX idx_sensor_id_timestamp (sensor_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传感器数据表';

-- 6. 重新创建DTU注册记录表
CREATE TABLE dtu_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dtu_id VARCHAR(50) NOT NULL COMMENT 'DTU设备唯一标识',
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    ip_address VARCHAR(45) COMMENT '注册时的IP地址',
    port INT COMMENT '注册时的端口',
    firmware_version VARCHAR(50) COMMENT '固件版本',
    software_version VARCHAR(50) COMMENT '软件版本',
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(device_id) ON DELETE CASCADE,
    INDEX idx_dtu_id_reg_time (dtu_id, registration_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DTU设备注册记录表';

-- 7. 重新创建视图
CREATE OR REPLACE VIEW sensor_status_view AS
SELECT
    s.sensor_id,
    s.sensor_name,
    s.unit,
    s.decimal_places,
    s.icon,
    s.sensor_type,
    CONCAT(s.upper_mapping_x1, ',', s.upper_mapping_y1, '=>', s.upper_mapping_x2, ',', s.upper_mapping_y2) AS upper_mapping_display,
    CONCAT(s.lower_mapping_x1, ',', s.lower_mapping_y1, '=>', s.lower_mapping_x2, ',', s.lower_mapping_y2) AS lower_mapping_display,
    s.sort_order,
    COALESCE(s.sort_order, ROW_NUMBER() OVER (PARTITION BY s.dtu_id ORDER BY s.created_at)) AS display_order,
    sd.data_value AS latest_value,
    sd.timestamp AS latest_timestamp,
    sd.data_quality,
    dd.device_id AS dtu_device_id,
    dd.device_name AS dtu_device_name,
    dd.status AS dtu_status
FROM
    sensors s
JOIN
    dtu_devices dd ON s.dtu_id = dd.device_id
LEFT JOIN (
    SELECT
        sensor_id,
        data_value,
        timestamp,
        data_quality,
        ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY timestamp DESC) as rn
    FROM
        sensor_data
) sd ON s.sensor_id = sd.sensor_id AND sd.rn = 1;

-- 8. 重新创建MB RTU配置概览视图
CREATE OR REPLACE VIEW mb_rtu_config_overview AS
SELECT
    mb.dtu_id,
    dd.device_name AS dtu_name,
    mb.sensor_id,
    s.sensor_name,
    mb.slave_address,
    mb.function_code,
    mb.offset_value,
    mb.data_format,
    mb.data_bits,
    mb.byte_order_value,
    mb.collection_cycle
FROM
    mb_rtu_config mb
JOIN
    dtu_devices dd ON mb.dtu_id = dd.device_id
JOIN
    sensors s ON mb.sensor_id = s.sensor_id;

-- 9. 验证表结构
DESCRIBE dtu_devices;
DESCRIBE sensors;
DESCRIBE mb_rtu_config;

-- 10. 显示表创建语句
SHOW CREATE TABLE dtu_devices;
SHOW CREATE TABLE sensors;
SHOW CREATE TABLE mb_rtu_config;
