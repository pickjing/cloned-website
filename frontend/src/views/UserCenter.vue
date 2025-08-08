<template>
  <PageLayout 
    title="用户中心" 
    description="这里是用户中心页面，包含用户管理功能"
  >
    <p>这里是UserCenter页面内容</p>
  </PageLayout>
</template>

<script>
import PageLayout from '../components/PageLayout.vue'

export default { 
  name: "UserCenter",
  components: {
    PageLayout
  }
}
</script>
