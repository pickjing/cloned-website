-- 大坝混凝土温度监测系统数据库初始化脚本
-- 使用iotuser用户创建数据库和表
-- 基于实际数据库结构编写

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS dam_monitoring_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dam_monitoring_system;

-- DTU设备表
CREATE TABLE IF NOT EXISTS dtu_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dtu_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'DTU设备ID',
    serial_number VARCHAR(100) COMMENT '序列号',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建日期',
    dtu_group VARCHAR(100) COMMENT 'DTU设备分组',
    dtu_name VARCHAR(100) NOT NULL COMMENT 'DTU设备名称',
    dtu_image VARCHAR(255) DEFAULT 'https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com/fileUpload/productImg/20210407/20210407120039_997.jpg' COMMENT 'DTU设备图片路径',
    link_protocol VARCHAR(50) DEFAULT 'MB RTU' COMMENT '链接协议',
    offline_delay INT DEFAULT 300 COMMENT '掉线延时（秒）',
    timezone_setting VARCHAR(50) DEFAULT '+08:00' COMMENT '时区设置',
    longitude DECIMAL(10,7) COMMENT '经度',
    latitude DECIMAL(10,7) COMMENT '纬度',
    status ENUM('已连接', '未连接', '已删除', '已禁用') DEFAULT '未连接' COMMENT '设备状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dtu_id (dtu_id),
    INDEX idx_dtu_name (dtu_name),
    INDEX idx_dtu_group (dtu_group),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DTU设备信息表';

-- 传感器表
CREATE TABLE IF NOT EXISTS sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50) UNIQUE NOT NULL COMMENT '传感器唯一标识',
    dtu_id VARCHAR(50) NOT NULL COMMENT '所属DTU设备ID',
    icon VARCHAR(255) DEFAULT 'https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com//images/temperature.png' COMMENT '传感器图标路径',
    sensor_name VARCHAR(100) NOT NULL COMMENT '传感器名称',
    sensor_type ENUM('数值型', '开关型(可操作)', '定位型', '图片型', '开关型(不可操作)', '档位型', '视频型', '字符串') DEFAULT '数值型' COMMENT '传感器类型',
    decimal_places INT DEFAULT 1 COMMENT '小数位数',
    unit VARCHAR(20) DEFAULT '°C' COMMENT '单位',
    sort_order INT COMMENT '排序（为空则自动排序）',
    upper_mapping_x1 DECIMAL(10,4) DEFAULT -32768.0000 COMMENT '上行映射原始值下限',
    upper_mapping_y1 DECIMAL(10,4) DEFAULT 32767.0000 COMMENT '上行映射原始值上限',
    upper_mapping_x2 DECIMAL(10,4) DEFAULT -2048.0000 COMMENT '上行映射实际值下限',
    upper_mapping_y2 DECIMAL(10,4) DEFAULT 2047.9000 COMMENT '上行映射实际值上限',
    lower_mapping_x1 DECIMAL(10,4) COMMENT '下行映射实际值下限',
    lower_mapping_y1 DECIMAL(10,4) COMMENT '下行映射实际值上限',
    lower_mapping_x2 DECIMAL(10,4) COMMENT '下行映射原始值下限',
    lower_mapping_y2 DECIMAL(10,4) COMMENT '下行映射原始值上限',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(dtu_id) ON DELETE CASCADE,
    INDEX idx_sensor_id (sensor_id),
    INDEX idx_dtu_id (dtu_id),
    INDEX idx_sensor_name (sensor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传感器信息表';

-- 传感器数据表 (温度数据存储)
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL COMMENT '传感器唯一标识',
    data_value DECIMAL(18,8) NOT NULL COMMENT '数据值',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '数据采集时间',
    data_quality VARCHAR(50) DEFAULT 'good' COMMENT '数据质量 (如 good, bad, uncertain)',
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    INDEX idx_sensor_id_timestamp (sensor_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传感器数据表';

-- MB RTU协议配置表
CREATE TABLE IF NOT EXISTS mb_rtu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dtu_id VARCHAR(50) NOT NULL COMMENT '所属DTU设备ID',
    sensor_id VARCHAR(50) NOT NULL COMMENT '关联传感器ID',
    slave_address INT DEFAULT 1 COMMENT '从站地址',
    function_code ENUM('01读写', '02只读', '03读写', '04只读') DEFAULT '04只读' COMMENT '功能码',
    offset_value DECIMAL(10,4) DEFAULT 0.0000 COMMENT '偏置（按传感器order设置）',
    data_format ENUM('16位有符号数', '16位无符号数', '16位按位读写', '32位有符号数', '32位无符号数', '32位浮点型数', '64位浮点型数', '16位BCD码', '32位BCD码') DEFAULT '16位有符号数' COMMENT '数据格式',
    data_bits INT COMMENT '数据位（正整数，默认为空）',
    byte_order_value INT COMMENT '字节顺序（正整数，默认为空）',
    collection_cycle INT DEFAULT 2 COMMENT '采集周期（秒，默认2）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (dtu_id, sensor_id), -- 确保每个DTU下的传感器只有一条配置
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(dtu_id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    INDEX idx_dtu_sensor (dtu_id, sensor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modbus RTU协议配置表';

-- DTU设备分组表
CREATE TABLE IF NOT EXISTS dtu_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) UNIQUE NOT NULL COMMENT '分组名称',
    description VARCHAR(255) COMMENT '分组描述',
    parent_group_id INT COMMENT '父分组ID (自引用)',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否为默认分组',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_group_name (group_name),
    INDEX idx_parent_group_id (parent_group_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DTU设备分组表';

-- DTU注册记录表
CREATE TABLE IF NOT EXISTS dtu_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dtu_id VARCHAR(50) NOT NULL COMMENT 'DTU设备唯一标识',
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    ip_address VARCHAR(45) COMMENT '注册时的IP地址',
    port INT COMMENT '注册时的端口',
    firmware_version VARCHAR(50) COMMENT '固件版本',
    software_version VARCHAR(50) COMMENT '软件版本',
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(dtu_id) ON DELETE CASCADE,
    INDEX idx_dtu_id_reg_time (dtu_id, registration_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DTU设备注册记录表';

-- 视图：传感器实时状态
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
    COALESCE(s.sort_order, ROW_NUMBER() OVER (PARTITION BY s.dtu_id ORDER BY s.created_at)) AS display_order, -- 如果sort_order为空，则按创建时间排序
    sd.data_value AS latest_value,
    sd.timestamp AS latest_timestamp,
    sd.data_quality,
    dd.dtu_id AS dtu_id,
    dd.dtu_name AS dtu_name,
    dd.status AS dtu_status
FROM
    sensors s
JOIN
    dtu_devices dd ON s.dtu_id = dd.dtu_id
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

-- 视图：DTU设备统计信息
CREATE OR REPLACE VIEW dtu_statistics_view AS
SELECT
    dd.dtu_id,
    dd.dtu_name,
    dd.status,
    dd.dtu_group,
    dd.longitude,
    dd.latitude,
    COUNT(s.sensor_id) AS total_sensors,
    SUM(CASE WHEN s.sensor_id IS NOT NULL THEN 1 ELSE 0 END) AS active_sensors, -- 假设所有关联的传感器都是活跃的
    MAX(sd.latest_timestamp) AS last_data_received_at
FROM
    dtu_devices dd
LEFT JOIN
    sensors s ON dd.dtu_id = s.dtu_id
LEFT JOIN
    sensor_status_view sd ON s.sensor_id = sd.sensor_id
GROUP BY
    dd.dtu_id, dd.dtu_name, dd.status, dd.dtu_group, dd.longitude, dd.latitude;

-- 视图：Modbus RTU配置概览
CREATE OR REPLACE VIEW mb_rtu_overview AS
SELECT
    mb.dtu_id,
    dd.dtu_name AS dtu_name,
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
    mb_rtu mb
JOIN
    dtu_devices dd ON mb.dtu_id = dd.dtu_id
JOIN
    sensors s ON mb.sensor_id = s.sensor_id;

-- 显示创建结果
SELECT '数据库初始化完成！' AS message;
SELECT '已创建以下表：' AS info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'dam_monitoring_system' AND table_type = 'BASE TABLE' ORDER BY table_name;
SELECT '已创建以下视图：' AS info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'dam_monitoring_system' AND table_type = 'VIEW' ORDER BY table_name;
