import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken, getRole } from '@/utils/storage'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: () => import('@/components/AppShell.vue'),
      redirect: '/archive',
      children: [
        // ---------- 管理端（5 Tab）----------
        {
          path: 'archive',
          name: 'Archive',
          component: () => import('@/views/archive/index.vue'),
          meta: { title: '园区档案', tab: 'archive', role: 'admin' },
        },
        {
          path: 'archive/park',
          name: 'ParkDetail',
          component: () => import('@/views/archive/park-detail.vue'),
          meta: { title: '园区档案', tab: 'archive', role: 'admin' },
        },
        {
          path: 'archive/park/files',
          name: 'ParkFiles',
          component: () => import('@/views/archive/park-files.vue'),
          meta: { title: '园区档案文件', tab: 'archive', role: 'admin' },
        },
        {
          path: 'archive/enterprise/:id',
          name: 'EnterpriseDetail',
          component: () => import('@/views/archive/enterprise-detail.vue'),
          meta: { title: '企业档案', tab: 'archive', role: 'admin' },
        },
        {
          path: 'operation',
          name: 'Operation',
          component: () => import('@/views/operation/index.vue'),
          meta: { title: '园区运营', tab: 'operation', role: 'admin' },
        },
        {
          path: 'environment',
          name: 'Environment',
          component: () => import('@/views/environment/index.vue'),
          meta: { title: '环保管理', tab: 'environment', role: 'admin' },
        },
        {
          path: 'environment/water',
          name: 'EnvironmentWater',
          component: () => import('@/views/environment/water.vue'),
          meta: { title: '水环境监测', tab: 'environment', role: 'admin' },
        },
        {
          path: 'environment/air',
          name: 'EnvironmentAir',
          component: () => import('@/views/environment/air.vue'),
          meta: { title: '大气环境监测', tab: 'environment', role: 'admin' },
        },
        {
          path: 'environment/waste',
          name: 'EnvironmentWaste',
          component: () => import('@/views/environment/waste.vue'),
          meta: { title: '固废处置', tab: 'environment', role: 'admin' },
        },
        {
          path: 'environment/source',
          name: 'EnvironmentSource',
          component: () => import('@/views/environment/source.vue'),
          meta: { title: '企业源头管控', tab: 'environment', role: 'admin' },
        },
        {
          path: 'service',
          name: 'Service',
          component: () => import('@/views/service/index.vue'),
          meta: { title: '企业服务', tab: 'service', role: 'admin' },
        },
        // ---------- 企业端（4 Tab）----------
        {
          path: 'enterprise/recruitment',
          name: 'EntRecruitment',
          component: () => import('@/views/enterprise/recruitment/index.vue'),
          meta: { title: '招工', tab: 'recruitment', role: 'enterprise' },
        },
        {
          path: 'enterprise/bills',
          name: 'EntBills',
          component: () => import('@/views/enterprise/bills/index.vue'),
          meta: { title: '我的账单', tab: 'bills', role: 'enterprise' },
        },
        {
          path: 'enterprise/contract',
          name: 'EntContract',
          component: () => import('@/views/enterprise/contract/index.vue'),
          meta: { title: '合同', tab: 'contract', role: 'enterprise' },
        },
        {
          path: 'enterprise/archive',
          name: 'EntArchive',
          component: () => import('@/views/enterprise/archive/index.vue'),
          meta: { title: '企业档案', tab: 'archive', role: 'enterprise' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/archive',
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || import.meta.env.VITE_APP_TITLE}`
  const token = getToken()
  const role = getRole()

  if (to.name === 'Login') {
    if (token) {
      return role === 'enterprise' ? '/enterprise/recruitment' : '/archive'
    }
    return true
  }
  if (!token) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  // 角色隔离：企业端不能进管理端路由，反之亦然
  if (to.meta.role && to.meta.role !== role) {
    return role === 'enterprise' ? '/enterprise/recruitment' : '/archive'
  }
  return true
})

export default router
