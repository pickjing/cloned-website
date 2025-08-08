<template>
  <div class="page-layout">
    <div class="page-header">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageLayout',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.page-layout {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-header {
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}
</style>
