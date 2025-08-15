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
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备分组
            </label>
            <div class="input-with-button">
              <select v-model="deviceData.group" class="form-select" required>
                <option value="">请选择分组</option>
                <option v-for="group in deviceGroups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>
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
            <div class="input-with-button">
              <input v-model="deviceData.serialNumber" type="text" class="form-input" placeholder="请输入序列号" required/>
              <button type="button" class="get-btn">获取</button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              设备名称
            </label>
            <input v-model="deviceData.deviceName" type="text" class="form-input" placeholder="请输入设备名称" required/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">设备图片</label>
            <div class="image-upload-area">
              <div class="image-preview">图片</div>
              <button type="button" class="upload-btn">+ 添加</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 连接配置 -->
      <div class="form-section">
        <h3 class="section-title">连接配置</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              链接协议
            </label>
            <select v-model="deviceData.protocol" class="form-select" required>
              <option value="MQTT">MQTT</option>
              <option value="HTTP">HTTP</option>
              <option value="CoAP">CoAP</option>
              <option value="MB_RTU">MB RTU</option>
              <option value="MB_TCP">MB TCP</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              掉线延时
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="deviceData.offlineDelayType" value="recommended" name="offlineDelay"/>
                <span>推荐值</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="deviceData.offlineDelayType" value="custom" name="offlineDelay"/>
                <span>自定义</span>
              </label>
            </div>
            <select v-model="deviceData.offlineDelay" class="form-select" :disabled="deviceData.offlineDelayType === 'recommended'">
              <option value="30">30秒</option>
              <option value="60">60秒</option>
              <option value="120">120秒</option>
              <option value="300">300秒</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              时区设置
            </label>
            <select v-model="deviceData.timezone" class="form-select" required>
              <option value="">请选择时区</option>
              <option value="UTC+08:00">UTC+08:00 (北京时间)</option>
              <option value="UTC+09:00">UTC+09:00 (东京时间)</option>
              <option value="UTC+00:00">UTC+00:00 (格林威治时间)</option>
              <option value="UTC-05:00">UTC-05:00 (纽约时间)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 传感器配置 -->
      <div class="form-section">
        <h3 class="section-title">
          <span class="required">*</span>
          传感器
        </h3>
        <div class="sensor-actions">
          <button type="button" class="btn btn-primary">+ 添加传感器</button>
          <a href="#" class="download-link">下载模板</a>
          <button type="button" class="btn btn-secondary">导入Excel</button>
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

      <!-- 位置信息 -->
      <div class="form-section">
        <h3 class="section-title">位置信息</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">经纬度</label>
            <div class="location-inputs">
              <select v-model="deviceData.locationType" class="form-select">
                <option value="manual">手动输入</option>
                <option value="map">地图选择</option>
              </select>
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
        protocol: 'MQTT',
        offlineDelayType: 'recommended',
        offlineDelay: '60',
        timezone: '',
        locationType: 'manual',
        coordinates: ''
      },
      deviceGroups: [],
      sensors: []
    }
  },
  computed: {
    canSubmit() {
      return this.deviceData.group && 
             this.deviceData.serialNumber && 
             this.deviceData.deviceName && 
             this.deviceData.timezone &&
             this.sensors.length > 0
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchDeviceGroups()
      }
    }
  },
  methods: {
    async fetchDeviceGroups() {
      try {
        const response = await fetch('http://localhost:3000/api/options/groups')
        if (response.ok) {
          const data = await response.json()
          this.deviceGroups = data.data || []
        }
      } catch (error) {
        console.error('获取设备分组失败:', error)
      }
    },
    
    handleGroupCreated(groupData) {
      this.deviceGroups.push(groupData.group_name)
      this.deviceData.group = groupData.group_name
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
  padding-bottom: 8px;
  border-bottom: 2px solid #1890ff;
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

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-with-button {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-with-button .form-input,
.input-with-button .form-select {
  flex: 1;
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
  margin-bottom: 12px;
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
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
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
</style>
