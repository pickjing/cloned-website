<template>
  <!-- 蒙层 -->
  <div v-if="visible" class="slide-overlay"></div>
  
  <div class="create-device-slide" :class="{ 'slide-in': visible, 'slide-out': !visible }">
    <!-- 头部 -->
    <div class="slide-header">
      <h2 class="slide-title">新建设备</h2>
      <button class="close-btn" @click="handleClose">×</button>
    </div>

    <!-- 内容区域 -->
    <div class="slide-content">
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备分组
            </label>

            <div class="group-selection-row">
              <div class="custom-dropdown" @click="toggleGroupDropdown">
                <span class="dropdown-text">{{ deviceData.group || '请选择分组' }}</span>
                <svg class="dropdown-arrow" :class="{ 'rotated': showGroupDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-show="showGroupDropdown" class="dropdown-menu">
                  <div 
                    v-for="group in deviceGroups" 
                    :key="group" 
                    class="dropdown-item"
                    @click.stop="selectGroup(group)"
                  >
                    {{ group }}
                  </div>
                </div>
              </div>
              <button type="button" class="add-group-btn" @click="showCreateGroupModal = true">
                + 添加分组
              </button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备序列号
            </label>
            <div class="serial-input-row">
              <input v-model="deviceData.serialNumber" type="text" class="form-input" placeholder="请输入序列号" required/>
              <button type="button" class="get-btn" disabled>获取</button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备名称
            </label>
            <div class="device-name-row">
              <input v-model="deviceData.deviceName" type="text" class="form-input" placeholder="请输入设备名称" required/>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备图片
            </label>
            <div class="device-image-row">
              <img :src="deviceData.deviceImage" alt="设备图片" class="device-image-preview" />
              <button type="button" class="add-image-btn" disabled>添加</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 连接配置 -->
      <div class="form-section">

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              链接协议
            </label>
            <div class="protocol-row">
              <div class="custom-dropdown disabled">
                <span class="dropdown-text">MB-RTU</span>
                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              掉线延时
            </label>
            <div class="offline-delay-container">
              <div class="offline-delay-row">
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="deviceData.offlineDelayType" value="recommended" name="offlineDelay"/>
                    <span class="radio-text">推荐值</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="deviceData.offlineDelayType" value="custom" name="offlineDelay"/>
                    <span class="radio-text">自定义</span>
                  </label>
                </div>
                <div v-if="deviceData.offlineDelayType === 'recommended'" class="custom-dropdown offline-delay-dropdown" @click="toggleOfflineDelayDropdown">
                  <span class="dropdown-text">{{ getRecommendedDelayText() }}秒</span>
                  <svg class="dropdown-arrow" :class="{ 'rotated': showOfflineDelayDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-show="showOfflineDelayDropdown" class="dropdown-menu offline-delay-menu" :class="{ 'dropdown-up': shouldShowUp }">
                    <div 
                      v-for="delay in [60, 120, 180, 240, 300, 600]" 
                      :key="delay" 
                      class="dropdown-item"
                      @click.stop="selectOfflineDelay(delay)"
                    >
                      {{ delay }}秒
                    </div>
                  </div>
                </div>
                <div v-if="deviceData.offlineDelayType === 'custom'" class="custom-input-group">
                  <label class="input-label">时间</label>
                  <div class="time-input-container">
                    <input 
                      v-model="deviceData.customDelay" 
                      type="text" 
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="form-input time-input" 
                      placeholder="请输入时间" 
                      @input="forceNumericInput"
                      @blur="handleTimeInputBlur"
                    />
                    <span class="input-unit">秒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              时区设置
            </label>
            <div class="timezone-row">
              <div class="custom-dropdown timezone-dropdown" @click="toggleTimezoneDropdown">
                <span class="dropdown-text">{{ deviceData.timezone || '请选择时区' }}</span>
                <svg class="dropdown-arrow" :class="{ 'rotated': showTimezoneDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-show="showTimezoneDropdown" class="dropdown-menu timezone-menu" :class="{ 'dropdown-up': shouldShowTimezoneUp }">
                  <div 
                    v-for="timezone in timezoneOptions" 
                    :key="timezone.value" 
                    class="dropdown-item"
                    @click.stop="selectTimezone(timezone.value)"
                  >
                    {{ timezone.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 传感器配置 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              传感器
            </label>
            <div class="sensor-actions">
              <button type="button" class="btn btn-primary">+ 添加传感器</button>
              <div class="sensor-right-actions">
                <a href="/files/创建传感器模板.xlsx" class="download-link">下载模板</a>
                <button type="button" class="btn btn-primary">导入Excel</button>
              </div>
            </div>

            <div class="sensor-table">
              <table>
                <thead>
                  <tr>
                    <th>图标</th>
                    <th>名称</th>
                    <th>类型</th>
                    <th>小数位</th>
                    <th>单位</th>
                    <th>排序</th>
                    <th>上行映射</th>
                    <th>下行映射</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="9" class="empty-data">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">经纬度</label>
            <div class="location-inputs">
              <div class="custom-dropdown" @click="toggleLocationTypeDropdown">
                <span class="dropdown-text">{{ deviceData.locationType === 'manual' ? '手动输入' : '地图选择' }}</span>
                <svg class="dropdown-arrow" :class="{ 'rotated': showLocationTypeDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
                <div v-show="showLocationTypeDropdown" class="dropdown-menu">
                  <div 
                    v-for="type in locationTypeOptions" 
                    :key="type.value" 
                    class="dropdown-item"
                    @click.stop="selectLocationType(type.value)"
                  >
                    {{ type.label }}
                  </div>
                </div>
              </div>
              <input v-model="deviceData.coordinates" type="text" class="form-input" placeholder="请输入经纬度定位"/>
              <button type="button" class="locate-btn">点击定位</button>
            </div>
          </div>
        </div>

        <div class="map-container">
          <div class="map-placeholder">地图加载中...</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="slide-footer">
      <button class="btn btn-secondary" @click="handleClose">关闭</button>
      <button class="btn btn-primary" @click="handleSubmit" :disabled="!canSubmit">确定</button>
    </div>

    <!-- 新建分组模态框 -->
    <CreateGroupModal
      :visible="showCreateGroupModal"
      @close="showCreateGroupModal = false"
      @group-created="handleGroupCreated"
    />
  </div>
</template>

<script>
import CreateGroupModal from './CreateGroupModal.vue'

export default {
  name: 'CreateDeviceSlide',
  components: {
    CreateGroupModal
  },
  emits: ['close', 'device-created', 'group-created'],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showCreateGroupModal: false,
      deviceData: {
        group: '',
        serialNumber: '',
        deviceName: '',
        protocol: 'MB-RTU', // 默认选择MB-RTU
        offlineDelayType: 'recommended',
        offlineDelay: '60',
        recommendedDelay: '60', // 新增：推荐值模式下的延时值
        customDelay: '60', // 新增：自定义模式下的延时值
        timezone: '',
        locationType: 'manual',
        coordinates: '',
        deviceImage: '/image/设备图片.png' // 使用本地静态图片
      },
      deviceGroups: ['默认分组', '测试分组', '生产分组'], // 添加默认值
      sensors: [],
      showGroupDropdown: false,
      showTimezoneDropdown: false,
      showOfflineDelayDropdown: false,
      showLocationTypeDropdown: false,
      timezoneOptions: [
        { label: 'UTC-12:00', value: 'UTC-12:00' },
        { label: 'UTC-11:00', value: 'UTC-11:00' },
        { label: 'UTC-10:00', value: 'UTC-10:00' },
        { label: 'UTC-09:00', value: 'UTC-09:00' },
        { label: 'UTC-08:00', value: 'UTC-08:00' },
        { label: 'UTC-07:00', value: 'UTC-07:00' },
        { label: 'UTC-06:00', value: 'UTC-06:00' },
        { label: 'UTC-05:00', value: 'UTC-05:00' },
        { label: 'UTC-04:00', value: 'UTC-04:00' },
        { label: 'UTC-03:00', value: 'UTC-03:00' },
        { label: 'UTC-02:00', value: 'UTC-02:00' },
        { label: 'UTC-01:00', value: 'UTC-01:00' },
        { label: 'UTC+00:00', value: 'UTC+00:00' },
        { label: 'UTC+01:00', value: 'UTC+01:00' },
        { label: 'UTC+02:00', value: 'UTC+02:00' },
        { label: 'UTC+03:00', value: 'UTC+03:00' },
        { label: 'UTC+04:00', value: 'UTC+04:00' },
        { label: 'UTC+05:00', value: 'UTC+05:00' },
        { label: 'UTC+06:00', value: 'UTC+06:00' },
        { label: 'UTC+07:00', value: 'UTC+07:00' },
        { label: 'UTC+08:00', value: 'UTC+08:00' },
        { label: 'UTC+09:00', value: 'UTC+09:00' },
        { label: 'UTC+10:00', value: 'UTC+10:00' },
        { label: 'UTC+11:00', value: 'UTC+11:00' },
        { label: 'UTC+12:00', value: 'UTC+12:00' },
        { label: 'UTC+13:00', value: 'UTC+13:00' },
        { label: 'UTC+14:00', value: 'UTC+14:00' }
      ],
      locationTypeOptions: [
        { label: '手动输入', value: 'manual' },
        { label: '地图选择', value: 'map' }
      ]
    }
  },
  computed: {
    canSubmit() {
      return this.deviceData.group && 
             this.deviceData.serialNumber && 
             this.deviceData.deviceName && 
             this.deviceData.timezone &&
             this.sensors.length > 0
    },
    shouldShowUp() {
      // 检查是否有足够的向下空间显示6个选项
      // 每个选项高度约40px，6个选项需要240px空间
      if (typeof window !== 'undefined' && this.showOfflineDelayDropdown) {
        const dropdownElement = document.querySelector('.offline-delay-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 240; // 6个选项需要的空间
          
          console.log('空间检测:', {
            spaceBelow,
            neededSpace,
            shouldShowUp: spaceBelow < neededSpace,
            dropdownTop: rect.top,
            dropdownBottom: rect.bottom,
            windowHeight
          });
          
          // 如果下方空间不够，则向上显示
          return spaceBelow < neededSpace;
        }
      }
      return false;
    },
    shouldShowTimezoneUp() {
      // 检查是否有足够的向下空间显示时区选项
      if (typeof window !== 'undefined' && this.showTimezoneDropdown) {
        const dropdownElement = document.querySelector('.timezone-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 320; // 8个选项需要的空间：8 * 40px = 320px
          
          console.log('时区空间检测:', {
            spaceBelow,
            neededSpace,
            shouldShowUp: spaceBelow < neededSpace,
            dropdownTop: rect.top,
            dropdownBottom: rect.bottom,
            windowHeight
          });
          
          // 如果下方空间不够，则向上显示
          return spaceBelow < neededSpace;
        }
      }
      return false;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchDeviceGroups()
      }
    }
  },
  
  mounted() {
    // 添加点击外部关闭下拉菜单的监听器
    document.addEventListener('click', this.handleClickOutside)
  },
  
  beforeUnmount() {
    // 移除监听器
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async fetchDeviceGroups() {
      try {
        const response = await fetch('http://localhost:3000/api/options/groups')
        if (response.ok) {
          const data = await response.json()
          this.deviceGroups = data.data || []
        } else {
          console.warn('获取设备分组失败，使用默认数据')
          // 如果API失败，使用默认数据
          this.deviceGroups = ['默认分组', '测试分组', '生产分组']
        }
      } catch (error) {
        console.error('获取设备分组失败:', error)
        // 网络错误时使用默认数据
        this.deviceGroups = ['默认分组', '测试分组', '生产分组']
      }
      
      // 调试信息
      console.log('设备分组数据:', this.deviceGroups)
    },
    
    handleGroupCreated(groupData) {
      // 确保数据结构正确
      const groupName = groupData.group_name || groupData
      this.deviceGroups.push(groupName)
      this.deviceData.group = groupName
      this.showCreateGroupModal = false
    },
    
    handleClose() {
      // 先触发滑出动画，然后延迟发送关闭事件
      this.$emit('close')
    },
    
    async handleSubmit() {
      if (!this.canSubmit) {
        return
      }
      
      try {
        console.log('提交设备数据:', this.deviceData)
        this.$emit('device-created', this.deviceData)
        this.$emit('close')
      } catch (error) {
        console.error('创建设备失败:', error)
      }
    },

    toggleGroupDropdown() {
      this.showGroupDropdown = !this.showGroupDropdown
    },

    selectGroup(group) {
      this.deviceData.group = group
      this.showGroupDropdown = false
    },

    toggleTimezoneDropdown() {
      this.showTimezoneDropdown = !this.showTimezoneDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showTimezoneDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectTimezone(timezone) {
      this.deviceData.timezone = timezone
      this.showTimezoneDropdown = false
    },

    toggleOfflineDelayDropdown() {
      this.showOfflineDelayDropdown = !this.showOfflineDelayDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showOfflineDelayDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectOfflineDelay(delay) {
      // 只在推荐值模式下更新
      if (this.deviceData.offlineDelayType === 'recommended') {
        this.deviceData.recommendedDelay = delay.toString();
      }
      this.showOfflineDelayDropdown = false;
    },

    toggleLocationTypeDropdown() {
      this.showLocationTypeDropdown = !this.showLocationTypeDropdown
    },

    selectLocationType(type) {
      this.deviceData.locationType = type
      this.showLocationTypeDropdown = false
    },
    
    handleClickOutside(event) {
      // 如果点击的不是下拉菜单相关元素，则关闭所有下拉菜单
      if (!event.target.closest('.custom-dropdown')) {
        this.showGroupDropdown = false
        this.showTimezoneDropdown = false
        this.showOfflineDelayDropdown = false
        this.showLocationTypeDropdown = false
      }
    },

    forceNumericInput(event) {
      const input = event.target;
      const value = input.value;
      const cleanValue = value.replace(/[^0-9]/g, '');
      
      // 如果清理后的值与原值不同，更新输入框
      if (cleanValue !== value) {
        input.value = cleanValue;
        this.deviceData.customDelay = cleanValue;
        // 设置光标位置到末尾
        this.$nextTick(() => {
          input.setSelectionRange(cleanValue.length, cleanValue.length);
        });
      }
    },

    handleTimeInputBlur() {
      const value = this.deviceData.customDelay;
      if (value === '' || value === null || value === undefined) {
        // 如果输入为空，自动设置为60
        this.deviceData.customDelay = '60';
        return;
      }
      
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        // 如果输入无效，自动设置为60
        this.deviceData.customDelay = '60';
      }
    },

    getRecommendedDelayText() {
      const delay = this.deviceData.recommendedDelay;
      if (delay === '60') return '60';
      if (delay === '120') return '120';
      if (delay === '180') return '180';
      if (delay === '240') return '240';
      if (delay === '300') return '300';
      if (delay === '600') return '600';
      return '60'; // 默认值
    },

    selectOfflineDelayType(type) {
      const newType = type === '推荐值' ? 'recommended' : 'custom';
      
      // 如果类型没有改变，不做任何操作
      if (this.deviceData.offlineDelayType === newType) {
        return;
      }
      
      // 保存当前模式的值
      if (this.deviceData.offlineDelayType === 'recommended') {
        // 从推荐值模式切换到自定义模式，保存推荐值
        this.deviceData.recommendedDelay = this.deviceData.offlineDelay;
      } else {
        // 从自定义模式切换到推荐值模式，保存自定义值
        this.deviceData.customDelay = this.deviceData.offlineDelay;
      }
      
      this.deviceData.offlineDelayType = newType;
      this.showOfflineDelayDropdown = false;
      
      // 切换到新模式时，使用对应模式保存的值
      if (newType === 'recommended') {
        this.deviceData.offlineDelay = this.deviceData.recommendedDelay;
      } else {
        this.deviceData.offlineDelay = this.deviceData.customDelay;
      }
    }
  }
}
</script>

<style scoped>
.create-device-slide {
  position: fixed;
  top: 0;
  right: 0;
  width: 70vw; /* 从80vw调整为70vw */
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000; /* 确保在蒙层之上 */
  transform: translateX(100%); /* 初始位置：隐藏在右侧 */
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 使用更平滑的缓动函数 */
  overflow-y: auto;
  will-change: transform; /* 优化动画性能 */
  backface-visibility: hidden; /* 防止闪烁 */
  -webkit-backface-visibility: hidden; /* Safari兼容 */
  transform-style: preserve-3d; /* 启用3D变换 */
}

.create-device-slide.slide-in {
  transform: translateX(0); /* 滑入位置：完全显示 */
}

.create-device-slide.slide-out {
  transform: translateX(100%); /* 滑出位置：隐藏到右侧 */
}

.slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px; /* 从12px减少到8px */
  border-bottom: 1px solid #e8e8e8;
  background-color: #fafafa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.slide-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  color: #666;
  font-size: 20px;
  transition: all 0.2s;
  line-height: 1;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.slide-content {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  /* 去掉蓝色线条 */
}

.form-row {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ff4d4f;
}

.create-device-slide .form-input,
.create-device-slide .form-select {
  padding: 6px 12px !important; /* 从10px 12px改为6px 12px，与filter-dropdown一致 */
  border: 1px solid #e0e0e0 !important; /* 从#d9d9d9改为#e0e0e0，与filter-dropdown一致 */
  border-radius: 6px !important;
  font-size: 14px !important; /* 保持14px字体大小 */
  transition: all 0.2s !important;
  width: 100% !important;
  background-color: white !important; /* 添加白色背景 */
  cursor: pointer !important; /* 添加指针样式 */
}

.create-device-slide .form-input:focus,
.create-device-slide .form-select:focus {
  outline: none !important;
  border-color: #1890ff !important; /* 保持蓝色边框 */
  box-shadow: none !important; /* 去掉阴影效果 */
}

.create-device-slide .form-input:hover,
.create-device-slide .form-select:hover {
  border-color: #1890ff !important; /* 与filter-dropdown的hover效果一致 */
}

.input-with-button {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-with-button .form-input,
.input-with-button .form-select {
  flex: 1;
  padding: 6px 12px !important; /* 与主要样式保持一致 */
  border: 1px solid #e0e0e0 !important; /* 与主要样式保持一致 */
  border-radius: 6px !important;
  font-size: 14px !important; /* 与主要样式保持一致 */
  background-color: white !important; /* 与主要样式保持一致 */
  cursor: pointer !important; /* 与主要样式保持一致 */
}

.add-group-btn,
.get-btn {
  padding: 10px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.add-group-btn:hover,
.get-btn:hover {
  background-color: #40a9ff;
}

.radio-group {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  margin: 0;
}

.radio-text {
  font-size: 14px; /* 与掉线延时标签字体大小一致 */
  color: #333;
}

.image-upload-area {
  display: flex;
  gap: 16px;
  align-items: center;
}

.image-preview {
  width: 80px;
  height: 80px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  background-color: #fafafa;
}

.upload-btn {
  padding: 10px 16px;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background-color: #73d13d;
}

.sensor-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 16px;
}

.sensor-right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sensor-right-actions .download-link {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.sensor-right-actions .download-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 40px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  background-color: #e6e6e6;
}

.download-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.download-link:hover {
  color: #40a9ff;
}

.sensor-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.sensor-table table {
  width: 100%;
  border-collapse: collapse;
}

.sensor-table th,
.sensor-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.sensor-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.sensor-table td {
  font-size: 14px;
  color: #666;
}

.empty-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.location-inputs {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.location-inputs .form-select {
  width: 120px;
  padding: 6px 12px !important; /* 与主要样式保持一致 */
  border: 1px solid #e0e0e0 !important; /* 与主要样式保持一致 */
  border-radius: 6px !important;
  font-size: 14px !important; /* 与主要样式保持一致 */
  background-color: white !important; /* 与主要样式保持一致 */
  cursor: pointer !important; /* 与主要样式保持一致 */
}

.location-inputs .form-input {
  flex: 1;
}

.locate-btn {
  padding: 10px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.locate-btn:hover {
  background-color: #40a9ff;
}

.map-container {
  height: 300px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #999;
}

.slide-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 8px 24px; /* 从12px减少到8px */
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
  position: sticky;
  bottom: 0;
}

.slide-footer .btn {
  min-width: 80px;
  height: 32px; /* 从36px减少到32px */
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-footer .btn-secondary {
  background-color: white;
  color: #333;
  border: 1px solid #d9d9d9;
}

.slide-footer .btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.slide-footer .btn-primary:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.slide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3); /* 浅灰色蒙层 */
  z-index: 999; /* 确保在其他内容之上 */
  pointer-events: auto; /* 启用点击事件，但阻止穿透 */
  transition: opacity 0.5s ease; /* 与主动画时长保持一致 */
}

.slide-overlay:hover {
  background-color: rgba(0, 0, 0, 0.3); /* 保持一致的透明度 */
}

.custom-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  background-color: white;
  transition: border-color 0.2s;
  min-height: 32px;
  box-sizing: border-box;
  min-width: 120px;
}

.custom-dropdown:hover {
  border-color: #1890ff;
}

.dropdown-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #666;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  /* 移除display: none，让v-show控制显示 */
}



.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.custom-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.input-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap; /* 防止换行 */
  min-width: 40px; /* 确保有足够宽度 */
  flex-shrink: 0; /* 防止被压缩 */
}

.form-input {
  flex: 1;
  padding: 6px 12px !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  background-color: white !important;
  height: 32px !important; /* 确保高度一致 */
  box-sizing: border-box !important;
}

.form-input:focus {
  outline: none !important;
  border-color: #1890ff !important;
  box-shadow: none !important;
}

.form-input:hover {
  border-color: #1890ff !important;
}

.input-unit {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-input[type="number"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.group-selection-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.group-selection-row .custom-dropdown {
  flex: 1;
  min-width: 120px; /* 保持最小宽度 */
  max-width: calc(100% - 100px); /* 为按钮预留空间 */
}

.group-selection-row .add-group-btn {
  white-space: nowrap;
  flex-shrink: 0;
  width: 88px; /* 固定按钮宽度 */
  height: 32px; /* 确保高度一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.serial-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.serial-input-row .form-input {
  flex: 1;
  min-width: 200px; /* 确保输入框有足够宽度 */
  height: 32px; /* 与按钮高度保持一致 */
  box-sizing: border-box;
  cursor: text; /* 恢复文本输入光标 */
}

.serial-input-row .get-btn {
  flex-shrink: 0;
  width: 80px; /* 固定按钮宽度 */
  height: 32px; /* 与输入框高度保持一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.serial-input-row .get-btn:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  border: 1px solid #d9d9d9;
}

.device-name-row {
  display: flex;
  align-items: center;
  gap: 12px; /* 调整间距 */
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.device-name-row .form-input {
  flex: 1;
  min-width: 200px; /* 确保输入框有足够宽度 */
  height: 32px; /* 与其他元素高度保持一致 */
  box-sizing: border-box;
  cursor: text; /* 恢复文本输入光标 */
}

.device-image-row {
  display: flex;
  align-items: center;
  gap: 12px; /* 调整间距 */
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.device-image-row .device-image-preview {
  width: 80px;
  height: 80px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  object-fit: cover;
}

.device-image-row .add-image-btn {
  padding: 10px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.device-image-row .add-image-btn:hover {
  background-color: #40a9ff;
}

.device-image-row .add-image-btn:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  border: 1px solid #d9d9d9;
}

.protocol-row {
  display: flex;
  align-items: center;
  gap: 12px; /* 调整间距 */
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.protocol-row .custom-dropdown {
  flex: 1;
  min-width: 200px; /* 与设备名称输入框的最小宽度一致 */
  max-width: none; /* 移除最大宽度限制 */
}

.protocol-row .custom-dropdown.disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  cursor: not-allowed;
  border-color: #d9d9d9;
}

.protocol-row .custom-dropdown.disabled .dropdown-text {
  color: #bfbfbf;
}

.protocol-row .custom-dropdown.disabled .dropdown-arrow {
  color: #bfbfbf;
}

.offline-delay-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
  min-height: 80px; /* 调整为与链接协议等下拉选择框一致的高度 */
}

.offline-delay-row .radio-group {
  display: flex;
  gap: 24px;
  margin-top: 0;
  margin-bottom: 0;
}

.offline-delay-row .custom-dropdown,
.offline-delay-row .custom-input-group {
  height: 32px; /* 固定高度，确保位置一致 */
  display: flex;
  align-items: center;
  margin-top: 0; /* 确保没有额外的上边距 */
  min-height: 32px; /* 添加最小高度确保一致性 */
  position: relative; /* 添加相对定位 */
}

.offline-delay-row .custom-dropdown {
  flex: 1;
  min-width: 200px; /* 与协议下拉选择框的最小宽度一致 */
  max-width: none; /* 移除最大宽度限制 */
  height: 32px !important; /* 使用!important确保高度不被覆盖 */
  max-height: 32px !important; /* 确保最大高度也是32px */
  min-height: 32px !important; /* 确保最小高度也是32px */
}

.offline-delay-row .custom-input-group {
  flex: 1;
  min-width: 200px;
  max-width: none;
  margin-top: 0; /* 确保没有额外的上边距 */
  height: 32px !important; /* 使用!important确保高度不被覆盖 */
  max-height: 32px !important; /* 确保最大高度也是32px */
  min-height: 32px !important; /* 确保最小高度也是32px */
}

/* 专门针对推荐值下拉选择框的样式 */
.offline-delay-dropdown {
  position: relative;
  height: 32px !important; /* 强制设置高度 */
  max-height: 32px !important;
  min-height: 32px !important;
}

.offline-delay-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999; /* 提高z-index确保不被遮挡 */
  height: auto; /* 改为自适应高度 */
  max-height: 240px; /* 最大高度限制 */
  overflow-y: auto;
  margin-top: 4px;
}

.offline-delay-menu.dropdown-up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 4px;
  /* 确保从选择框的正确位置向上展开 */
}

/* 确保下拉菜单容器有正确的定位上下文 */
.offline-delay-dropdown {
  position: relative;
}

.offline-delay-menu .dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 40px; /* 改为最小高度 */
  display: flex;
  align-items: center;
  box-sizing: border-box;
  /* 移除分隔线 */
}

.offline-delay-menu .dropdown-item:hover {
  background-color: #f0f0f0;
}

/* 确保后续元素位置固定 */
.form-section {
  margin-top: 24px; /* 固定间距 */
}

.form-row {
  margin-bottom: 16px; /* 固定行间距 */
}

/* 为掉线延时行添加固定高度容器 */
.offline-delay-container {
  min-height: 80px; /* 调整为与链接协议等下拉选择框一致的高度 */
  display: flex;
  flex-direction: column;
}

.time-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
}

.time-input-container .time-input {
  flex: 1;
  min-width: 200px;
  height: 32px;
  padding-right: 12px; /* 恢复正常的内边距 */
  box-sizing: border-box;
}

.timezone-row {
  display: flex;
  align-items: center;
  gap: 12px; /* 调整间距 */
  width: 55%; /* 设置为55%，与要求一致 */
  position: relative;
}

.timezone-row .custom-dropdown {
  flex: 1;
  min-width: 200px; /* 与协议下拉选择框的最小宽度一致 */
  max-width: none; /* 移除最大宽度限制 */
  height: 32px !important; /* 使用!important确保高度不被覆盖 */
  max-height: 32px !important; /* 确保最大高度也是32px */
  min-height: 32px !important; /* 确保最小高度也是32px */
}

.timezone-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999; /* 提高z-index确保不被遮挡 */
  height: auto; /* 改为自适应高度 */
  max-height: 320px; /* 增加最大高度，确保能显示8个选项 */
  overflow-y: auto;
  margin-top: 4px;
}

.timezone-menu.dropdown-up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 4px;
  /* 确保从选择框的正确位置向上展开 */
}

/* 确保下拉菜单容器有正确的定位上下文 */
.timezone-dropdown {
  position: relative;
}

.timezone-menu .dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 40px; /* 固定每个选项的高度为40px */
  display: flex;
  align-items: center;
  box-sizing: border-box;
  /* 移除分隔线 */
}

.timezone-menu .dropdown-item:hover {
  background-color: #f0f0f0;
}

/* 确保后续元素位置固定 */
.form-section {
  margin-top: 24px; /* 固定间距 */
}

.form-row {
  margin-bottom: 16px; /* 固定行间距 */
}

/* 为掉线延时行添加固定高度容器 */
.offline-delay-container {
  min-height: 80px; /* 调整为与链接协议等下拉选择框一致的高度 */
  display: flex;
  flex-direction: column;
}

.time-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
}

.time-input-container .time-input {
  flex: 1;
  min-width: 200px;
  height: 32px;
  padding-right: 12px; /* 恢复正常的内边距 */
  box-sizing: border-box;
}
</style>
