<template>
  <PageLayout 
    title="设备管理" 
    description="这里是设备管理页面，包含设备管理功能"
  >
    <div class="device-management-container">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <div class="filter-section">
          <div class="filter-dropdown" @click="toggleGroupDropdown">
            <span>{{ selectedGroup || '所有设备组' }}</span>
            <svg class="dropdown-arrow" :class="{ 'rotated': showGroupDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 设备组下拉菜单 -->
            <div class="dropdown-menu" v-if="showGroupDropdown">
              <div class="dropdown-item" @click.stop="selectGroup('所有设备组')">所有设备组</div>
              <div class="dropdown-item" v-for="group in deviceGroups" :key="group" @click.stop="selectGroup(group)">
                {{ group }}
              </div>
            </div>
          </div>
          <div class="filter-dropdown" @click="toggleStatusDropdown">
            <span>{{ selectedStatus || '全部状态' }}</span>
            <svg class="dropdown-arrow" :class="{ 'rotated': showStatusDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 状态下拉菜单 -->
            <div class="dropdown-menu" v-if="showStatusDropdown">
              <div class="dropdown-item" @click.stop="selectStatus('全部状态')">全部状态</div>
              <div class="dropdown-item" v-for="status in deviceStatuses" :key="status" @click.stop="selectStatus(status)">
                {{ status }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="search-section">
          <input 
            type="text" 
            placeholder="设备名称/ID" 
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="search-icon">
              <circle cx="11" cy="11" r="8" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="action-section">
          <button class="action-btn new-group-btn" @click="showCreateGroupModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon">
              <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>新建分组</span>
          </button>
          <button class="action-btn new-device-btn" @click="showCreateDeviceSlide = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon">
              <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>新建设备</span>
          </button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-area">
        <!-- 设备列表 -->
        <div class="device-list" v-if="devices.length > 0">
          <div class="device-item" v-for="device in currentPageDevices" :key="device.device_id">
            <div class="device-checkbox">
              <input 
                type="checkbox" 
                :id="device.device_id"
                v-model="selectedDevices"
                :value="device.device_id"
              />
              <label :for="device.device_id" class="checkmark"></label>
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.device_name }}</div>
              <div class="device-details">
                <span class="device-id">ID: {{ device.device_id }}</span>
                <span class="device-status" :class="device.status">{{ device.status }}</span>
                <span class="device-group">{{ device.device_group || '未分组' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div class="empty-state" v-else-if="!loading">
          <p>暂无符合条件的设备</p>
        </div>
        
        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading">
          <p>加载中...</p>
        </div>
      </div>

      <!-- 底部分页和批量操作栏 -->
      <div class="pagination-bar">
        <div class="bulk-actions">
          <label class="select-all-checkbox">
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="handleSelectAll"
            />
            <span class="checkmark"></span>
          </label>
          <button 
            class="bulk-action-btn copy-btn" 
            :class="{ 'disabled': selectedDevices.length === 0, 'active': selectedDevices.length > 0 }"
            :disabled="selectedDevices.length === 0"
            @click="handleCopy"
          >
            复制
          </button>
          <button 
            class="bulk-action-btn delete-btn" 
            :class="{ 'disabled': selectedDevices.length === 0, 'active': selectedDevices.length > 0 }"
            :disabled="selectedDevices.length === 0"
            @click="handleDelete"
          >
            删除
          </button>
          <button 
            class="bulk-action-btn reset-btn" 
            :class="{ 'disabled': selectedDevices.length === 0, 'active': selectedDevices.length > 0 }"
            :disabled="selectedDevices.length === 0"
            @click="handleReset"
          >
            重置({{ selectedDevices.length }})
          </button>
          <button 
            class="bulk-action-btn move-btn" 
            :class="{ 'disabled': selectedDevices.length === 0, 'active': selectedDevices.length > 0 }"
            :disabled="selectedDevices.length === 0"
            @click="handleMoveToGroup"
          >
            移动至分组
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="pagination-info">
          <span v-if="totalDevices > 0">
            当前 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalDevices) }} / 总数 {{ totalDevices }}
          </span>
          <span v-else>暂无数据</span>
        </div>
        
        <div class="pagination-controls">
          <button 
            class="pagination-btn" 
            :class="{ 'disabled': currentPage === 1 }"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- 页码显示 -->
          <template v-for="page in visiblePages" :key="page">
            <button 
              v-if="page !== '...'" 
              class="pagination-btn" 
              :class="{ 'current-page': page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">...</span>
          </template>
          
          <button 
            class="pagination-btn" 
            :class="{ 'disabled': currentPage === totalPages }"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- 每页条数选择 -->
          <div class="page-size-dropdown" @click="togglePageSizeDropdown">
            <span>{{ pageSize }}条/页</span>
            <svg class="dropdown-arrow" :class="{ 'rotated': showPageSizeDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="dropdown-menu" v-if="showPageSizeDropdown">
              <div class="dropdown-item" v-for="size in pageSizeOptions" :key="size" @click.stop="selectPageSize(size)">
                {{ size }}条/页
              </div>
            </div>
          </div>
          
          <div class="jump-to-page">
            <span>跳至</span>
            <input 
              type="text" 
              class="page-input" 
              v-model="jumpToPage"
              placeholder="页码"
              @keyup.enter="handleJumpToPage"
              @blur="handleJumpToPage"
            />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建分组模态对话框 -->
    <CreateGroupModal
      :visible="showCreateGroupModal"
      @close="showCreateGroupModal = false"
      @group-created="handleGroupCreated"
    />

    <!-- 新建设备滑动页面 -->
    <CreateDeviceSlide
      :visible="showCreateDeviceSlide"
      @close="handleCloseDeviceSlide"
      @device-created="handleDeviceCreated"
    />
  </PageLayout>
</template>

<script>
import PageLayout from '../components/PageLayout.vue'
import CreateGroupModal from '../components/CreateGroupModal.vue'
import CreateDeviceSlide from '../components/CreateDeviceSlide.vue'

export default { 
  name: "DeviceManagement",
  components: {
    PageLayout,
    CreateGroupModal,
    CreateDeviceSlide
  },
  data() {
    return {
      deviceGroups: [],
      deviceStatuses: [],
      selectedGroup: null,
      selectedStatus: null,
      showGroupDropdown: false,
      showStatusDropdown: false,
      searchQuery: '',
      devices: [], // 存储所有设备数据
      loading: true, // 加载状态
      currentPage: 1, // 当前页码
      pageSize: 20, // 每页条数
      totalDevices: 0, // 总设备数
      selectedDevices: [], // 选中的设备ID列表
      selectAll: false, // 全选状态
      jumpToPage: '1', // 跳转页码（改为字符串类型）
      showPageSizeDropdown: false, // 每页条数下拉框显示状态
      pageSizeOptions: [10, 20, 30, 40, 50], // 每页条数选项
      showCreateGroupModal: false, // 新建分组模态对话框显示状态
      showCreateDeviceSlide: false // 新建设备滑动页显示状态
    }
  },
  computed: {
    totalPages() {
      // 如果没有数据，返回1而不是0
      return Math.max(1, Math.ceil(this.totalDevices / this.pageSize));
    },
    visiblePages() {
      const pages = [];
      if (this.totalPages <= 5) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        if (this.currentPage > 3) {
          pages.push('...');
        }
        if (this.currentPage > 2) {
          pages.push(this.currentPage - 1);
        }
        pages.push(this.currentPage);
        if (this.currentPage < this.totalPages - 1) {
          pages.push(this.currentPage + 1);
        }
        if (this.currentPage < this.totalPages - 2) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }
      return pages;
    },
    currentPageDevices() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.devices.slice(start, end);
    }
  },
  async mounted() {
    await this.fetchOptions()
    await this.fetchDevices()
    // 添加点击外部关闭下拉框的事件监听
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async fetchOptions() {
      try {
        // 获取设备分组选项
        const groupsResponse = await fetch('http://localhost:3000/api/options/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          this.deviceGroups = groupsData.data || []
        }

        // 获取设备状态选项
        const statusResponse = await fetch('http://localhost:3000/api/options/status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          this.deviceStatuses = statusData.data || []
        }
      } catch (error) {
        console.error('获取选项失败:', error)
      }
    },
    async fetchDevices() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          group: this.selectedGroup || undefined,
          status: this.selectedStatus || undefined,
          search: this.searchQuery || undefined,
        };
        const response = await fetch(`http://localhost:3000/api/dtu?${new URLSearchParams(params).toString()}`);
        if (response.ok) {
          const data = await response.json();
          this.devices = data.data.devices;
          this.totalDevices = data.data.total;
          // 同步更新跳转页面输入框
          this.jumpToPage = this.currentPage.toString();
        } else {
          console.error('获取设备列表失败:', response.status);
        }
      } catch (error) {
        console.error('获取设备列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    toggleGroupDropdown() {
      this.showGroupDropdown = !this.showGroupDropdown
      this.showStatusDropdown = false
    },
    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown
      this.showGroupDropdown = false
    },
    selectGroup(group) {
      this.selectedGroup = group === '所有设备组' ? null : group
      this.currentPage = 1 // 切换分组时重置到第一页
      this.showGroupDropdown = false // 关闭下拉框
      this.fetchDevices()
    },
    selectStatus(status) {
      this.selectedStatus = status === '全部状态' ? null : status
      this.currentPage = 1 // 切换状态时重置到第一页
      this.showStatusDropdown = false // 关闭下拉框
      this.fetchDevices()
    },
    handleSearch() {
      this.currentPage = 1 // 搜索时重置到第一页
      this.fetchDevices()
    },
    async handleCopy() {
      if (this.selectedDevices.length === 0) return;
      try {
        const response = await fetch('http://localhost:3000/api/dtu/copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: this.selectedDevices }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message || '复制成功');
          this.selectedDevices = [];
          this.selectAll = false;
          this.fetchDevices();
        } else {
          const errorData = await response.json();
          alert(errorData.message || '复制失败');
        }
      } catch (error) {
        console.error('复制失败:', error);
        alert('复制失败');
      }
    },
    async handleDelete() {
      if (this.selectedDevices.length === 0) return;
      if (!confirm('确定要删除选中的设备吗？')) {
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/dtu/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: this.selectedDevices }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message || '删除成功');
          this.selectedDevices = [];
          this.selectAll = false;
          this.fetchDevices();
        } else {
          const errorData = await response.json();
          alert(errorData.message || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    },
    async handleReset() {
      if (this.selectedDevices.length === 0) return;
      if (!confirm('确定要重置选中的设备吗？')) {
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/dtu/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: this.selectedDevices }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message || '重置成功');
          this.selectedDevices = [];
          this.selectAll = false;
          this.fetchDevices();
        } else {
          const errorData = await response.json();
          alert(errorData.message || '重置失败');
        }
      } catch (error) {
        console.error('重置失败:', error);
        alert('重置失败');
      }
    },
    async handleMoveToGroup() {
      if (this.selectedDevices.length === 0) return;
      const group = prompt('请输入要移动到的分组名称：');
      if (!group) return;

      try {
        const response = await fetch('http://localhost:3000/api/dtu/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: this.selectedDevices, group_name: group }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message || '移动成功');
          this.selectedDevices = [];
          this.selectAll = false;
          this.fetchDevices();
        } else {
          const errorData = await response.json();
          alert(errorData.message || '移动失败');
        }
      } catch (error) {
        console.error('移动失败:', error);
        alert('移动失败');
      }
    },
    handleSelectAll() {
      if (this.selectAll) {
        this.selectedDevices = this.currentPageDevices.map(device => device.device_id);
      } else {
        this.selectedDevices = [];
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.jumpToPage = page.toString(); // 同步更新跳转输入框
        this.fetchDevices();
      }
    },
    togglePageSizeDropdown() {
      this.showPageSizeDropdown = !this.showPageSizeDropdown;
    },
    selectPageSize(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchDevices();
      this.showPageSizeDropdown = false;
    },
    handleJumpToPage() {
      const page = parseInt(this.jumpToPage);
      if (isNaN(page) || page < 1 || page > this.totalPages) {
        alert(`请输入1到${this.totalPages}之间的页码`);
        this.jumpToPage = this.currentPage.toString();
        return;
      }
      this.goToPage(page);
    },
    handleClickOutside(event) {
      // 如果点击的不是下拉框或其子元素，则关闭所有下拉框
      if (!event.target.closest('.filter-dropdown') && !event.target.closest('.page-size-dropdown')) {
        this.showGroupDropdown = false;
        this.showStatusDropdown = false;
        this.showPageSizeDropdown = false;
      }
    },
    handleGroupCreated() {
      this.showCreateGroupModal = false;
      this.fetchOptions(); // 刷新设备分组选项
    },
    handleDeviceCreated() {
      this.showCreateDeviceSlide = false;
      this.fetchDevices(); // 刷新设备列表
    },
    
    handleCloseDeviceSlide() {
      // 立即关闭，无延迟
      this.showCreateDeviceSlide = false;
    }
  }
}
</script>

<style scoped>
.device-management-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

/* 顶部控制栏 */
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  gap: 16px;
}

.filter-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s;
  position: relative;
  width: 120px; /* 缩小宽度 */
}

.filter-dropdown span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  font-size: 14px; /* 统一字体大小 */
}

.filter-dropdown:hover {
  border-color: #1890ff;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #666;
  transition: transform 0.3s ease; /* Added for rotation */
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 120px; /* 与下拉框宽度一致 */
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

/* 每页条数下拉框特殊样式 - 向上展开 */
.page-size-dropdown .dropdown-menu {
  top: auto !important;
  bottom: 100% !important;
  margin-top: 0 !important;
  margin-bottom: 4px !important;
}

.dropdown-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 200px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background-color: #1890ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #40a9ff;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #40a9ff;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* 主要内容区域 */
.content-area {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

/* 设备列表样式 */
.device-list {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.device-item:hover {
  background-color: #f0f0f0;
}

.device-checkbox {
  margin-right: 12px;
  flex-shrink: 0;
}

.device-checkbox input[type="checkbox"] {
  display: none;
}

.device-checkbox .checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d9d9d9;
  border-radius: 3px;
  background-color: white;
  position: relative;
}

.device-checkbox input[type="checkbox"]:checked + .checkmark {
  background-color: #1890ff;
  border-color: #1890ff;
}

.device-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.device-details {
  font-size: 14px;
  color: #666;
  display: flex;
  gap: 12px;
}

.device-id {
  font-weight: bold;
}

.device-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.device-status.已连接 {
  background-color: #e1f3d8;
  color: #67c23a;
}

.device-status.未连接 {
  background-color: #fde2e2;
  color: #f56c6c;
}

.device-status.已删除 {
  background-color: #fde2e2;
  color: #f56c6c;
}

.device-status.已禁用 {
  background-color: #e9ecef;
  color: #6c757d;
}

.device-group {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 空状态和加载状态 */
.empty-state, .loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: #999;
  font-size: 18px;
}

/* 底部分页和批量操作栏 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.select-all-checkbox input[type="checkbox"] {
  display: none;
}

.select-all-checkbox .checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d9d9d9;
  border-radius: 3px;
  background-color: white;
  position: relative;
}

.select-all-checkbox input[type="checkbox"]:checked + .checkmark {
  background-color: #1890ff;
  border-color: #1890ff;
}

.select-all-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.bulk-action-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.bulk-action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.bulk-action-btn.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.bulk-action-btn.disabled:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

.bulk-action-btn.active.copy-btn {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.bulk-action-btn.active.copy-btn:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.bulk-action-btn.active.delete-btn {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.bulk-action-btn.active.delete-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.bulk-action-btn.active.reset-btn {
  background-color: #909399;
  border-color: #909399;
  color: white;
}

.bulk-action-btn.active.reset-btn:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}

.bulk-action-btn.active.move-btn {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.bulk-action-btn.active.move-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover {
  border-color: #1890ff;
}

.pagination-btn.current-page {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.pagination-btn.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.pagination-btn.disabled:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

.pagination-btn.disabled svg {
  color: #bfbfbf;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
  color: #666;
}

.pagination-btn.current-page svg {
  color: white;
}

.pagination-ellipsis {
  color: #666;
  font-size: 14px;
}

.page-size-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
  z-index: 20; /* 确保下拉框在最上层 */
}

.page-size-dropdown:hover {
  border-color: #1890ff;
}

.page-size-dropdown .dropdown-arrow {
  transition: transform 0.3s ease;
}

.page-size-dropdown.rotated .dropdown-arrow {
  transform: rotate(180deg);
}

.page-size-dropdown .dropdown-menu {
  position: absolute !important;
  bottom: 100% !important;
  top: auto !important;
  left: 0 !important;
  width: 100px !important;
  background-color: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  z-index: 25 !important; /* 确保下拉菜单在最上层 */
  max-height: 200px !important;
  overflow-y: auto !important;
  margin-bottom: 4px !important;
  margin-top: 0 !important;
  min-height: 120px !important; /* 确保有足够的高度显示内容 */
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.page-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

/* 移除数字输入框的上下箭头 */
.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input[type=number] {
  -moz-appearance: textfield;
}

.page-input:focus {
  outline: none;
  border-color: #1890ff;
}
</style>
