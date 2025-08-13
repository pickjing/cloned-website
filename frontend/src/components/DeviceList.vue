<template>
  <div class="device-list">
    <!-- 现场设备组 -->
    <div class="device-group">
      <div class="group-header" @click="toggleGroup('site')">
        <el-icon :class="{ 'is-expanded': expandedGroups.site }">
          <ArrowDown />
        </el-icon>
        <span class="group-name">现场</span>
        <span class="device-count">{{ getOnlineCount('现场') }}/{{ getTotalCount('现场') }}</span>
        <el-tag size="small" type="primary" class="default-tag">默认</el-tag>
      </div>
      <div v-show="expandedGroups.site" class="group-content">
        <div 
          v-for="device in getDevicesByGroup('现场')" 
          :key="device.id"
          class="device-item"
          :class="{ active: selectedDeviceId === device.id }"
          @click="selectDevice(device)"
        >
          <div class="device-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="device-name">{{ device.name }}</span>
        </div>
      </div>
    </div>

    <!-- 现场-3号机组设备组 -->
    <div class="device-group">
      <div class="group-header" @click="toggleGroup('site3')">
        <el-icon :class="{ 'is-expanded': expandedGroups.site3 }">
          <ArrowDown />
        </el-icon>
        <span class="group-name">现场-3号机组</span>
        <span class="device-count">{{ getOnlineCount('现场-3号机组') }}/{{ getTotalCount('现场-3号机组') }}</span>
      </div>
      <div v-show="expandedGroups.site3" class="group-content">
        <div 
          v-for="device in getDevicesByGroup('现场-3号机组')" 
          :key="device.id"
          class="device-item"
          :class="{ active: selectedDeviceId === device.id }"
          @click="selectDevice(device)"
        >
          <div class="device-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="device-name">{{ device.name }}</span>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="getFilteredDevices().length === 0" class="no-data">
      <el-icon class="no-data-icon"><Document /></el-icon>
      <p>暂无数据</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ArrowDown, Monitor, Document } from '@element-plus/icons-vue'

export default {
  name: 'DeviceList',
  components: {
    ArrowDown,
    Monitor,
    Document
  },
  props: {
    devices: {
      type: Array,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  emits: ['select-device'],
  setup(props, { emit }) {
    const selectedDeviceId = ref(null)
    const expandedGroups = ref({
      site: true,
      site3: true
    })

    // 根据分类过滤设备
    const getFilteredDevices = () => {
      if (props.category === 'all') {
        return props.devices
      } else if (props.category === 'alarm') {
        return props.devices.filter(device => 
          device.sensors && device.sensors.some(sensor => sensor.connected === false)
        )
      } else if (props.category === 'offline') {
        return props.devices.filter(device => device.status === 'offline')
      }
      return props.devices
    }

    // 根据分组获取设备
    const getDevicesByGroup = (groupName) => {
      return getFilteredDevices().filter(device => device.group === groupName)
    }

    // 获取在线设备数量
    const getOnlineCount = (groupName) => {
      const groupDevices = getFilteredDevices().filter(device => device.group === groupName)
      if (props.category === 'offline') {
        return groupDevices.filter(device => device.status === 'offline').length
      } else if (props.category === 'alarm') {
        return groupDevices.filter(device => 
          device.sensors && device.sensors.some(sensor => sensor.connected === false)
        ).length
      } else {
        return groupDevices.filter(device => device.status === 'online').length
      }
    }

    // 获取总设备数量
    const getTotalCount = (groupName) => {
      return getFilteredDevices().filter(device => device.group === groupName).length
    }

    // 切换分组展开状态
    const toggleGroup = (groupKey) => {
      expandedGroups.value[groupKey] = !expandedGroups.value[groupKey]
    }

    // 选择设备
    const selectDevice = (device) => {
      selectedDeviceId.value = device.id
      emit('select-device', device)
    }

    return {
      selectedDeviceId,
      expandedGroups,
      getFilteredDevices,
      getDevicesByGroup,
      getOnlineCount,
      getTotalCount,
      toggleGroup,
      selectDevice
    }
  }
}
</script>

<style scoped>
.device-list {
  padding: 16px;
}

.device-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.group-header:hover {
  background-color: #f8f9fa;
}

.group-header .el-icon {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.group-header .is-expanded .el-icon {
  transform: rotate(180deg);
}

.group-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.device-count {
  margin-right: 8px;
  font-size: 12px;
  color: #666;
}

.default-tag {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-50%);
}

.group-content {
  padding-left: 24px;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid #f9f9f9;
  transition: all 0.3s ease;
}

.device-item:hover {
  background-color: #f8f9fa;
}

.device-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.device-item.active .device-name {
  color: #1890ff;
}

.device-icon {
  margin-right: 12px;
  color: #666;
  font-size: 16px;
}

.device-name {
  color: #333;
  text-decoration: underline;
  cursor: pointer;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}
</style>
