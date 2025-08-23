# 数据库结构说明

## 表结构概览

### 1. DTU设备表 (dtu_devices)
存储DTU设备的基本信息和配置参数。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
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
| status | ENUM | '未连接' | 设备状态：已连接、未连接、已删除、已禁用 | 已连接/未连接/已删除/已禁用 |

**默认图片**: [DTU设备默认图片](https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com/fileUpload/productImg/20210407/20210407120039_997.jpg)

### 2. 传感器表 (sensors)
存储传感器的基本信息和显示配置。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| sensor_id | VARCHAR(50) | - | 传感器唯一标识 | SENS001 |
| dtu_id | VARCHAR(50) | - | 所属DTU设备ID | DTU001 |
| icon | VARCHAR(255) | 默认温度图标 | 传感器图标路径 | 阿里云OSS链接 |
| sensor_name | VARCHAR(100) | - | 传感器名称 | 1号温度计 |
| sensor_type | ENUM | '数值型' | 传感器类型 (如 数值型、开关型等) | 数值型 |
| decimal_places | INT | 1 | 小数位数 | 1 |
| unit | VARCHAR(20) | '°C' | 单位 | °C |
| sort_order | INT | NULL | 排序（为空则自动排序） | 1 |
| upper_mapping_x1 | DECIMAL(10,4) | -32768 | 上行映射原始值下限 | -32768 |
| upper_mapping_y1 | DECIMAL(10,4) | 32767 | 上行映射原始值上限 | 32767 |
| upper_mapping_x2 | DECIMAL(10,4) | -2048 | 上行映射实际值下限 | -2048 |
| upper_mapping_y2 | DECIMAL(10,4) | 2047.9 | 上行映射实际值上限 | 2047.9 |
| lower_mapping_x1 | DECIMAL(10,4) | NULL | 下行映射实际值下限 | 0 |
| lower_mapping_y1 | DECIMAL(10,4) | NULL | 下行映射实际值上限 | 100 |
| lower_mapping_x2 | DECIMAL(10,4) | NULL | 下行映射原始值下限 | 0 |
| lower_mapping_y2 | DECIMAL(10,4) | NULL | 下行映射原始值上限 | 1000 |
| installation_depth | DECIMAL(10,2) | NULL | 安装深度（米） | 15.5 |
| location_description | VARCHAR(200) | NULL | 安装位置描述 | 坝体中部 |

**默认图标**: [温度传感器默认图标](https://webplus-cn-shenzhen-s-5decf7913c3f2876a5adc591.oss-cn-shenzhen.aliyuncs.com//images/temperature.png)

**传感器类型说明**:
- **数值型**: 用于表示连续的数值数据，如温度、湿度、压力等
- **开关型(可操作)**: 可进行远程控制的开关状态，如设备启停、阀门开合
- **定位型**: 地理位置信息，如GPS坐标
- **图片型**: 图片数据传输，如摄像头图像
- **开关型(不可操作)**: 只能读取状态的开关，如门磁开关、液位报警
- **档位型**: 多档位状态，如风扇档位（低、中、高）
- **视频型**: 实时视频流数据
- **字符串**: 文本或非结构化字符串数据

**映射字段说明**:
- **上行映射**: 将传感器原始值转换为实际显示值 (x1,y1)->(x2,y2)
- **下行映射**: 将实际控制值转换为传感器原始值 (x1,y1)->(x2,y2)
- 使用四个独立的数值字段，便于计算和查询

### 3. MB RTU协议配置表 (mb_rtu_config)
存储Modbus RTU协议的详细配置，以DTU设备为入口，配置每个传感器的通信参数。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| dtu_id | VARCHAR(50) | - | 所属DTU设备ID | DTU001 |
| sensor_id | VARCHAR(50) | - | 关联传感器ID | SENS001 |
| slave_address | INT | 1 | 从站地址 | 1 |
| function_code | ENUM | '04只读' | 功能码 | 04只读 |
| offset_value | DECIMAL(10,4) | 0 | 偏置（按传感器order设置） | 0.0 |
| data_format | ENUM | '16位有符号数' | 数据格式 | 16位有符号数 |
| data_bits | INT | NULL | 数据位（正整数，默认为空） | 16 |
| byte_order_value | INT | NULL | 字节顺序（正整数，默认为空） | 1 |
| collection_cycle | INT | 2 | 采集周期（秒，默认2） | 2 |

**功能码说明**:
- **01读写**: 可读写的功能码
- **02只读**: 只读功能码
- **03读写**: 可读写的功能码
- **04只读**: 只读功能码（默认）

**字段说明**:
- **offset_value**: 偏置值，按传感器的sort_order字段设置
- **data_format**: 数据格式，定义数据的存储和读取方式
- **data_bits**: 数据位，正整数，如16、32等
- **byte_order_value**: 字节顺序，正整数，用于定义字节排列方式
- **collection_cycle**: 采集周期，默认2秒

**数据格式说明**:
- **16位有符号数**: 16位有符号整数（默认）
- **16位无符号数**: 16位无符号整数
- **16位按位读写**: 16位按位操作
- **32位有符号数**: 32位有符号整数
- **32位无符号数**: 32位无符号整数
- **32位浮点型数**: 32位浮点数
- **64位浮点型数**: 64位浮点数
- **16位BCD码**: 16位BCD编码
- **32位BCD码**: 32位BCD编码

### 4. 传感器数据表 (sensor_data)
存储传感器采集到的时间序列数据。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| sensor_id | VARCHAR(50) | - | 传感器唯一标识 | SENS001 |
| data_value | DECIMAL(18,8) | - | 数据值 | 25.345 |
| timestamp | TIMESTAMP | CURRENT_TIMESTAMP | 数据采集时间 | 2024-01-01 10:30:00 |
| data_quality | VARCHAR(50) | 'good' | 数据质量 (如 good, bad, uncertain) | good |

### 5. 设备分组表 (device_groups)
用于对DTU设备进行分组管理，支持多级分组。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| group_name | VARCHAR(100) | - | 分组名称 | 1号大坝 |
| description | VARCHAR(255) | NULL | 分组描述 | 位于上游区域 |
| parent_group_id | INT | NULL | 父分组ID (自引用) | 1 |

### 6. DTU注册记录表 (dtu_registrations)
记录DTU设备每次上线时的注册信息。

| 字段名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|--------|------|------|
| dtu_id | VARCHAR(50) | - | DTU设备唯一标识 | DTU001 |
| registration_time | TIMESTAMP | CURRENT_TIMESTAMP | 注册时间 | 2024-01-01 09:00:00 |
| ip_address | VARCHAR(45) | NULL | 注册时的IP地址 | 192.168.1.100 |
| port | INT | NULL | 注册时的端口 | 8888 |
| firmware_version | VARCHAR(50) | NULL | 固件版本 | V1.0.0 |
| software_version | VARCHAR(50) | NULL | 软件版本 | S1.0.0 |

## 视图设计

### 1. `sensor_status_view` (传感器实时状态视图)
提供传感器最新的数据值、状态以及所属DTU设备的信息。

**特殊功能**:
- **自动排序**: 当传感器的sort_order为NULL时，会根据创建时间自动排序
- **映射显示**: 将四个数值字段组合成可读的映射格式显示
- **最新数据**: 通过窗口函数获取每个传感器的最新数据

### 2. `dtu_statistics_view` (DTU设备统计信息视图)
提供DTU设备的汇总信息，包括关联传感器数量和最新数据接收时间。

### 3. `mb_rtu_config_overview` (Modbus RTU配置概览视图)
提供Modbus RTU配置的简化视图，方便查看每个DTU下传感器的协议配置。

## 默认值说明

### DTU设备默认值
- **设备图片**: 使用阿里云OSS上的默认DTU设备图片
- **链接协议**: 默认为 'MB RTU'
- **时区设置**: 默认为 '+08:00'（北京时间）
- **掉线延时**: 默认为 300秒
- **设备状态**: 默认为 '未连接'

### 传感器默认值
- **图标**: 使用阿里云OSS上的默认温度传感器图标
- **传感器类型**: 默认为 '数值型'
- **单位**: 默认为 '°C'（摄氏度符号）
- **小数位**: 默认为 1位
- **上行映射**: 默认为 (-32768, 32767) => (-2048, 2047.9)
- **排序**: 默认为NULL，表示自动排序

### MB RTU协议默认值
- **从站地址**: 默认为 1
- **功能码**: 默认为 '04只读'
- **数据格式**: 默认为 '16位有符号数'
- **字节顺序**: 默认为 'big_endian'
- **采集周期**: 默认为 60秒

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
