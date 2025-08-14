<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h3 class="modal-title">新建分组</h3>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 模态框内容 -->
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            <span class="required">*</span>
            分组名:
          </label>
          <div class="input-wrapper">
            <input
              ref="groupNameInput"
              v-model="groupName"
              type="text"
              class="form-input"
              :class="{ 
                'input-error': showError, 
                'input-success': showSuccess 
              }"
              placeholder="请输入分组名"
              @input="handleInput"
              @blur="handleBlur"
            />
            <!-- 成功图标 -->
            <div v-if="showSuccess" class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <!-- 状态消息区域 - 固定高度避免抖动 -->
          <div class="status-messages">
            <!-- 错误提示 -->
            <div v-if="showError" class="error-message">
              {{ errorMessage }}
            </div>
            <!-- 检查状态 -->
            <div v-else-if="isChecking" class="checking-message">
              检查中...
            </div>
            <!-- 成功状态 -->
            <div v-else-if="showSuccess" class="success-message">
              分组名可用
            </div>
            <!-- 占位符，保持高度稳定 -->
            <div v-else class="placeholder-message"></div>
          </div>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">关闭</button>
        <button 
          class="btn btn-primary" 
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateGroupModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      groupName: '',
      isChecking: false,
      showError: false,
      showSuccess: false,
      errorMessage: '',
      checkTimeout: null
    }
  },
  computed: {
    canSubmit() {
      return this.groupName.trim() !== '' && !this.showError && !this.isChecking;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.groupNameInput?.focus();
        });
      } else {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.groupName = '';
      this.isChecking = false;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = '';
      if (this.checkTimeout) {
        clearTimeout(this.checkTimeout);
        this.checkTimeout = null;
      }
    },
    
    handleInput() {
      // 清除之前的检查结果
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = '';
      
      // 清除之前的定时器
      if (this.checkTimeout) {
        clearTimeout(this.checkTimeout);
      }
      
      // 设置新的定时器，用户停止输入500ms后开始检查
      this.checkTimeout = setTimeout(() => {
        this.checkGroupName();
      }, 500);
    },
    
    async checkGroupName() {
      if (!this.groupName.trim()) {
        return;
      }
      
      this.isChecking = true;
      this.showError = false;
      this.showSuccess = false;
      
      try {
        const response = await fetch(`http://localhost:3000/api/groups/check?group_name=${encodeURIComponent(this.groupName.trim())}`);
        const data = await response.json();
        
        if (data.success) {
          if (data.data.exists) {
            this.showError = true;
            this.errorMessage = '分组名已存在';
          } else {
            this.showSuccess = true;
          }
        } else {
          this.showError = true;
          this.errorMessage = data.message || '检查失败';
        }
      } catch (error) {
        this.showError = true;
        this.errorMessage = '网络错误，请重试';
      } finally {
        this.isChecking = false;
      }
    },
    
    handleBlur() {
      // 失去焦点时立即检查
      if (this.checkTimeout) {
        clearTimeout(this.checkTimeout);
        this.checkTimeout = null;
      }
      this.checkGroupName();
    },
    
    async handleSubmit() {
      if (!this.canSubmit) {
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3000/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            group_name: this.groupName.trim(),
            description: ''
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 发送成功事件，让父组件处理关闭
          this.$emit('group-created', data.data);
        } else {
          this.showError = true;
          this.errorMessage = data.message || '创建失败';
        }
      } catch (error) {
        this.showError = true;
        this.errorMessage = '网络错误，请重试';
      }
    },
    
    handleClose() {
      this.$emit('close');
    },
    
    handleOverlayClick() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #999;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
  margin-right: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  padding-right: 32px;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input.input-error {
  border-color: #ff4d4f;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.form-input.input-success {
  border-color: #52c41a;
}

.form-input.input-success:focus {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.success-icon {
  position: absolute;
  right: 8px;
  color: #52c41a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-messages {
  margin-top: 8px;
  min-height: 16px;
  position: relative;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  line-height: 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.checking-message {
  color: #999;
  font-size: 12px;
  line-height: 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.success-message {
  color: #52c41a;
  font-size: 12px;
  line-height: 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.placeholder-message {
  height: 16px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.btn-secondary {
  background-color: white;
  color: #333;
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-primary:disabled {
  background-color: #d9d9d9;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}
</style>
