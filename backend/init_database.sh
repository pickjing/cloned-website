#!/bin/bash

# 大坝混凝土温度监测系统数据库初始化脚本
# 使用iotuser用户创建数据库和表
# 基于实际数据库结构编写

echo "=========================================="
echo "大坝混凝土温度监测系统数据库初始化"
echo "=========================================="

# 检查MySQL是否运行
echo "检查MySQL连接..."
if ! mysqladmin ping -h localhost -u iotuser --password=xwbiot123 2>/dev/null; then
    echo "❌ 错误: 无法连接到MySQL数据库"
    echo "请检查："
    echo "1. MySQL服务是否运行"
    echo "2. 用户名和密码是否正确"
    echo "3. 网络连接是否正常"
    exit 1
fi

echo "✅ MySQL连接成功"

# 检查数据库是否已存在
echo "检查数据库状态..."
DB_EXISTS=$(mysql -u iotuser -pxwbiot123 -e "SHOW DATABASES LIKE 'dam_monitoring_system';" 2>/dev/null | grep -c "dam_monitoring_system")

if [ $DB_EXISTS -gt 0 ]; then
    echo "⚠️  数据库 'dam_monitoring_system' 已存在"
    read -p "是否要重新初始化数据库？这将删除所有现有数据！(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 操作已取消"
        exit 0
    fi
    echo "🗑️  删除现有数据库..."
    mysql -u iotuser -pxwbiot123 -e "DROP DATABASE IF EXISTS dam_monitoring_system;"
fi

echo "📊 开始创建数据库和表..."

# 执行SQL脚本
mysql -u iotuser -pxwbiot123 < database_init.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化成功！"
    echo ""
    echo "📋 已创建以下内容："
    echo "   🗄️  数据库: dam_monitoring_system"
    echo "   📊 数据表:"
    echo "      - dtu_devices (DTU设备表)"
    echo "      - sensors (传感器表)"
    echo "      - sensor_data (传感器数据表)"
    echo "      - mb_rtu_config (MB RTU协议配置表)"
    echo "      - device_groups (设备分组表)"
    echo "      - dtu_registrations (DTU注册记录表)"
    echo "   👁️  视图:"
    echo "      - sensor_status_view (传感器实时状态视图)"
    echo "      - dtu_statistics_view (DTU设备统计信息视图)"
    echo "      - mb_rtu_config_overview (MB RTU配置概览视图)"
    echo "   📝 示例数据: 3个设备分组"
    echo ""
    echo "🔧 数据库配置信息："
    echo "   - 数据库名: dam_monitoring_system"
    echo "   - 用户名: iotuser"
    echo "   - 密码: xwbiot123"
    echo "   - 主机: localhost"
    echo "   - 端口: 3306"
    echo ""
    echo "✅ 初始化完成！现在可以启动后端服务了。"
else
    echo "❌ 数据库初始化失败！"
    echo "请检查错误信息并重试。"
    exit 1
fi
