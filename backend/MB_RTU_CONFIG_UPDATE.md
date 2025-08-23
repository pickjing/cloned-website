# MB RTU协议配置表更新说明

## 更新概述

本次更新对 `mb_rtu_config` 表进行了重大结构调整，以更好地支持Modbus RTU协议的配置需求。

## 主要变更

### 移除的字段
- `register_address` - 寄存器地址
- `register_count` - 寄存器数量

### 新增的字段
- `data_bits` - 数据位（正整数，默认为空）
- `byte_order_value` - 字节顺序（正整数，默认为空）

### 修改的字段
- `offset_value` - 偏置值，现在按传感器的 `sort_order` 字段设置
- `collection_cycle` - 采集周期，默认值从60秒改为2秒

## 更新后的表结构

```sql
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
```

## 更新步骤

### 方法1：使用更新脚本（推荐）
```bash
mysql -u iotuser -p < update_mb_rtu_config.sql
```

### 方法2：手动更新
1. 备份现有数据（如果需要）
2. 删除现有表
3. 重新创建表
4. 验证表结构

## 字段说明

### offset_value
- 偏置值，用于调整读取的数据
- 按传感器的 `sort_order` 字段自动设置
- 类型：DECIMAL(10,4)，默认值：0

### data_bits
- 数据位，定义数据的位数
- 类型：INT，默认值：NULL
- 示例：16、32、64等

### byte_order_value
- 字节顺序，定义字节的排列方式
- 类型：INT，默认值：NULL
- 示例：1、2、3等（具体含义由业务逻辑定义）

### collection_cycle
- 采集周期，定义数据采集的频率
- 类型：INT，默认值：2（秒）
- 示例：2、5、10、60等

## 注意事项

1. **数据丢失风险**：更新会删除现有的 `mb_rtu_config` 表，请确保备份重要数据
2. **外键约束**：表与 `dtu_devices` 和 `sensors` 表存在外键关系
3. **默认值**：新字段的默认值都是 NULL，需要在插入数据时明确指定
4. **偏置计算**：偏置值现在基于传感器的排序字段，确保传感器表中有正确的 `sort_order` 值

## 验证更新

更新完成后，可以使用以下命令验证：

```sql
-- 查看表结构
DESCRIBE mb_rtu_config;

-- 查看表创建语句
SHOW CREATE TABLE mb_rtu_config;

-- 查看视图
SELECT * FROM mb_rtu_config_overview LIMIT 5;
```

## 后续工作

1. 更新前端代码，适配新的表结构
2. 修改后端API，处理新的字段
3. 更新数据插入逻辑，确保新字段有合适的值
4. 测试新的配置功能
