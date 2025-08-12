# 快速启动指南

## 🚀 5分钟快速启动

### 1. 环境准备
确保您的系统已安装：
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 2. 安装依赖
```bash
cd backend
npm install
```

### 3. 配置数据库
```bash
# 创建环境配置文件
cp .env.template .env

# 编辑 .env 文件，设置数据库连接信息
# 数据库配置
DB_HOST=localhost
DB_USER=iotuser
DB_PASSWORD=iotuser123
DB_NAME=dam_monitoring_system
DB_PORT=3306
```

### 4. 创建数据库用户
```sql
-- 连接到MySQL root用户
mysql -u root -p

-- 创建用户
CREATE USER 'iotuser'@'localhost' IDENTIFIED BY 'iotuser123';
GRANT ALL PRIVILEGES ON *.* TO 'iotuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. 初始化数据库
```bash
# 方法1: 使用MySQL命令行
mysql -u iotuser -p < database_init.sql

# 方法2: 使用MySQL Workbench打开 database_init.sql 并执行
```

### 6. 测试数据库连接
```bash
node test_db_connection.js
```

### 7. 启动服务
```bash
npm start
```

### 8. 验证服务
访问 http://localhost:3000/api/statistics 查看设备统计信息

## 📊 数据库结构概览

```
dam_monitoring_system/
├── dtu_devices          # DTU设备信息
├── sensors              # 传感器信息
├── temperature_data     # 温度数据
├── dtu_registrations    # DTU注册记录
├── sensor_status_view   # 传感器状态视图
└── dtu_statistics_view  # DTU统计视图
```

## 🔧 常见问题

### Q: 数据库连接失败
A: 检查MySQL服务是否运行，用户名密码是否正确

### Q: 表不存在
A: 运行 `database_init.sql` 脚本创建数据库和表

### Q: 权限不足
A: 确保iotuser用户有足够权限

## 📝 下一步

数据库搭建完成后，您可以：
1. 根据实际协议调整数据接收逻辑
2. 测试API接口
3. 集成前端界面
4. 部署到生产环境

## 📞 需要帮助？

查看详细文档：
- `DATABASE_SETUP.md` - 详细数据库设置
- `README.md` - 完整系统说明
- `database_init.sql` - 数据库结构定义
