<template>
  <div id="app">
    <!-- 左侧固定导航栏 -->
    <div 
      class="side-nav"
      :class="{ 'expanded': isExpanded }"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
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
            :title="!isExpanded ? item.label : ''"
          >
            <SvgIcon :name="item.icon" class="icon" />
            <span class="label" v-show="isExpanded">{{ item.label }}</span>
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
    const isExpanded = ref(false)

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
      navItems,
      isExpanded
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
  width: 60px;
  background-color: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.side-nav.expanded {
  width: 240px;
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
  transition: all 0.3s ease;
  position: relative;
  border-bottom: 1px solid #f5f5f5;
  white-space: nowrap;
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
  flex-shrink: 0;
  transition: margin 0.3s ease;
}

/* 收缩状态下的图标居中 */
.side-nav:not(.expanded) .nav-item {
  justify-content: center;
  padding: 15px 0;
}

.side-nav:not(.expanded) .nav-item .icon {
  margin-right: 0;
}

.nav-item .label {
  font-size: 14px;
  color: #333;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(-10px);
}

.side-nav.expanded .nav-item .label {
  opacity: 1;
  transform: translateX(0);
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
  width: calc(100vw - 60px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-nav.expanded + .main-content {
  width: calc(100vw - 240px);
}
</style>