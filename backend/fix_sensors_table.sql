-- 修正传感器表结构脚本
-- 移除不需要的字段：installation_depth 和 location_description

USE dam_monitoring_system;

-- 备份现有数据（如果需要的话）
-- CREATE TABLE sensors_backup AS SELECT * FROM sensors;

-- 删除现有的sensors表
DROP TABLE IF EXISTS sensors;

-- 重新创建传感器表（按照database_init.sql中的正确结构）
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

-- 验证表结构
DESCRIBE sensors;

-- 显示表创建语句
SHOW CREATE TABLE sensors;
