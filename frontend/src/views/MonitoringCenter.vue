<template>
  <div class="monitoring-center">
    <!-- 测试区域 -->
    <div class="test-area">
      <el-alert
        title="页面功能测试"
        description="监控中心页面已重新设计完成，包含左右分栏布局、设备搜索、分类标签、设备列表和详情展示等功能"
        type="success"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 左侧设备列表区域 -->
    <div class="left-panel">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="设备名/序列号/ID"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="所有设备" name="all">
            <DeviceList 
              :devices="filteredDevices" 
              :category="'all'"
              @select-device="handleDeviceSelect"
            />
          </el-tab-pane>
          <el-tab-pane label="报警" name="alarm">
            <DeviceList 
              :devices="alarmDevices" 
              :category="'alarm'"
              @select-device="handleDeviceSelect"
            />
          </el-tab-pane>
          <el-tab-pane label="离线" name="offline">
            <DeviceList 
              :devices="offlineDevices" 
              :category="'offline'"
              @select-device="handleDeviceSelect"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions">
        <el-button type="text" @click="showDeviceGroupManagement">
          设备组管理
        </el-button>
        <el-button type="text" @click="showNewDeviceGroup">
          新建设备组
        </el-button>
        <el-button type="primary" @click="launchSystem">
          启动台
        </el-button>
      </div>
    </div>

    <!-- 右侧设备详情区域 -->
    <div class="right-panel">
      <div v-if="selectedDevice" class="device-details">
        <!-- 设备基本信息 -->
        <div class="device-header">
          <div class="device-info">
            <h3>{{ selectedDevice.name }}</h3>
            <div class="device-meta">
              <span>设备ID: {{ selectedDevice.id }}</span>
              <span>序列号: {{ selectedDevice.serialNumber }}</span>
              <span>{{ selectedDevice.type }}</span>
              <span>+08:00</span>
            </div>
          </div>
          <div class="device-actions">
            <el-button 
              type="text" 
              icon="Setting"
              @click="setLinkProtocol"
              title="设置链接协议"
            />
            <el-button 
              type="text" 
              icon="Edit"
              @click="editDevice"
              title="编辑设备"
            />
            <el-button 
              type="text" 
              icon="Tools"
              @click="editSensors"
              title="编辑传感器"
            />
          </div>
        </div>

        <!-- 传感器列表 -->
        <div class="sensors-section">
          <h4>传感器列表</h4>
          <el-table :data="selectedDevice.sensors" stripe>
            <el-table-column label="传感器" min-width="200">
              <template #default="{ row }">
                <div class="sensor-info">
                  <el-icon><Thermometer /></el-icon>
                  <span>{{ row.name }}</span>
                  <div class="sensor-id">ID: {{ row.id }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="连接状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.connected ? 'success' : 'danger'">
                  {{ row.connected ? '已连接' : '未连接' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="{ row }">
                {{ row.lastUpdate }}
              </template>
            </el-table-column>
            <el-table-column label="当前值" width="120">
              <template #default="{ row }">
                <span class="sensor-value">{{ row.value }} {{ row.unit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="text" @click="viewAlarmRecord(row)">
                  报警记录
                </el-button>
                <el-button type="text" @click="viewRealTimeCurve(row)">
                  实时曲线
                </el-button>
                <el-button type="text" @click="viewHistoryQuery(row)">
                  历史查询
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 未选择设备时的提示 -->
      <div v-else class="no-device-selected">
        <el-empty description="请从左侧选择一个设备查看详情" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor as Thermometer } from '@element-plus/icons-vue'
import DeviceList from '../components/DeviceList.vue'

export default {
  name: 'MonitoringCenter',
  components: {
    DeviceList,
    Thermometer
  },
  setup() {
    const searchQuery = ref('')
    const activeTab = ref('all')
    const selectedDevice = ref(null)

    // 模拟设备数据
    const devices = ref([
      {
        id: '357226',
        name: 'Enderlab',
        serialNumber: '8658040590158170',
        type: 'MB RTU',
        status: 'online',
        group: '现场',
        sensors: [
          {
            id: '5220617',
            name: 'L24H44E33.92',
            connected: false,
            lastUpdate: '2025/01/27 16:24:52',
            value: '38.6',
            unit: '°C'
          },
          {
            id: '5220618',
            name: 'L24H44E34.01',
            connected: true,
            lastUpdate: '2025/01/27 16:24:52',
            value: '25.3',
            unit: '°C'
          }
        ]
      },
      {
        id: '357227',
        name: 'xin',
        serialNumber: '8658040590158171',
        type: 'MB RTU',
        status: 'offline',
        group: '现场-3号机组',
        sensors: []
      },
      {
        id: '357228',
        name: 'DTU',
        serialNumber: '8658040590158172',
        type: 'MB RTU',
        status: 'offline',
        group: '现场-3号机组',
        sensors: []
      }
    ])

    // 过滤后的设备列表
    const filteredDevices = computed(() => {
      if (!searchQuery.value) return devices.value
      return devices.value.filter(device => 
        device.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        device.serialNumber.includes(searchQuery.value) ||
        device.id.includes(searchQuery.value)
      )
    })

    // 报警设备
    const alarmDevices = computed(() => {
      return devices.value.filter(device => 
        device.sensors.some(sensor => sensor.connected === false)
      )
    })

    // 离线设备
    const offlineDevices = computed(() => {
      return devices.value.filter(device => device.status === 'offline')
    })

    // 搜索处理
    const handleSearch = () => {
      // 搜索逻辑已通过计算属性实现
    }

    // 标签切换
    const handleTabChange = (tab) => {
      activeTab.value = tab
    }

    // 选择设备
    const handleDeviceSelect = (device) => {
      selectedDevice.value = device
    }

    // 设备操作
    const setLinkProtocol = () => {
      ElMessage.info('设置链接协议功能')
    }

    const editDevice = () => {
      ElMessage.info('编辑设备功能')
    }

    const editSensors = () => {
      ElMessage.info('编辑传感器功能')
    }

    // 传感器操作
    const viewAlarmRecord = (sensor) => {
      ElMessage.info(`查看传感器 ${sensor.name} 的报警记录`)
    }

    const viewRealTimeCurve = (sensor) => {
      ElMessage.info(`查看传感器 ${sensor.name} 的实时曲线`)
    }

    const viewHistoryQuery = (sensor) => {
      ElMessage.info(`查看传感器 ${sensor.name} 的历史查询`)
    }

    // 底部操作
    const showDeviceGroupManagement = () => {
      ElMessage.info('设备组管理功能')
    }

    const showNewDeviceGroup = () => {
      ElMessage.info('新建设备组功能')
    }

    const launchSystem = () => {
      ElMessage.info('启动台功能')
    }

    return {
      searchQuery,
      activeTab,
      selectedDevice,
      filteredDevices,
      alarmDevices,
      offlineDevices,
      handleSearch,
      handleTabChange,
      handleDeviceSelect,
      setLinkProtocol,
      editDevice,
      editSensors,
      viewAlarmRecord,
      viewRealTimeCurve,
      viewHistoryQuery,
      showDeviceGroupManagement,
      showNewDeviceGroup,
      launchSystem
    }
  }
}
</script>

<style scoped>
.monitoring-center {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
}

.test-area {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: white;
}

.left-panel {
  width: 400px;
  background-color: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.search-bar {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #1890ff;
}

.search-bar .el-input {
  width: 100%;
}

.search-bar .el-input__wrapper {
  background-color: white;
}

.category-tabs {
  flex: 1;
  overflow: hidden;
}

.category-tabs .el-tabs {
  height: 100%;
}

.category-tabs .el-tabs__content {
  height: calc(100% - 55px);
  overflow-y: auto;
}

.bottom-actions {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.right-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.device-details {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.device-info h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #333;
}

.device-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.sensors-section {
  padding: 20px;
}

.sensors-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.sensor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sensor-id {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.sensor-value {
  font-weight: 500;
  color: #1890ff;
}

.no-device-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
