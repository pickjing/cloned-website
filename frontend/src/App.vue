<template>
  <div id="app">
    <!-- 左侧固定导航栏 -->
    <div class="side-nav">

      <!-- 导航菜单 -->
      <ul class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          custom
          v-slot="{ navigate, isActive }"
        >
          <li
            class="nav-item"
            :class="{ active: isActive }"
            @click="navigate"
          >
            <SvgIcon :name="item.icon" class="icon" />
            <span class="label">{{ item.label }}</span>
          </li>
        </router-link>
      </ul>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcon from './components/SvgIcon.vue'

export default {
  name: 'App',
  components: {
    SvgIcon
  },
  setup() {
    const router = useRouter()

    // 导航栏项目
    const navItems = computed(() => {
      return router.getRoutes()
        .filter(route => route.meta && route.meta.label)
        .map(route => ({
          path: route.path,
          label: route.meta.label,
          icon: route.meta.icon
        }))
    })

    return {
      navItems
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  display: flex;
}

/* 左侧固定导航栏 */
.side-nav {
  width: 240px;
  background-color: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
}

.logo-section {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.logo {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  position: relative;
  border-bottom: 1px solid #f5f5f5;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-item .icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  width: 20px;
  text-align: center;
}

.nav-item .label {
  font-size: 14px;
  color: #333;
}

/* 高亮样式 */
.nav-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.nav-item.active .icon {
  color: #1890ff;
}

.nav-item.active .label {
  color: #1890ff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #1890ff;
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  width: calc(100vw - 240px);
}
</style>