# 大坝混凝土温度监测系统 - 后端

## 系统概述

这是一个专门为大坝混凝土温度监测设计的后端系统，采用DTU设备连接多个传感器的架构模式。

### 系统架构

- **DTU设备**: 数据采集终端，负责连接多个传感器并上传数据到云平台
- **传感器**: 安装在混凝土中的温度传感器，持续监测温度变化
- **透传模式**: DTU设备只发送注册包，不进行数据处理
- **云平台**: 接收、存储和分析传感器数据

## 数据库设计

### 主要数据表

1. **dtu_devices** - DTU设备信息
   - 设备ID、名称、位置、GPS坐标、状态等

2. **sensors** - 传感器信息
   - 传感器ID、类型、安装位置、深度、状态等

3. **temperature_data** - 温度数据
   - 传感器ID、温度值、时间戳、数据质量等

4. **dtu_registrations** - DTU注册记录
   - 注册时间、IP地址、信号强度、电池电量等

### 数据库视图

- **sensor_status_view** - 传感器实时状态视图
- **dtu_statistics_view** - DTU设备统计信息视图

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并配置以下参数：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=iotuser
DB_PASSWORD=your_password_here
DB_NAME=dam_monitoring_system
DB_PORT=3306

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 初始化数据库

```bash
# 使用MySQL客户端执行
mysql -u iotuser -p < database_init.sql
```

### 4. 启动服务

```bash
npm start
```

## API接口

### DTU设备管理

- `GET /api/dtu` - 获取所有DTU设备
- `POST /api/dtu` - 创建DTU设备
- `GET /api/dtu/:dtuId/sensors` - 获取指定DTU的传感器列表
- `GET /api/dtu/:dtuId/temperature` - 获取指定DTU的所有传感器温度数据

### 传感器管理

- `POST /api/sensors` - 创建传感器
- `GET /api/sensors/:sensorId/temperature` - 获取指定传感器的温度数据
- `GET /api/sensors/:sensorId/trend` - 获取指定传感器的温度趋势

### 数据管理

- `POST /api/temperature` - 创建温度数据记录
- `POST /api/dtu/register` - 记录DTU设备注册

### 监控和统计

- `GET /api/statistics` - 获取设备统计信息
- `GET /api/temperature/abnormal` - 获取异常温度数据

## 数据流程

1. **DTU设备注册**: DTU设备启动后向云平台发送注册包
2. **传感器数据采集**: 传感器持续采集温度数据
3. **数据上传**: DTU设备将传感器数据打包上传到云平台
4. **数据存储**: 云平台接收并存储数据到数据库
5. **数据分析**: 系统提供数据查询、趋势分析、异常检测等功能

## 技术特点

- **透传模式**: DTU设备不进行数据处理，直接透传传感器数据
- **实时监控**: 支持实时数据查询和状态监控
- **数据质量**: 包含数据质量评估机制
- **异常检测**: 支持温度异常检测和告警
- **趋势分析**: 提供温度变化趋势分析功能

## 部署说明

### 生产环境

1. 配置生产数据库
2. 设置环境变量
3. 配置反向代理（如Nginx）
4. 设置SSL证书
5. 配置防火墙规则

### 监控和维护

- 定期检查数据库性能
- 监控API响应时间
- 备份重要数据
- 更新安全补丁

## 故障排除

### 常见问题

1. **数据库连接失败**: 检查数据库配置和网络连接
2. **API响应慢**: 检查数据库索引和查询优化
3. **数据丢失**: 检查网络连接和数据上传逻辑

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```
