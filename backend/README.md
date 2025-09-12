# 大坝混凝土温度监测系统 - 后端

## 系统概述

这是一个专门为大坝混凝土温度监测设计的后端系统，采用DTU设备连接多个传感器的架构模式。

### 系统架构

- **DTU设备**: 数据采集终端，负责连接多个传感器并上传数据到云平台
- **传感器**: 安装在混凝土中的温度传感器，持续监测温度变化
- **透传模式**: DTU设备只发送注册包，不进行数据处理
- **云平台**: 接收、存储和分析传感器数据

## 快速开始

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
DB_PASSWORD=xwbiot123
DB_NAME=dam_monitoring_system
DB_PORT=3306

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
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

- `POST /api/sensor-data` - 创建传感器数据记录
- `POST /api/dtu/register` - 记录DTU设备注册

### 监控和统计

- `GET /api/statistics` - 获取设备统计信息
- `GET /api/temperature/abnormal` - 获取异常温度数据

### 设备管理高级功能

- `POST /api/dtu/copy` - 复制DTU设备
- `POST /api/dtu/delete` - 软删除DTU设备
- `POST /api/dtu/restore` - 恢复已删除的DTU设备
- `POST /api/dtu/permanently-delete` - 彻底删除DTU设备
- `POST /api/dtu/reset` - 重置DTU设备
- `POST /api/dtu/move-to-group` - 移动设备到分组

### 分组管理

- `GET /api/options/groups` - 获取设备分组选项
- `GET /api/groups/check` - 检查分组名是否存在
- `POST /api/groups` - 创建新分组

### MB RTU协议配置

- `POST /api/mb-rtu-config` - 创建MB RTU协议配置
- `POST /api/mb-rtu-configs` - 批量创建MB RTU协议配置

## 数据库

- **数据库名**: `dam_monitoring_system`
- **主要表**: `dtu_devices`, `sensors`, `sensor_data`, `mb_rtu_config`, `device_groups`, `dtu_registrations`
- **详细结构**: 参见 `DATABASE_STRUCTURE.md`

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MySQL2** - 数据库驱动
- **CORS** - 跨域支持
- **dotenv** - 环境变量管理

## 开发

### 项目结构

```
backend/
├── src/
│   ├── app.js              # 应用入口
│   ├── controllers/        # 控制器
│   │   └── deviceController.js
│   ├── models/            # 数据模型
│   │   └── deviceData.js
│   ├── routes/            # 路由
│   │   └── deviceRoutes.js
│   └── services/          # 服务层
│       └── database.js
├── database_init.sql      # 数据库初始化脚本
├── package.json
└── README.md
```

### 测试

```bash
# 测试数据库连接
node test_db_connection.js

# 测试数据库写入
node test_db_write.js
```

## 部署

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

## 许可证

ISC
