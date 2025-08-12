# 数据库设置指南

## 前置要求

1. **MySQL 8.0+** 已安装并运行
2. **iotuser** 用户已创建并具有适当权限

## 步骤1: 创建MySQL用户

```sql
-- 连接到MySQL root用户
mysql -u root -p

-- 创建iotuser用户
CREATE USER 'iotuser'@'localhost' IDENTIFIED BY 'iotuser123';

-- 授予权限
GRANT ALL PRIVILEGES ON *.* TO 'iotuser'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

## 步骤2: 创建环境配置文件

在 `backend` 目录下创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=iotuser
DB_PASSWORD=iotuser123
DB_NAME=dam_monitoring_system
DB_PORT=3306

# 服务器配置
PORT=3000
NODE_ENV=development
```

## 步骤3: 初始化数据库

### 方法1: 使用MySQL命令行

```bash
# 连接到MySQL
mysql -u iotuser -p

# 执行SQL脚本
source /path/to/your/project/backend/database_init.sql
```

### 方法2: 使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到数据库
3. 打开 `database_init.sql` 文件
4. 执行脚本

### 方法3: 使用命令行直接执行

```bash
mysql -u iotuser -p < database_init.sql
```

## 步骤4: 验证数据库创建

```sql
-- 连接到新创建的数据库
mysql -u iotuser -p dam_monitoring_system

-- 查看所有表
SHOW TABLES;

-- 查看DTU设备数据
SELECT * FROM dtu_devices;

-- 查看传感器数据
SELECT * FROM sensors;

-- 查看温度数据
SELECT * FROM temperature_data LIMIT 5;

-- 查看视图
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

## 数据库结构说明

### 主要表

1. **dtu_devices** - DTU设备信息
2. **sensors** - 传感器信息  
3. **temperature_data** - 温度数据
4. **dtu_registrations** - DTU注册记录

### 视图

1. **sensor_status_view** - 传感器实时状态
2. **dtu_statistics_view** - DTU设备统计信息

### 示例数据

- 3个DTU设备（上游面、下游面、左岸）
- 6个温度传感器
- 24小时的温度数据
- DTU注册记录

## 常见问题

### 1. 权限不足
```sql
-- 确保iotuser有足够权限
GRANT ALL PRIVILEGES ON dam_monitoring_system.* TO 'iotuser'@'localhost';
```

### 2. 字符集问题
```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set%';

-- 如果需要，设置字符集
SET NAMES utf8mb4;
```

### 3. 连接失败
- 检查MySQL服务是否运行
- 检查用户名和密码是否正确
- 检查主机和端口配置

## 下一步

数据库设置完成后，您可以：

1. 启动后端服务：`npm start`
2. 测试API接口
3. 根据实际协议调整数据接收逻辑

## 联系支持

如果遇到问题，请检查：
1. MySQL错误日志
2. 应用日志
3. 网络连接状态
