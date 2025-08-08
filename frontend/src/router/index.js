import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import MonitoringCenter from '../views/MonitoringCenter.vue'
import DeviceManagement from '../views/DeviceManagement.vue'
import DeviceMap from '../views/DeviceMap.vue'
import CloudConfiguration from '../views/CloudConfiguration.vue'
import Triggers from '../views/Triggers.vue'
import ScheduledTasks from '../views/ScheduledTasks.vue'
import RealTimeComputing from '../views/RealTimeComputing.vue'
import DataAnalysis from '../views/DataAnalysis.vue'
import DataDownload from '../views/DataDownload.vue'
import AIReports from '../views/AIReports.vue'
import EdgeComputing from '../views/EdgeComputing.vue'
import TrafficCard from '../views/TrafficCard.vue'
import UserCenter from '../views/UserCenter.vue'

const routes = [
  {
    path: '/',
    redirect: '/monitoring-center'
  },
  {
    path: '/monitoring-center',
    name: 'MonitoringCenter',
    component: MonitoringCenter,
    meta: { 
      title: '监控中心',
      label: '监控中心', 
      icon: 'monitoring-center' 
    }
  },
  {
    path: '/device-management',
    name: 'DeviceManagement',
    component: DeviceManagement,
    meta: { 
      title: '设备管理',
      label: '设备管理', 
      icon: 'device-management' 
    }
  },
  {
    path: '/device-map',
    name: 'DeviceMap',
    component: DeviceMap,
    meta: { 
      title: '设备地图',
      label: '设备地图', 
      icon: 'device-map' 
    }
  },
  {
    path: '/cloud-configuration',
    name: 'CloudConfiguration',
    component: CloudConfiguration,
    meta: { 
      title: '云组态',
      label: '云组态', 
      icon: 'cloud-configuration' 
    }
  },
  {
    path: '/triggers',
    name: 'Triggers',
    component: Triggers,
    meta: { 
      title: '触发器',
      label: '触发器', 
      icon: 'triggers' 
    }
  },
  {
    path: '/scheduled-tasks',
    name: 'ScheduledTasks',
    component: ScheduledTasks,
    meta: { 
      title: '定时任务',
      label: '定时任务', 
      icon: 'scheduled-tasks' 
    }
  },
  {
    path: '/real-time-computing',
    name: 'RealTimeComputing',
    component: RealTimeComputing,
    meta: { 
      title: '实时计算',
      label: '实时计算', 
      icon: 'real-time-computing' 
    }
  },
  {
    path: '/data-analysis',
    name: 'DataAnalysis',
    component: DataAnalysis,
    meta: { 
      title: '数据分析',
      label: '数据分析', 
      icon: 'data-analysis' 
    }
  },
  {
    path: '/data-download',
    name: 'DataDownload',
    component: DataDownload,
    meta: { 
      title: '数据下载',
      label: '数据下载', 
      icon: 'data-download' 
    }
  },
  {
    path: '/ai-reports',
    name: 'AIReports',
    component: AIReports,
    meta: { 
      title: 'AI报表',
      label: 'AI报表', 
      icon: 'ai-reports' 
    }
  },
  {
    path: '/edge-computing',
    name: 'EdgeComputing',
    component: EdgeComputing,
    meta: { 
      title: '边缘计算',
      label: '边缘计算', 
      icon: 'edge-computing' 
    }
  },
  {
    path: '/traffic-card',
    name: 'TrafficCard',
    component: TrafficCard,
    meta: { 
      title: '流量卡',
      label: '流量卡', 
      icon: 'traffic-card' 
    }
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: UserCenter,
    meta: { 
      title: '用户中心',
      label: '用户中心', 
      icon: 'user-center' 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：动态更新页面标题
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title}`
  } else {
    document.title = 'IoT管理系统'
  }
  next()
})

export default router 