#!/bin/bash

# 大坝混凝土温度监测系统数据库初始化脚本
# 使用iotuser用户创建数据库和表

echo "开始初始化大坝混凝土温度监测系统数据库..."

# 检查MySQL是否运行
if ! mysqladmin ping -h localhost -u iotuser --password=iotuser123 2>/dev/null; then
    echo "错误: 无法连接到MySQL数据库，请检查MySQL服务是否运行"
    exit 1
fi

echo "MySQL连接成功，开始创建数据库和表..."

# 执行SQL脚本
mysql -u iotuser -p'iotuser123' < database_init.sql

if [ $? -eq 0 ]; then
    echo "数据库初始化成功！"
    echo "已创建以下内容："
    echo "- 数据库: dam_monitoring_system"
    echo "- 表: dtu_devices, sensors, temperature_data, dtu_registrations"
    echo "- 视图: sensor_status_view, dtu_statistics_view"
    echo "- 示例数据: 3个DTU设备，6个传感器，24小时温度数据"
else
    echo "数据库初始化失败，请检查错误信息"
    exit 1
fi

echo "数据库初始化完成！"
