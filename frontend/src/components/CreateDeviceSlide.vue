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
                <div v-if="deviceData.offlineDelayType === 'recommended'" class="custom-dropdown offline-delay-dropdown">
                  <div class="dropdown-click-area" @click="toggleOfflineDelayDropdown">
                    <span class="dropdown-text">{{ getRecommendedDelayText() }}秒</span>
                    <svg class="dropdown-arrow" :class="{ 'rotated': showOfflineDelayDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
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
                      @input="forceOfflineDelayInput"
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
              <div class="custom-dropdown timezone-dropdown">
                <div class="dropdown-click-area" @click="toggleTimezoneDropdown">
                  <span class="dropdown-text">{{ deviceData.timezone || '请选择时区' }}</span>
                  <svg class="dropdown-arrow" :class="{ 'rotated': showTimezoneDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
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
      <div class="form-section sensor-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              传感器
            </label>
            <div class="sensor-actions">
              <div class="sensor-left-actions">
                <button type="button" class="btn btn-primary" @click="openSensorModal">添加传感器</button>
              </div>
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
                  <tr v-if="sensors.length === 0">
                    <td colspan="9" class="empty-data">暂无符合条件的设备</td>
                  </tr>
                  <tr v-for="sensor in paginatedSensors" :key="sensor.id">
                    <td>
                      <img src="/image/传感器图片.png" alt="传感器图标" class="sensor-icon" />
                    </td>
                    <td>{{ sensor.name }}</td>
                    <td>{{ sensor.type }}</td>
                    <td>{{ sensor.decimalPlaces }}</td>
                    <td>{{ sensor.unit }}</td>
                    <td>{{ sensor.sort }}</td>
                    <td>
                      <span v-if="sensor.uplinkMapping.x1 && sensor.uplinkMapping.x2 && sensor.uplinkMapping.y1 && sensor.uplinkMapping.y2">
                        ({{ sensor.uplinkMapping.x1 }},{{ sensor.uplinkMapping.y1 }})→({{ sensor.uplinkMapping.x2 }},{{ sensor.uplinkMapping.y2 }})
                      </span>
                      <span v-else class="no-mapping">-</span>
                    </td>
                    <td>
                      <span v-if="sensor.downlinkMapping.x1 && sensor.downlinkMapping.x2 && sensor.downlinkMapping.y1 && sensor.downlinkMapping.y2">
                        ({{ sensor.downlinkMapping.x1 }},{{ sensor.downlinkMapping.y1 }})→({{ sensor.downlinkMapping.x2 }},{{ sensor.downlinkMapping.y2 }})
                      </span>
                      <span v-else class="no-mapping">-</span>
                    </td>
                    <td>
                      <div class="sensor-actions-cell">
                        <button type="button" class="btn btn-primary btn-sm" @click="editSensor(sensor.id)">编辑</button>
                        <button type="button" class="btn btn-danger btn-sm" @click="deleteSensor(sensor.id)">删除</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页控件 -->
      <div v-if="sensors.length > 0" class="pagination-controls">
        <div class="pagination-info">
          <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页，总计 {{ sensors.length }} 条数据</span>
        </div>
        <div class="pagination-buttons">
          <button 
            class="btn btn-secondary btn-sm" 
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            上一页
          </button>
          <span class="page-numbers">
            <button 
              v-for="page in visiblePageNumbers" 
              :key="page"
              class="btn btn-sm"
              :class="page === currentPage ? 'btn-primary' : 'btn-secondary'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </span>
          <button 
            class="btn btn-secondary btn-sm" 
            :disabled="currentPage === totalPages"
            @click="goToNextPage"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">经纬度</label>
            <div class="coordinates-inputs">
              <div class="coordinate-input-group">
                <label class="coordinate-label">经度</label>
                <input 
                  v-model="deviceData.longitude" 
                  type="text" 
                  class="coordinate-input" 
                  placeholder="请输入经度"
                  @input="validateLongitude"
                  @keydown="preventInvalidCoordinateInput"
                  @paste="preventInvalidCoordinatePaste"
                />
              </div>
              <div class="coordinate-input-group">
                <label class="coordinate-label">纬度</label>
                <input 
                  v-model="deviceData.latitude" 
                  type="text" 
                  class="coordinate-input" 
                  placeholder="请输入纬度"
                  @input="validateLatitude"
                  @keydown="preventInvalidCoordinateInput"
                  @paste="preventInvalidCoordinatePaste"
                />
              </div>
              <button type="button" class="locate-btn" @click="updateMapCenter">点击定位</button>
            </div>
          </div>
        </div>

        <div class="map-container">
          <div id="baidu-map" class="baidu-map"></div>
          <div v-if="!mapLoaded" class="map-loading">
            <div class="loading-spinner"></div>
            <span>地图加载中...</span>
          </div>
          <!-- 备用地图显示 -->
          <div v-if="mapLoadFailed" class="map-fallback">
            <div class="fallback-content">
              <div class="fallback-icon">🗺️</div>
              <h4>地图加载失败</h4>
              <p>请检查网络连接或联系管理员</p>
              <button @click="retryLoadMap" class="retry-btn">重试</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="slide-footer">
      <button class="btn btn-secondary" @click="handleClose">关闭</button>
      <button class="btn btn-primary" @click="handleSubmit" :disabled="!canSubmit">确定</button>
    </div>

    <!-- 新建分组模态框 -->
    <teleport to="body">
      <CreateGroupModal
        :visible="showCreateGroupModal"
        @close="showCreateGroupModal = false"
        @group-created="handleGroupCreated"
      />
    </teleport>

    <!-- 编辑传感器模态框 -->
    <teleport to="body">
      <div v-if="showEditSensorModal" class="modal-overlay">
        <div class="modal-content sensor-modal-content">
          <div class="modal-header">
            <h3>编辑传感器</h3>
            <button class="close-btn" @click="closeEditSensorModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                名称
              </label>
              <input 
                v-model="editSensorData.name" 
                type="text" 
                class="form-input" 
                placeholder="请输入传感器名称"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                传感器类型
              </label>
              <div class="custom-dropdown edit-sensor-type-dropdown disabled">
                <span class="dropdown-text">{{ editSensorData.type }}</span>
                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                小数位
              </label>
              <div class="custom-dropdown edit-decimal-places-dropdown">
                <div class="dropdown-click-area" @click="toggleEditDecimalPlacesDropdown">
                  <span class="dropdown-text">{{ editSensorData.decimalPlaces || '请选择小数位' }}</span>
                  <svg class="dropdown-arrow" :class="{ 'rotated': showEditDecimalPlacesDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-show="showEditDecimalPlacesDropdown" class="dropdown-menu" :class="{ 'dropdown-up': shouldShowEditDecimalPlacesUp }">
                  <div 
                    v-for="decimal in ['0(小数位)', '1(小数位)', '2(小数位)', '3(小数位)']" 
                    :key="decimal" 
                    class="dropdown-item"
                    @click.stop="selectEditDecimalPlaces(decimal)"
                  >
                    {{ decimal }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                单位
              </label>
              <input 
                v-model="editSensorData.unit" 
                type="text" 
                class="form-input" 
                placeholder="请输入单位"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">排序</label>
              <input 
                v-model="editSensorData.sort" 
                type="text" 
                class="form-input" 
                placeholder="为空时自动排序"
                data-field="sort"
                @input="forcePositiveIntegerEdit"
                @keydown="preventInvalidInput"
                @paste="preventInvalidPaste"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">
                上行映射
              </label>
              <div class="mapping-inputs">
                <input 
                  v-model="editSensorData.uplinkMapping.x1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x1"
                  @input="forceNumericInputEdit('uplinkMapping.x1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="editSensorData.uplinkMapping.y1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y1"
                  @input="forceNumericInputEdit('uplinkMapping.y1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <span class="mapping-arrow">=></span>
                <input 
                  v-model="editSensorData.uplinkMapping.x2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x2"
                  @input="forceNumericInputEdit('uplinkMapping.x2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="editSensorData.uplinkMapping.y2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y2"
                  @input="forceNumericInputEdit('uplinkMapping.y2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                下行映射
              </label>
              <div class="mapping-inputs">
                <input 
                  v-model="editSensorData.downlinkMapping.x1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x1"
                  @input="forceNumericInputEdit('downlinkMapping.x1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="editSensorData.downlinkMapping.y1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y1"
                  @input="forceNumericInputEdit('downlinkMapping.y1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <span class="mapping-arrow">=></span>
                <input 
                  v-model="editSensorData.downlinkMapping.x2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x2"
                  @input="forceNumericInputEdit('downlinkMapping.x2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="editSensorData.downlinkMapping.y2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y2"
                  @input="forceNumericInputEdit('downlinkMapping.y2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeEditSensorModal">取消</button>
            <button class="btn btn-primary" @click="confirmEditSensor" :disabled="!canSubmitEditSensor">确定</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 新建传感器模态框 -->
    <teleport to="body">
      <div v-if="showSensorModal" class="modal-overlay">
        <div class="modal-content sensor-modal-content">
          <div class="modal-header">
            <h3>新建传感器</h3>
            <button class="close-btn" @click="closeSensorModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                名称
              </label>
              <input v-model="sensorData.name" type="text" class="form-input" placeholder="请输入传感器名称" required/>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                传感器类型
              </label>
              <div class="custom-dropdown sensor-type-dropdown disabled">
                <span class="dropdown-text">数值型</span>
                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                小数位
              </label>
              <div class="custom-dropdown decimal-places-dropdown">
                <div class="dropdown-click-area" @click="toggleDecimalPlacesDropdown">
                  <span class="dropdown-text">{{ sensorData.decimalPlaces || '请选择小数位' }}</span>
                  <svg class="dropdown-arrow" :class="{ 'rotated': showDecimalPlacesDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-show="showDecimalPlacesDropdown" class="dropdown-menu" :class="{ 'dropdown-up': shouldShowDecimalPlacesUp }">
                  <div 
                    v-for="decimal in decimalPlacesOptions" 
                    :key="decimal" 
                    class="dropdown-item"
                    @click.stop="selectDecimalPlaces(decimal)"
                  >
                    {{ decimal }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                单位
              </label>
              <input v-model="sensorData.unit" type="text" class="form-input" placeholder="请输入单位" required/>
            </div>

            <div class="form-group">
              <label class="form-label">排序</label>
              <input 
                v-model="sensorData.sort" 
                type="text" 
                class="form-input" 
                placeholder="为空时自动排序"
                data-field="sort"
                @input="forcePositiveInteger"
                @keydown="preventInvalidInput"
                @paste="preventInvalidPaste"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                上行映射
              </label>
              <div class="mapping-inputs">
                <input 
                  v-model="sensorData.uplinkMapping.x1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x1"
                  @input="forceNumericInput('uplinkMapping.x1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="sensorData.uplinkMapping.y1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y1"
                  @input="forceNumericInput('uplinkMapping.y1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <span class="mapping-arrow">=></span>
                <input 
                  v-model="sensorData.uplinkMapping.x2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x2"
                  @input="forceNumericInput('uplinkMapping.x2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="sensorData.uplinkMapping.y2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y2"
                  @input="forceNumericInput('uplinkMapping.y2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                下行映射
              </label>
              <div class="mapping-inputs">
                <input 
                  v-model="sensorData.downlinkMapping.x1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x1"
                  @input="forceNumericInput('downlinkMapping.x1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="sensorData.downlinkMapping.y1" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y1"
                  @input="forceNumericInput('downlinkMapping.y1')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <span class="mapping-arrow">=></span>
                <input 
                  v-model="sensorData.downlinkMapping.x2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="x2"
                  @input="forceNumericInput('downlinkMapping.x2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
                <input 
                  v-model="sensorData.downlinkMapping.y2" 
                  type="text" 
                  class="mapping-input" 
                  placeholder="y2"
                  @input="forceNumericInput('downlinkMapping.y2')"
                  @keydown="preventInvalidInput"
                  @paste="preventInvalidPaste"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                添加数量
              </label>
              <input 
                v-model="sensorData.quantity" 
                type="text" 
                class="form-input" 
                min="1" 
                required
                data-field="quantity"
                @input="forcePositiveInteger"
                @keydown="preventInvalidInput"
                @paste="preventInvalidPaste"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeSensorModal">关闭</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              :disabled="!canSubmitSensor"
              @click="confirmSensorModal"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </teleport>
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
  
  // 添加错误处理
  errorCaptured(err, instance, info) {
    console.error('组件错误被捕获:', err, instance, info);
    return false; // 阻止错误继续传播
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(newVal) {
      console.log('visible 属性变化:', newVal);
      console.log('当前组件状态:', this.$el ? '已挂载' : '未挂载');
      if (newVal) {
        // 当组件显示时，重置所有数据为默认值
        console.log('组件显示，开始重置数据...');
        this.resetDeviceData();
        console.log('数据重置完成');
      } else {
        console.log('组件隐藏');
      }
    }
  },
  data() {
    return {
      showCreateGroupModal: false,
      deviceData: {
        deviceId: '', // 设备ID，将在组件显示时生成
        group: '',
        serialNumber: '',
        deviceName: '',
        protocol: 'MB-RTU', // 默认选择MB-RTU
        offlineDelayType: 'recommended',
        offlineDelay: '60',
        recommendedDelay: '60', // 新增：推荐值模式下的延时值
        customDelay: '60', // 新增：自定义模式下的延时值
        timezone: 'UTC+08:00', // 默认选择北京时间
        longitude: '',
        latitude: '',
        deviceImage: '/image/设备图片.png' // 使用本地静态图片
      },
      deviceGroups: [], // 从API获取设备分组
      sensors: [],
      showGroupDropdown: false,
      showTimezoneDropdown: false,
      showOfflineDelayDropdown: false,
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
      showSensorModal: false, // 新增：控制传感器模态框显示
      sensorData: {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      },
      sensorTypeOptions: ['数值型', '布尔型', '字符串型'], // 新增：传感器类型选项
      showSensorTypeDropdown: false, // 新增：控制传感器类型下拉菜单显示
      showDecimalPlacesDropdown: false, // 新增：控制小数位下拉菜单显示
      decimalPlacesOptions: ['0(小数位)', '1(小数位)', '2(小数位)', '3(小数位)', '4(小数位)'], // 新增：小数位选项
      mapLoaded: false, // 新增：地图加载状态
      baiduMap: null, // 新增：百度地图实例
      mapLoadFailed: false, // 新增：地图加载失败状态
      showEditSensorModal: false, // 新增：控制编辑传感器模态框显示
      editSensorData: {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      },
      showEditSensorTypeDropdown: false, // 新增：控制编辑传感器类型下拉菜单显示
      showEditDecimalPlacesDropdown: false, // 新增：控制编辑小数位下拉菜单显示
      // 分页相关数据
      currentPage: 1,
      pageSize: 10
    }
  },
  mounted() {
    // 组件挂载后不立即初始化地图，等待组件显示
    console.log('组件已挂载，等待显示...');
    
    // 添加全局点击事件监听器，用于关闭下拉选择框
    document.addEventListener('click', this.handleGlobalClick);
  },
  beforeUnmount() {
    // 移除全局点击事件监听器
    document.removeEventListener('click', this.handleGlobalClick);
  },
  watch: {
    // 监听visible属性变化，当组件显示时初始化地图
    visible(newVal) {
      if (newVal && !this.mapLoaded) {
        console.log('组件显示，开始初始化地图...');
        // 延迟初始化地图，确保DOM已完全渲染
        this.$nextTick(() => {
          setTimeout(() => {
            this.initBaiduMap();
          }, 500);
        });
      }
      
      // 当组件显示时，获取设备分组数据
      if (newVal) {
        this.fetchDeviceGroups();
      }
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
    },
    shouldShowSensorTypeUp() {
      // 检查是否有足够的向下空间显示传感器类型选项
      if (typeof window !== 'undefined' && this.showSensorTypeDropdown) {
        const dropdownElement = document.querySelector('.sensor-type-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 320; // 3个选项需要的空间：3 * 40px = 120px
          
          console.log('传感器类型空间检测:', {
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
    shouldShowDecimalPlacesUp() {
      // 检查是否有足够的向下空间显示小数位选项
      if (typeof window !== 'undefined' && this.showDecimalPlacesDropdown) {
        const dropdownElement = document.querySelector('.decimal-places-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 320; // 4个选项需要的空间：4 * 40px = 160px
          
          console.log('小数位空间检测:', {
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
    shouldShowEditSensorTypeUp() {
      // 检查是否有足够的向下空间显示编辑传感器类型选项
      if (typeof window !== 'undefined' && this.showEditSensorTypeDropdown) {
        const dropdownElement = document.querySelector('.edit-sensor-type-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 120; // 3个选项需要的空间：3 * 40px = 120px
          
          // 如果下方空间不够，则向上显示
          return spaceBelow < neededSpace;
        }
      }
      return false;
    },
    shouldShowEditDecimalPlacesUp() {
      // 检查是否有足够的向下空间显示编辑小数位选项
      if (typeof window !== 'undefined' && this.showEditDecimalPlacesDropdown) {
        const dropdownElement = document.querySelector('.edit-decimal-places-dropdown');
        if (dropdownElement) {
          const rect = dropdownElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - rect.bottom;
          const neededSpace = 160; // 4个选项需要的空间：4 * 40px = 160px
          
          // 如果下方空间不够，则向上显示
          return spaceBelow < neededSpace;
        }
      }
      return false;
    },
    canSubmitSensor() {
      // 检查必填字段：名称、类型、小数位、单位、数量
      return this.sensorData.name.trim() && 
             this.sensorData.type && 
             this.sensorData.decimalPlaces && 
             this.sensorData.unit.trim() && 
             this.sensorData.quantity.trim();
    },
    canSubmitEditSensor() {
      // 检查必填字段：名称、类型、小数位、单位
      return this.editSensorData.name.trim() && 
             this.editSensorData.type && 
             this.editSensorData.decimalPlaces && 
             this.editSensorData.unit.trim();
    },
    
    // 分页相关计算属性
    paginatedSensors() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sensors.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.sensors.length / this.pageSize);
    },
    
    visiblePageNumbers() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 5) {
        // 如果总页数少于等于5，显示所有页数
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 如果总页数大于5，显示当前页附近的页数
        if (current <= 3) {
          // 当前页在前3页
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (current >= total - 2) {
          // 当前页在后3页
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // 当前页在中间
          for (let i = current - 2; i <= current + 2; i++) {
            pages.push(i);
          }
        }
      }
      
      return pages;
    }
  },
  methods: {
    async fetchDeviceGroups() {
      try {
        const response = await fetch('http://localhost:3000/api/options/groups')
        if (response.ok) {
          const data = await response.json()
          this.deviceGroups = data.data || []
          console.log('成功获取设备分组:', this.deviceGroups)
        } else {
          console.warn('获取设备分组失败，状态码:', response.status)
          this.deviceGroups = []
        }
      } catch (error) {
        console.error('获取设备分组失败:', error)
        this.deviceGroups = []
      }
    },
    
    handleGroupCreated(groupData) {
      // 确保数据结构正确
      const groupName = groupData.group_name || groupData
      this.deviceGroups.push(groupName)
      this.deviceData.group = groupName
      this.showCreateGroupModal = false
    },
    
    handleClose() {
      console.log('点击关闭按钮，开始重置数据...');
      // 重置所有数据为默认值
      this.resetDeviceData();
      console.log('数据重置完成，发送关闭事件');
      // 先触发滑出动画，然后延迟发送关闭事件
      this.$emit('close')
    },
    
    async handleSubmit() {
      if (!this.canSubmit) {
        return
      }
      
              // 添加全局错误处理
        this.handleUnhandledRejection = (event) => {
          console.error('未处理的Promise拒绝:', event.reason);
          event.preventDefault();
        };
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      
      try {
        console.log('提交设备数据:', this.deviceData)
        console.log('传感器数据:', this.sensors)
        
        // 使用前端已生成的设备ID
        const deviceId = this.deviceData.deviceId;
        
        // 验证DTU设备数据完整性
        if (!deviceId || !this.deviceData.deviceName || !this.deviceData.group) {
          throw new Error('DTU设备数据不完整，请检查设备名称和分组')
        }
        
        // 准备DTU设备数据
        const dtuData = {
          device_id: deviceId,
          serial_number: this.deviceData.serialNumber,
          device_group: this.deviceData.group,
          device_name: this.deviceData.deviceName,
          device_image: this.deviceData.deviceImage,
          link_protocol: this.deviceData.protocol,
          offline_delay: this.deviceData.offlineDelayType === 'recommended' 
            ? (parseInt(this.deviceData.recommendedDelay) || 60) 
            : (parseInt(this.deviceData.customDelay) || 60),
          timezone_setting: this.deviceData.timezone.replace('UTC', ''),
          longitude: this.deviceData.longitude ? (parseFloat(this.deviceData.longitude) || null) : null,
          latitude: this.deviceData.latitude ? (parseFloat(this.deviceData.latitude) || null) : null,
          status: '未连接' // 使用默认状态
        }
        
        console.log('准备插入的DTU数据:', dtuData)
        
        // 创建DTU设备
        const dtuResponse = await fetch('/api/dtu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dtuData)
        })
        
        if (!dtuResponse.ok) {
          throw new Error(`创建DTU设备失败: ${dtuResponse.statusText}`)
        }
        
        const dtuResult = await dtuResponse.json()
        console.log('DTU设备创建成功:', dtuResult)
        
        // 创建所有传感器
        if (this.sensors.length > 0) {
          for (const sensor of this.sensors) {
            // 验证传感器数据完整性
            if (!sensor.id || !sensor.name) {
              throw new Error(`传感器数据不完整: ID=${sensor.id}, 名称=${sensor.name}`)
            }
            
            // 传感器ID已经在添加时生成，这里只需要关联DTU ID
            sensor.dtuId = deviceId;
            
            // 准备传感器数据
            const sensorData = {
              sensor_id: sensor.id, // 使用已生成的传感器ID
              dtu_id: deviceId,
              icon: '/image/传感器图片.png', // 添加传感器图标
              sensor_name: sensor.name,
              sensor_type: sensor.type,
              decimal_places: parseInt(sensor.decimalPlaces.match(/\d+/)?.[0] || '0') || 0, // 提取数字部分，添加安全检查
              unit: sensor.unit || '°C',
              sort_order: sensor.sort ? (parseInt(sensor.sort) || null) : null,
              upper_mapping_x1: sensor.uplinkMapping.x1 && sensor.uplinkMapping.x1 !== '' ? (parseFloat(sensor.uplinkMapping.x1) || -32768) : -32768,
              upper_mapping_y1: sensor.uplinkMapping.y1 && sensor.uplinkMapping.y1 !== '' ? (parseFloat(sensor.uplinkMapping.y1) || 32767) : 32767,
              upper_mapping_x2: sensor.uplinkMapping.x2 && sensor.uplinkMapping.x2 !== '' ? (parseFloat(sensor.uplinkMapping.x2) || -2048) : -2048,
              upper_mapping_y2: sensor.uplinkMapping.y2 && sensor.uplinkMapping.y2 !== '' ? (parseFloat(sensor.uplinkMapping.y2) || 2047.9) : 2047.9,
              lower_mapping_x1: sensor.downlinkMapping.x1 && sensor.downlinkMapping.x1 !== '' ? (parseFloat(sensor.downlinkMapping.x1) || null) : null,
              lower_mapping_y1: sensor.downlinkMapping.y1 && sensor.downlinkMapping.y1 !== '' ? (parseFloat(sensor.downlinkMapping.y1) || null) : null,
              lower_mapping_x2: sensor.downlinkMapping.x2 && sensor.downlinkMapping.x2 !== '' ? (parseFloat(sensor.downlinkMapping.x2) || null) : null,
              lower_mapping_y2: sensor.downlinkMapping.y2 && sensor.downlinkMapping.y2 !== '' ? (parseFloat(sensor.downlinkMapping.y2) || null) : null
            }
            
            console.log('准备插入的传感器数据:', sensorData)
            
            // 创建传感器
            const sensorResponse = await fetch('/api/sensors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(sensorData)
            })
            
            if (!sensorResponse.ok) {
              throw new Error(`创建传感器失败: ${sensorResponse.statusText}`)
            }
            
            const sensorResult = await sensorResponse.json()
            console.log('传感器创建成功:', sensorResult)
          }
        }
        
        // 为所有传感器创建MB RTU协议配置
        if (this.sensors.length > 0) {
          console.log('开始创建MB RTU协议配置...')
          
          const mbRtuConfigs = this.sensors.map((sensor, index) => ({
            dtu_id: deviceId,
            sensor_id: sensor.id,
            slave_address: 1, // 默认从站地址
            function_code: '04只读', // 默认功能码
            offset_value: sensor.sort ? parseInt(sensor.sort) : (index + 1), // 使用传感器的排序作为偏置值
            data_format: '16位有符号数', // 默认数据格式
            data_bits: null, // 数据位默认为空
            byte_order_value: null, // 字节顺序默认为空
            collection_cycle: 2 // 采集周期默认2秒
          }))
          
          console.log('准备创建的MB RTU配置:', mbRtuConfigs)
          
          // 批量创建MB RTU协议配置
          const mbRtuResponse = await fetch('/api/mb-rtu-configs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ configs: mbRtuConfigs })
          })
          
          if (!mbRtuResponse.ok) {
            throw new Error(`创建MB RTU协议配置失败: ${mbRtuResponse.statusText}`)
          }
          
          const mbRtuResult = await mbRtuResponse.json()
          console.log('MB RTU协议配置创建成功:', mbRtuResult)
        }
        
        // 发送成功事件
        this.$emit('device-created', {
          ...this.deviceData,
          deviceId: deviceId,
          sensors: this.sensors
        })
        
        // 重置设备数据，为下次创建做准备
        this.resetDeviceData();
        
        this.$emit('close')
        
      } catch (error) {
        console.error('创建设备失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          deviceData: this.deviceData,
          sensors: this.sensors
        })
        
        // 确保错误不会继续传播
        event?.preventDefault?.();
        event?.stopPropagation?.();
        
        // 这里可以添加用户提示，比如显示错误消息
        alert(`创建设备失败: ${error.message}`)
      } finally {
        // 清理全局事件监听器
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      }
        },
    
    generateUniqueId(prefix) {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 6);
      return `${prefix}_${timestamp}_${randomStr}`;
    },
    
    resetDeviceData() {
      console.log('开始重置设备数据...');
      console.log('重置前的设备数据:', JSON.stringify(this.deviceData));
      console.log('重置前的传感器数组:', JSON.stringify(this.sensors));
      
      // 重置设备数据为默认值
      this.deviceData = {
        deviceId: this.generateUniqueId('DTU'), // 生成新的设备ID
        group: '',
        serialNumber: '',
        deviceName: '',
        protocol: 'MB-RTU', // 默认选择MB-RTU
        offlineDelayType: 'recommended',
        offlineDelay: '60',
        recommendedDelay: '60', // 推荐值模式下的延时值
        customDelay: '60', // 自定义模式下的延时值
        timezone: 'UTC+08:00', // 默认选择北京时间
        longitude: '',
        latitude: '',
        deviceImage: '/image/设备图片.png' // 使用本地静态图片
      };
      
      // 重置传感器数组
      this.sensors = [];
      
      // 重置传感器数据
      this.sensorData = {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      };
      
      console.log('重置后的设备数据:', JSON.stringify(this.deviceData));
      console.log('重置后的传感器数组:', JSON.stringify(this.sensors));
      console.log('设备数据已重置完成');
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

    handleClickOutside(event) {
      // 如果点击的不是下拉菜单相关元素，则关闭所有下拉菜单
      if (!event.target.closest('.custom-dropdown')) {
        this.showGroupDropdown = false
        this.showTimezoneDropdown = false
        this.showOfflineDelayDropdown = false
        this.showSensorTypeDropdown = false // 新增：关闭传感器类型下拉菜单
        this.showDecimalPlacesDropdown = false // 新增：关闭小数位下拉菜单
      }
    },

    forceNumericInput(field) {
      // 移除除了数字、小数点和负号之外的所有字符
      let value = this.sensorData[field];
      value = value.replace(/[^0-9.-]/g, '');
      
      // 确保只有一个小数点
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // 确保负号只在开头
      if (value.startsWith('-')) {
        value = '-' + value.substring(1).replace(/-/g, '');
      } else {
        value = value.replace(/-/g, '');
      }
      
      this.sensorData[field] = value;
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
    },

    openSensorModal() {
      // 重置传感器数据为默认值
      this.sensorData = {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      };
      
      this.showSensorModal = true;
      // 确保模态框打开时滚动到顶部
      this.$nextTick(() => {
        setTimeout(() => {
          const modalBody = document.querySelector('.sensor-modal-content .modal-body');
          if (modalBody) {
            modalBody.scrollTop = 0;
            // 强制重新计算布局
            modalBody.style.scrollTop = '0px';
          }
        }, 100); // 延迟100ms确保DOM完全渲染
      });
    },
    closeSensorModal() {
      // 关闭模态框时也重置数据，确保下次打开时是空白表单
      this.sensorData = {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      };
      
      this.showSensorModal = false;
    },
    

    
    confirmSensorModal() {
      // 根据数量创建传感器
      const quantity = parseInt(this.sensorData.quantity) || 1;
      
      // 获取当前最大排序号
      const maxSort = this.sensors.length > 0 ? Math.max(...this.sensors.map(s => parseInt(s.sort) || 0)) : 0;
      let nextSort = maxSort + 1;
      
      for (let i = 0; i < quantity; i++) {
        // 如果用户没有输入排序，使用自动递增的排序号
        const sortValue = this.sensorData.sort.trim() || nextSort.toString();
        if (!this.sensorData.sort.trim()) {
          nextSort++;
        }
        
        const newSensor = {
          id: this.generateUniqueId('SENSOR'), // 生成唯一的传感器ID
          name: quantity > 1 ? `${this.sensorData.name}_${i + 1}` : this.sensorData.name,
          type: this.sensorData.type,
          decimalPlaces: this.sensorData.decimalPlaces,
          unit: this.sensorData.unit,
          sort: sortValue,
          uplinkMapping: this.sensorData.uplinkMapping,
          downlinkMapping: this.sensorData.downlinkMapping,
          quantity: '1'
        };
        this.sensors.push(newSensor);
        console.log(`传感器 ${i + 1} 创建成功，ID: ${newSensor.id}`);
      }
      
      this.showSensorModal = false;
      
      // 重置传感器数据
      this.sensorData = {
        name: '',
        type: '数值型', // 固定为数值型
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        quantity: '1' // 确保默认值为1
      };
      
      console.log('传感器添加成功，当前传感器数量:', this.sensors.length);
    },

    toggleSensorTypeDropdown() {
      this.showSensorTypeDropdown = !this.showSensorTypeDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showSensorTypeDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectSensorType(type) {
      this.sensorData.type = type;
      this.showSensorTypeDropdown = false;
    },

    toggleDecimalPlacesDropdown() {
      this.showDecimalPlacesDropdown = !this.showDecimalPlacesDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showDecimalPlacesDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectDecimalPlaces(decimal) {
      this.sensorData.decimalPlaces = decimal;
      this.showDecimalPlacesDropdown = false;
    },

    forcePositiveInteger(event) {
      // 直接处理输入框的值，只保留数字
      const value = event.target.value;
      if (value && typeof value === 'string') {
        event.target.value = value.replace(/[^0-9]/g, '');
        // 更新对应的数据
        const fieldName = event.target.getAttribute('data-field');
        if (fieldName && this.sensorData[fieldName] !== undefined) {
          this.sensorData[fieldName] = event.target.value;
        }
      }
    },
    
    forcePositiveIntegerEdit(event) {
      // 直接处理输入框的值，只保留数字
      const value = event.target.value;
      if (value && typeof value === 'string') {
        event.target.value = value.replace(/[^0-9]/g, '');
        // 更新对应的数据
        const fieldName = event.target.getAttribute('data-field');
        if (fieldName && this.editSensorData[fieldName] !== undefined) {
          this.editSensorData[fieldName] = event.target.value;
        }
      }
    },
    
    forceOfflineDelayInput(event) {
      // 专门处理掉线延时输入，只允许正整数
      const value = event.target.value;
      if (value && typeof value === 'string') {
        // 只保留数字
        const numericValue = value.replace(/[^0-9]/g, '');
        event.target.value = numericValue;
        // 更新数据
        this.deviceData.customDelay = numericValue;
      }
    },

    forceNumericInput(field) {
      // 处理嵌套对象的字段，如 'uplinkMapping.x1'
      if (!field || typeof field !== 'string') {
        console.warn('forceNumericInput: field参数无效:', field);
        return;
      }
      
      const fieldParts = field.split('.');
      if (fieldParts.length === 2) {
        const obj = fieldParts[0];
        const prop = fieldParts[1];
        // 允许数字和小数点，但只允许一个小数点
        let value = this.sensorData[obj][prop];
        // 移除除了数字和小数点之外的所有字符
        value = value.replace(/[^0-9.]/g, '');
        // 确保只有一个小数点
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        this.sensorData[obj][prop] = value;
      } else {
        let value = this.sensorData[field];
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        this.sensorData[field] = value;
      }
    },
    
    forceNumericInputEdit(field) {
      // 处理嵌套对象的字段，如 'uplinkMapping.x1'
      const fieldParts = field.split('.');
      if (fieldParts.length === 2) {
        const obj = fieldParts[0];
        const prop = fieldParts[1];
        // 允许数字和小数点，但只允许一个小数点
        let value = this.editSensorData[obj][prop];
        // 移除除了数字和小数点之外的所有字符
        value = value.replace(/[^0-9.]/g, '');
        // 确保只有一个小数点
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        this.editSensorData[obj][prop] = value;
      } else {
        let value = this.editSensorData[field];
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        this.editSensorData[field] = value;
      }
    },

    preventInvalidInput(event) {
      // 只允许数字键、小数点键和功能键
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
      ];
      
      if (!/^[0-9.]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
      
      // 如果输入的是小数点，检查是否已经存在小数点
      if (event.key === '.') {
        const input = event.target;
        if (input.value.includes('.')) {
          event.preventDefault();
        }
      }
    },

    preventInvalidPaste(event) {
      const pastedText = (event.clipboardData || window.clipboardData).getData('text');
      // 允许数字和小数点，但只允许一个小数点
      if (!/^[0-9.]*$/.test(pastedText) || (pastedText.split('.').length > 2)) {
        event.preventDefault();
      }
    },

    validateLongitude(event) {
      // 经度验证：只允许数字、小数点和负号，范围-180到180
      let value = event.target.value;
      // 移除除了数字、小数点和负号之外的所有字符
      value = value.replace(/[^0-9.-]/g, '');
      // 确保只有一个小数点
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // 确保负号只能在开头
      if (value.startsWith('-')) {
        value = '-' + value.substring(1).replace(/-/g, '');
      } else {
        value = value.replace(/-/g, '');
      }
      // 验证范围：-180 到 180
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= -180 && numValue <= 180) {
        this.deviceData.longitude = value;
      } else if (value === '' || value === '-' || value === '.') {
        this.deviceData.longitude = value;
      } else {
        // 如果超出范围，保持原值
        event.target.value = this.deviceData.longitude;
      }
    },

    validateLatitude(event) {
      // 纬度验证：只允许数字、小数点和负号，范围-90到90
      let value = event.target.value;
      // 移除除了数字、小数点和负号之外的所有字符
      value = value.replace(/[^0-9.-]/g, '');
      // 确保只有一个小数点
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // 确保负号只能在开头
      if (value.startsWith('-')) {
        value = '-' + value.substring(1).replace(/-/g, '');
      } else {
        value = value.replace(/-/g, '');
      }
      // 验证范围：-90 到 90
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= -90 && numValue <= 90) {
        this.deviceData.latitude = value;
      } else if (value === '' || value === '-' || value === '.') {
        this.deviceData.latitude = value;
      } else {
        // 如果超出范围，保持原值
        event.target.value = this.deviceData.latitude;
      }
    },

    preventInvalidCoordinateInput(event) {
      // 只允许数字键、小数点键、负号键和功能键
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
      ];
      
      if (!/^[0-9.-]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
      
      // 如果输入的是小数点，检查是否已经存在小数点
      if (event.key === '.') {
        const input = event.target;
        if (input.value.includes('.')) {
          event.preventDefault();
        }
      }
      
      // 如果输入的是负号，检查是否已经在开头
      if (event.key === '-') {
        const input = event.target;
        if (input.value.includes('-') || input.selectionStart !== 0) {
          event.preventDefault();
        }
      }
    },

    preventInvalidCoordinatePaste(event) {
      const pastedText = (event.clipboardData || window.clipboardData).getData('text');
      // 允许数字、小数点和负号，但只允许一个小数点和一个负号在开头
      if (!/^[0-9.-]*$/.test(pastedText) || 
          pastedText.split('.').length > 2 || 
          pastedText.split('-').length > 2 ||
          (pastedText.includes('-') && !pastedText.startsWith('-'))) {
        event.preventDefault();
      }
    },

    // 百度地图相关方法
    initBaiduMap() {
      console.log('开始初始化百度地图...');
      // 检查百度地图API是否已加载
      if (typeof BMap !== 'undefined') {
        console.log('BMap已存在，直接创建地图');
        this.createMap();
        return;
      }
      
      // 动态加载百度地图脚本
      this.loadBaiduMapScript();
    },

    // 动态加载百度地图脚本
    loadBaiduMapScript() {
      console.log('开始加载百度地图脚本...');
      
      // 创建script标签
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://api.map.baidu.com/api?v=3.0&ak=LXMsmZAC4MIsdrxjpbOKNOPy5JykiQZD&callback=initBaiduMap';
      
      // 定义全局回调函数
      window.initBaiduMap = () => {
        console.log('百度地图脚本加载成功，开始创建地图...');
        this.createMap();
      };
      
      script.onerror = () => {
        console.error('百度地图脚本加载失败');
        this.mapLoaded = false;
        this.mapLoadFailed = true;
      };
      
      // 添加到head中
      document.head.appendChild(script);
    },

    // 创建地图实例
    createMap() {
      try {
        console.log('开始创建地图实例...');
        
        // 检查DOM元素是否存在
        const mapContainer = document.getElementById('baidu-map');
        if (!mapContainer) {
          console.error('地图容器不存在');
          this.mapLoaded = false;
          this.mapLoadFailed = true;
          return;
        }
        
        console.log('地图容器存在，创建BMap实例...');
        
        // 创建地图实例
        this.baiduMap = new BMap.Map('baidu-map');
        
        // 设置地图中心点（默认深圳宝安机场附近）
        const centerPoint = new BMap.Point(113.825, 22.639);
        this.baiduMap.centerAndZoom(centerPoint, 12);
        
        // 启用滚轮缩放
        this.baiduMap.enableScrollWheelZoom(true);
        
        // 添加地图控件
        this.baiduMap.addControl(new BMap.NavigationControl());
        this.baiduMap.addControl(new BMap.ScaleControl());
        this.baiduMap.addControl(new BMap.OverviewMapControl());
        
        // 点击地图获取经纬度
        this.baiduMap.addEventListener("click", (e) => {
          const lng = e.point.lng;
          const lat = e.point.lat;
          
          console.log('地图点击坐标:', lng, lat);
          
          // 更新页面上的经纬度输入框
          this.deviceData.longitude = lng.toFixed(6);
          this.deviceData.latitude = lat.toFixed(6);
          
          // 清除之前的标记
          this.baiduMap.clearOverlays();
          
          // 添加新标记
          const marker = new BMap.Marker(e.point);
          this.baiduMap.addOverlay(marker);
          
          // 添加信息窗口
          const infoWindow = new BMap.InfoWindow(`经度: ${lng.toFixed(6)}<br>纬度: ${lat.toFixed(6)}`);
          marker.addEventListener('click', () => {
            this.baiduMap.openInfoWindow(infoWindow, e.point);
          });
        });
        
        // 标记地图已加载
        this.mapLoaded = true;
        this.mapLoadFailed = false;
        
        console.log('百度地图初始化成功');
        
      } catch (error) {
        console.error('百度地图初始化失败:', error);
        this.mapLoaded = false;
        this.mapLoadFailed = true;
      }
    },

    // 根据经纬度更新地图中心点
    updateMapCenter() {
      if (!this.baiduMap || !this.mapLoaded) return;
      
      const longitude = parseFloat(this.deviceData.longitude);
      const latitude = parseFloat(this.deviceData.latitude);
      
      if (!isNaN(longitude) && !isNaN(latitude)) {
        console.log('定位到坐标:', longitude, latitude);
        
        // 清除之前的标记
        this.baiduMap.clearOverlays();
        
        // 创建坐标点
        const point = new BMap.Point(longitude, latitude);
        
        // 添加标记
        const marker = new BMap.Marker(point);
        this.baiduMap.addOverlay(marker);
        
        // 定位到该点
        this.baiduMap.panTo(point);
        
        // 添加信息窗口
        const infoWindow = new BMap.InfoWindow(`经度: ${longitude.toFixed(6)}<br>纬度: ${latitude.toFixed(6)}`);
        marker.addEventListener('click', () => {
          this.baiduMap.openInfoWindow(infoWindow, point);
        });
        
        console.log('地图已定位到指定坐标');
      } else {
        console.warn('经纬度数据无效，无法定位');
      }
    },

    retryLoadMap() {
      this.mapLoadFailed = false;
      this.initBaiduMap();
    },

    deleteSensor(id) {
      this.sensors = this.sensors.filter(sensor => sensor.id !== id);
    },

    editSensor(id) {
      // 找到要编辑的传感器
      const sensor = this.sensors.find(s => s.id === id);
      if (sensor) {
        // 复制传感器数据到编辑表单
        this.editSensorData = {
          id: sensor.id, // 保存原始ID用于更新
          name: sensor.name,
          type: sensor.type,
          decimalPlaces: sensor.decimalPlaces,
          unit: sensor.unit,
          sort: sensor.sort,
          uplinkMapping: { ...sensor.uplinkMapping },
          downlinkMapping: { ...sensor.downlinkMapping }
        };
        
        // 打开编辑模态框
        this.showEditSensorModal = true;
        
        console.log('编辑传感器:', this.editSensorData);
      }
    },

    toggleEditSensorTypeDropdown() {
      this.showEditSensorTypeDropdown = !this.showEditSensorTypeDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showEditSensorTypeDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectEditSensorType(type) {
      this.editSensorData.type = type;
      this.showEditSensorTypeDropdown = false;
    },

    toggleEditDecimalPlacesDropdown() {
      this.showEditDecimalPlacesDropdown = !this.showEditDecimalPlacesDropdown;
      
      // 如果下拉菜单要显示，强制重新计算是否应该向上展开
      if (this.showEditDecimalPlacesDropdown) {
        this.$nextTick(() => {
          this.$forceUpdate(); // 强制重新渲染以更新计算属性
        });
      }
    },

    selectEditDecimalPlaces(decimal) {
      this.editSensorData.decimalPlaces = decimal;
      this.showEditDecimalPlacesDropdown = false;
    },

    closeEditSensorModal() {
      this.showEditSensorModal = false;
    },

    confirmEditSensor() {
      // 更新现有的传感器
      const sensorIndex = this.sensors.findIndex(s => s.id === this.editSensorData.id);
      if (sensorIndex !== -1) {
        // 更新传感器数据，保持ID不变
        this.sensors[sensorIndex] = {
          ...this.sensors[sensorIndex], // 保持其他字段不变，包括ID
          name: this.editSensorData.name,
          type: this.editSensorData.type,
          decimalPlaces: this.editSensorData.decimalPlaces,
          unit: this.editSensorData.unit,
          sort: this.editSensorData.sort,
          uplinkMapping: { ...this.editSensorData.uplinkMapping },
          downlinkMapping: { ...this.editSensorData.downlinkMapping }
        };
        
        console.log('传感器更新成功:', this.sensors[sensorIndex]);
      }
      
      this.showEditSensorModal = false;
      
      // 重置编辑传感器数据
      this.editSensorData = {
        name: '',
        type: '数值型',
        decimalPlaces: '0(小数位)',
        unit: '',
        sort: '',
        uplinkMapping: { x1: '', x2: '', y1: '', y2: '' },
        downlinkMapping: { x1: '', x2: '', y1: '', y2: '' }
      };
    },
    
    // 分页控制方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    // 全局点击事件处理，用于关闭下拉选择框
    handleGlobalClick(event) {
      // 检查点击的元素是否在下拉选择框内
      const isClickInsideDropdown = event.target.closest('.custom-dropdown') || 
                                   event.target.closest('.dropdown-menu') ||
                                   event.target.closest('.dropdown-item');
      
      // 如果点击的不是下拉选择框内的元素，则关闭所有下拉选择框
      if (!isClickInsideDropdown) {
        this.showGroupDropdown = false;
        this.showOfflineDelayDropdown = false;
        this.showTimezoneDropdown = false;
        this.showSensorTypeDropdown = false;
        this.showDecimalPlacesDropdown = false;
        this.showEditSensorTypeDropdown = false;
        this.showEditDecimalPlacesDropdown = false;
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
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  /* 去掉蓝色线条 */
}

.form-row {
  margin-bottom: 12px;
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
  margin-top: 0;
  margin-bottom: 0;
}

.sensor-left-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  overflow: hidden;
  margin-top: 0;
}

/* 传感器部分的特殊样式 */
.sensor-section {
  margin-bottom: 0;
}

.sensor-section .form-row {
  margin-bottom: 0;
}

.sensor-table table {
  width: 100%;
  border-collapse: collapse;
}

.sensor-table th {
  background-color: #fafafa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
}

.sensor-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.empty-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
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
  width: 100%;
  aspect-ratio: 1.79; /* 宽度:高度 = 1:0.56，即高度为宽度的56%（约70%的70%） */
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin-top: 16px;
  background-color: #f5f5f5;
}

.baidu-map {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}



.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  z-index: 100;
  gap: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.map-loading span {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.custom-dropdown.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.6;
}

.custom-dropdown.disabled .dropdown-text {
  color: #999;
}

.custom-dropdown.disabled .dropdown-arrow {
  color: #999;
}

.dropdown-click-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.custom-dropdown:hover:not(.disabled) {
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
  box-shadow: none !important; /* 去掉阴影效果 */
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

.sensor-modal-footer .btn {
  min-width: 80px;
  height: 36px; /* 调整按钮高度 */
}

/* 传感器模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* 确保在最顶层 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 85vh; /* 增加高度，从90vh改为85vh */
  min-height: 500px; /* 添加最小高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.sensor-modal-content {
  max-width: 467px; /* 缩减宽度1/3，从700px改为467px */
  max-height: 95vh; /* 增加最大高度，确保能显示所有字段 */
  min-height: 800px; /* 增加最小高度，确保能显示所有字段 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px; /* 增加头部padding，从12px改为16px */
  border-bottom: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 16px 24px; /* 减少顶部padding，从24px改为16px */
  flex-grow: 1;
  overflow-y: auto;
  min-height: 600px; /* 增加最小高度，确保能显示所有字段 */
  scroll-behavior: smooth; /* 添加平滑滚动 */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px; /* 减少尾部padding，从16px改为12px */
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.modal-footer .btn {
  min-width: 80px;
  height: 36px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.modal-footer .btn-secondary {
  background-color: white;
  color: #333;
}

.modal-footer .btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.modal-footer .btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.modal-footer .btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.modal-footer .btn-primary:disabled {
  background-color: #d9d9d9;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

/* 模态框内的表单样式 */
.modal-body .form-group {
  margin-bottom: 16px;
}

.modal-body .form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.modal-body .required {
  color: #ff4d4f;
  margin-right: 4px;
}

.modal-body .form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.modal-body .form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-body .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: white;
  cursor: pointer;
  font-family: inherit;
}

.modal-body .form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 映射输入样式 */
.mapping-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.mapping-input {
  flex: 1;
  min-width: 80px;
  height: 32px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  font-family: inherit;
}

.mapping-arrow {
  font-size: 18px;
  color: #666;
  font-weight: bold;
  margin: 0 8px;
}

.help-icon {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
  cursor: help;
}

/* 传感器模态框自定义下拉框样式 */
.modal-body .custom-dropdown {
  position: relative;
  width: 100%;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.modal-body .custom-dropdown:hover:not(.disabled) {
  border-color: #1890ff;
}

.modal-body .custom-dropdown.disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-body .custom-dropdown.disabled:hover {
  border-color: #d9d9d9;
}

.modal-body .custom-dropdown:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-body .dropdown-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-body .dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #999;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.modal-body .dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.modal-body .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.modal-body .dropdown-menu.dropdown-up {
  bottom: 100%;
  top: auto;
  margin-top: 0;
  margin-bottom: 4px;
}

.modal-body .dropdown-item {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-body .dropdown-item:hover {
  background-color: #f5f5f5;
}

.modal-body .dropdown-item:first-child {
  border-radius: 6px 6px 0 0;
}

.modal-body .dropdown-item:last-child {
  border-radius: 0 0 6px 6px;
}

.modal-body .dropdown-menu.dropdown-up .dropdown-item:first-child {
  border-radius: 0 0 6px 6px;
}

.modal-body .dropdown-menu.dropdown-up .dropdown-item:last-child {
  border-radius: 6px 6px 0 0;
}

/* 传感器表格样式 */
.sensor-table {
  margin-top: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.sensor-table table {
  width: 100%;
  border-collapse: collapse;
}

.sensor-table th {
  background-color: #fafafa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
}

.sensor-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.sensor-table .empty-data {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 0;
}

.sensor-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 16px;
}

.sensor-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
  min-width: 50px;
  margin-right: 4px;
}

.btn-sm:last-child {
  margin-right: 0;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #ff7875;
}

.no-mapping {
  color: #ccc;
  font-style: italic;
}

/* 经纬度输入框样式 */
.coordinates-inputs {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  width: 50%; /* 缩短为原来的一半 */
}

.coordinate-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.coordinate-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.coordinate-input {
  width: 100%;
  height: 32px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.coordinate-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.coordinate-input::placeholder {
  color: #bfbfbf;
  font-size: 14px;
}

.map-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  z-index: 101;
  gap: 12px;
}

.fallback-content {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.fallback-icon {
  font-size: 48px;
  color: #ff4d4f;
}

.retry-btn {
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

.retry-btn:hover {
  background-color: #40a9ff;
}

.sensor-info {
  margin: 12px 0;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.sensor-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.sensor-actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}



/* 分页控件样式 */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
}

.btn-secondary.btn-sm {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm {
  background-color: #1890ff;
  color: white;
}

.btn-primary.btn-sm:hover {
  background-color: #40a9ff;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
  min-width: 50px;
  margin-right: 4px;
}

.btn-sm:last-child {
  margin-right: 0;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.btn-secondary.btn-sm:hover:disabled {
  background-color: #e6e6e6;
}

.btn-primary.btn-sm:disabled {
  background-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.btn-primary.btn-sm:hover:disabled {
  background-color: #40a9ff;
}

.btn-secondary.btn-sm:disabled {
  border: 1px solid #d9d9d9;
  background-color: #f0f0f0;
  color: #bfbfbf;
}
</style>
