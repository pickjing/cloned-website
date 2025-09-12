# 大坝混凝土温度监测系统 - 数据库结构说明

## 系统概述

这是一个专门为大坝混凝土温度监测设计的后端系统，采用DTU设备连接多个传感器的架构模式。

### 系统架构

- **DTU设备**: 数据采集终端，负责连接多个传感器并上传数据到云平台
- **传感器**: 安装在混凝土中的温度传感器，持续监测温度变化
- **透传模式**: DTU设备只发送注册包，不进行数据处理
- **云平台**: 接收、存储和分析传感器数据

## 数据库信息

- **数据库名**: `dam_monitoring_system`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **存储引擎**: `InnoDB`

## 数据表结构

### 1. DTU设备表 (dtu_devices)

存储DTU设备的基本信息和配置参数。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | INT | AUTO_INCREMENT | 主键ID | 1 |
| device_id | VARCHAR(50) | - | 设备唯一标识 | DTU001 |
| serial_number | VARCHAR(100) | NULL | 设备序列号 | SN2024001 |
| created_date | TIMESTAMP | CURRENT_TIMESTAMP | 创建日期 | 2024-01-01 00:00:00 |
| device_group | VARCHAR(100) | NULL | 设备分组 | 大坝上游面 |
| device_name | VARCHAR(100) | - | 设备名称 | 上游面DTU-01 |
| device_image | VARCHAR(255) | 默认DTU图片 | 设备图片路径 | 阿里云OSS链接 |
| link_protocol | VARCHAR(50) | 'MB RTU' | 链接协议 | MB RTU |
| offline_delay | INT | 300 | 掉线延时（秒） | 300 |
| timezone_setting | VARCHAR(50) | '+08:00' | 时区设置 | +08:00 |
| longitude | DECIMAL(10,7) | NULL | 经度 | 120.1234567 |
| latitude | DECIMAL(10,7) | NULL | 纬度 | 30.1234567 |
| status | ENUM | '未连接' | 设备状态 | 已连接/未连接/已删除/已禁用 |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 | 2024-01-01 00:00:00 |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 | 2024-01-01 00:00:00 |

**索引**:
- `idx_device_id` (device_id)
- `idx_device_name` (device_name)
- `idx_device_group` (device_group)
- `idx_status` (status)

### 2. 传感器表 (sensors)

存储传感器的基本信息和显示配置。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | INT | AUTO_INCREMENT | 主键ID | 1 |
| sensor_id | VARCHAR(50) | - | 传感器唯一标识 | SENS001 |
| dtu_id | VARCHAR(50) | - | 所属DTU设备ID | DTU001 |
| icon | VARCHAR(255) | 默认温度图标 | 传感器图标路径 | 阿里云OSS链接 |
| sensor_name | VARCHAR(100) | - | 传感器名称 | 1号温度计 |
| sensor_type | ENUM | '数值型' | 传感器类型 | 数值型/开关型(可操作)/定位型/图片型/开关型(不可操作)/档位型/视频型/字符串 |
| decimal_places | INT | 1 | 小数位数 | 1 |
| unit | VARCHAR(20) | '°C' | 单位 | °C |
| sort_order | INT | NULL | 排序（为空则自动排序） | 1 |
| upper_mapping_x1 | DECIMAL(10,4) | -32768.0000 | 上行映射原始值下限 | -32768.0000 |
| upper_mapping_y1 | DECIMAL(10,4) | 32767.0000 | 上行映射原始值上限 | 32767.0000 |
| upper_mapping_x2 | DECIMAL(10,4) | -2048.0000 | 上行映射实际值下限 | -2048.0000 |
| upper_mapping_y2 | DECIMAL(10,4) | 2047.9000 | 上行映射实际值上限 | 2047.9000 |
| lower_mapping_x1 | DECIMAL(10,4) | NULL | 下行映射实际值下限 | 0.0000 |
| lower_mapping_y1 | DECIMAL(10,4) | NULL | 下行映射实际值上限 | 100.0000 |
| lower_mapping_x2 | DECIMAL(10,4) | NULL | 下行映射原始值下限 | 0.0000 |
| lower_mapping_y2 | DECIMAL(10,4) | NULL | 下行映射原始值上限 | 1000.0000 |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 | 2024-01-01 00:00:00 |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 | 2024-01-01 00:00:00 |

**外键约束**:
- `dtu_id` → `dtu_devices(device_id)` ON DELETE CASCADE

**索引**:
- `idx_sensor_id` (sensor_id)
- `idx_dtu_id` (dtu_id)
- `idx_sensor_name` (sensor_name)

### 3. 传感器数据表 (sensor_data)

存储传感器采集到的时间序列数据。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | BIGINT | AUTO_INCREMENT | 主键ID | 1 |
| sensor_id | VARCHAR(50) | - | 传感器唯一标识 | SENS001 |
| data_value | DECIMAL(18,8) | - | 数据值 | 25.34500000 |
| timestamp | TIMESTAMP | CURRENT_TIMESTAMP | 数据采集时间 | 2024-01-01 10:30:00 |
| data_quality | VARCHAR(50) | 'good' | 数据质量 | good/bad/uncertain |

**外键约束**:
- `sensor_id` → `sensors(sensor_id)` ON DELETE CASCADE

**索引**:
- `idx_sensor_id_timestamp` (sensor_id, timestamp)

### 4. MB RTU协议配置表 (mb_rtu_config)

存储Modbus RTU协议的详细配置，以DTU设备为入口，配置每个传感器的通信参数。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | INT | AUTO_INCREMENT | 主键ID | 1 |
| dtu_id | VARCHAR(50) | - | 所属DTU设备ID | DTU001 |
| sensor_id | VARCHAR(50) | - | 关联传感器ID | SENS001 |
| slave_address | INT | 1 | 从站地址 | 1 |
| function_code | ENUM | '04只读' | 功能码 | 01读写/02只读/03读写/04只读 |
| offset_value | DECIMAL(10,4) | 0.0000 | 偏置（按传感器order设置） | 0.0000 |
| data_format | ENUM | '16位有符号数' | 数据格式 | 16位有符号数/16位无符号数/16位按位读写/32位有符号数/32位无符号数/32位浮点型数/64位浮点型数/16位BCD码/32位BCD码 |
| data_bits | INT | NULL | 数据位（正整数，默认为空） | 16 |
| byte_order_value | INT | NULL | 字节顺序（正整数，默认为空） | 1 |
| collection_cycle | INT | 2 | 采集周期（秒，默认2） | 2 |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 | 2024-01-01 00:00:00 |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 | 2024-01-01 00:00:00 |

**唯一约束**:
- `(dtu_id, sensor_id)` - 确保每个DTU下的传感器只有一条配置

**外键约束**:
- `dtu_id` → `dtu_devices(device_id)` ON DELETE CASCADE
- `sensor_id` → `sensors(sensor_id)` ON DELETE CASCADE

**索引**:
- `idx_dtu_sensor` (dtu_id, sensor_id)

### 5. 设备分组表 (device_groups)

用于对DTU设备进行分组管理，支持多级分组。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | INT | AUTO_INCREMENT | 主键ID | 1 |
| group_name | VARCHAR(100) | - | 分组名称 | 1号大坝 |
| description | VARCHAR(255) | NULL | 分组描述 | 位于上游区域 |
| parent_group_id | INT | NULL | 父分组ID (自引用) | 1 |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 | 2024-01-01 00:00:00 |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 | 2024-01-01 00:00:00 |

**索引**:
- `idx_group_name` (group_name)

### 6. DTU注册记录表 (dtu_registrations)

记录DTU设备每次上线时的注册信息。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| id | INT | AUTO_INCREMENT | 主键ID | 1 |
| dtu_id | VARCHAR(50) | - | DTU设备唯一标识 | DTU001 |
| registration_time | TIMESTAMP | CURRENT_TIMESTAMP | 注册时间 | 2024-01-01 09:00:00 |
| ip_address | VARCHAR(45) | NULL | 注册时的IP地址 | 192.168.1.100 |
| port | INT | NULL | 注册时的端口 | 8888 |
| firmware_version | VARCHAR(50) | NULL | 固件版本 | V1.0.0 |
| software_version | VARCHAR(50) | NULL | 软件版本 | S1.0.0 |

**外键约束**:
- `dtu_id` → `dtu_devices(device_id)` ON DELETE CASCADE

**索引**:
- `idx_dtu_id_reg_time` (dtu_id, registration_time)

## 数据库视图

### 1. 传感器实时状态视图 (sensor_status_view)

提供传感器最新的数据值、状态以及所属DTU设备的信息。

**主要功能**:
- 自动排序: 当传感器的sort_order为NULL时，会根据创建时间自动排序
- 映射显示: 将四个数值字段组合成可读的映射格式显示
- 最新数据: 通过窗口函数获取每个传感器的最新数据

### 2. DTU设备统计信息视图 (dtu_statistics_view)

提供DTU设备的汇总信息，包括关联传感器数量和最新数据接收时间。

### 3. MB RTU配置概览视图 (mb_rtu_config_overview)

提供Modbus RTU配置的简化视图，方便查看每个DTU下传感器的协议配置。

## 设计特点

### 1. 灵活性
- 支持8种传感器类型，涵盖数值、开关、定位、媒体等多种数据
- 可配置的数据格式和采集参数
- 灵活的设备分组管理
- 自动排序机制

### 2. 扩展性
- 支持添加新的传感器类型
- 可扩展的协议配置
- 分层分组结构

### 3. 性能优化
- 合理的索引设计
- 视图优化查询性能
- 外键约束保证数据完整性

### 4. 工业标准
- 符合Modbus RTU协议规范
- 支持工业级数据质量评估
- 完整的设备生命周期管理

## 使用场景

### 1. 设备管理
- DTU设备注册和状态监控
- 传感器配置和管理
- 设备分组和权限控制

### 2. 数据采集
- 支持4种Modbus功能码
- 可配置的采集周期
- 数据质量评估

### 3. 监控分析
- 实时状态监控
- 历史数据分析
- 异常检测和告警

### 4. 系统集成
- 支持多种通信协议
- 标准化的数据接口
- 便于第三方系统集成

## 注意事项

1. **数据表名**: 使用 `sensor_data` 而不是 `temperature_data`
2. **数据字段**: 使用 `data_value` 而不是 `temperature`
3. **外键约束**: 所有外键都设置了 CASCADE 删除，确保数据一致性
4. **索引优化**: 为常用查询字段建立了合适的索引
5. **字符集**: 使用 utf8mb4 支持完整的 Unicode 字符集
