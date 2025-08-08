<template>
  <PageLayout 
    title="监控中心" 
    description="这里是监控中心页面，包含设备管理功能"
  >
    <el-button type="primary" @click="testClick">测试按钮</el-button>
  </PageLayout>
</template>

<script>
import PageLayout from '../components/PageLayout.vue'

export default {
  name: 'MonitoringCenter',
  components: {
    PageLayout
  },
  setup() {
    const testClick = () => {
      alert('监控中心页面正常！')
    }
    return { testClick }
  }
}
</script>
