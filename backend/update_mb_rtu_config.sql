-- MB RTU协议配置表结构更新脚本
-- 用于将现有的mb_rtu_config表更新为新的结构

USE dam_monitoring_system;

-- 备份现有数据（如果需要的话）
-- CREATE TABLE mb_rtu_config_backup AS SELECT * FROM mb_rtu_config;

-- 删除现有的mb_rtu_config表
DROP TABLE IF EXISTS mb_rtu_config;

-- 重新创建MB RTU协议配置表
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
    UNIQUE KEY (dtu_id, sensor_id), -- 确保每个DTU下的传感器只有一条配置
    FOREIGN KEY (dtu_id) REFERENCES dtu_devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    INDEX idx_dtu_sensor (dtu_id, sensor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modbus RTU协议配置表';

-- 验证表结构
DESCRIBE mb_rtu_config;

-- 显示表创建语句
SHOW CREATE TABLE mb_rtu_config;
