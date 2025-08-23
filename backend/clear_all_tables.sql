-- 清空所有数据表的SQL脚本
USE dam_monitoring_system;

-- 按照外键依赖顺序清空表
-- 1. 先清空有外键引用的表
DELETE FROM mb_rtu_config;
DELETE FROM sensor_data;
DELETE FROM dtu_registrations;

-- 2. 再清空被引用的表
DELETE FROM sensors;
DELETE FROM dtu_devices;

-- 3. 最后清空独立的分组表
DELETE FROM device_groups;

-- 显示清空后的表状态
SELECT 
    'mb_rtu_config' as table_name,
    COUNT(*) as record_count
FROM mb_rtu_config
UNION ALL
SELECT 
    'sensor_data' as table_name,
    COUNT(*) as record_count
FROM sensor_data
UNION ALL
SELECT 
    'sensors' as table_name,
    COUNT(*) as record_count
FROM sensors
UNION ALL
SELECT 
    'dtu_registrations' as table_name,
    COUNT(*) as record_count
FROM dtu_registrations
UNION ALL
SELECT 
    'dtu_devices' as table_name,
    COUNT(*) as record_count
FROM dtu_devices
UNION ALL
SELECT 
    'device_groups' as table_name,
    COUNT(*) as record_count
FROM device_groups;
