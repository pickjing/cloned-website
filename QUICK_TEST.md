# 新建分组功能快速测试指南

## 前置要求

1. MySQL服务已启动
2. 数据库已创建并初始化
3. Node.js环境已安装

## 快速测试步骤

### 1. 启动后端服务

```bash
cd backend
npm start
```

如果看到 "Server is running on port 3000" 说明后端启动成功。

### 2. 测试数据库连接

```bash
cd backend
node test_db_connection.js
```

确保数据库连接正常。

### 3. 测试分组API

```bash
cd backend
node test_group_api_simple.js
```

这会测试所有分组相关的API接口。

### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

### 5. 测试前端功能

1. 在浏览器中访问前端页面
2. 导航到"设备管理"页面
3. 点击"新建分组"按钮
4. 测试以下功能：
   - 输入分组名
   - 验证实时检查
   - 创建分组
   - 查看成功提示

## 预期结果

### 后端API测试
- ✅ 检查不存在的分组名：返回 `{"success":true,"data":{"exists":false}}`
- ✅ 创建新分组：返回 `{"success":true,"message":"分组创建成功"}`
- ✅ 检查已存在的分组名：返回 `{"success":true,"data":{"exists":true}}`
- ✅ 获取分组列表：返回所有分组名称

### 前端功能测试
- ✅ 点击"新建分组"按钮，弹出模态对话框
- ✅ 输入分组名后，自动检查是否重复
- ✅ 显示检查状态："检查中..."
- ✅ 分组名可用时显示绿色对勾
- ✅ 分组名重复时显示错误提示
- ✅ 确定按钮根据输入状态启用/禁用
- ✅ 创建成功后自动关闭对话框

## 常见问题

### 1. 后端启动失败
- 检查端口3000是否被占用
- 检查数据库连接配置
- 查看错误日志

### 2. 数据库连接失败
- 检查MySQL服务是否运行
- 检查用户名密码是否正确
- 检查数据库是否存在

### 3. 前端无法访问后端
- 检查后端服务是否启动
- 检查CORS配置
- 检查网络连接

## 数据库验证

创建分组后，可以在数据库中验证：

```sql
-- 连接到数据库
mysql -u iotuser -p dam_monitoring_system

-- 查看分组表
SELECT * FROM device_groups;

-- 查看最新创建的分组
SELECT * FROM device_groups ORDER BY created_at DESC LIMIT 5;
```

## 功能特性总结

✅ 模态对话框弹出  
✅ 实时输入验证  
✅ 分组名重复检查  
✅ 按钮状态管理  
✅ 成功/错误提示  
✅ 数据库存储  
✅ 自动刷新列表  
✅ 响应式设计  
✅ 用户友好界面
