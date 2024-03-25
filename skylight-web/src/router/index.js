// Composables
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
      {
        path: 'welcome',
        name: 'Welcome',
        component: () => import('@/views/Welcome.vue'),
      }
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/views/Welcome.vue'),
  },
  {
    path: '/dashboard/server/new',
    name: 'NewServer',
    component: () => import('@/components/dashboard/containers/compute/NewServer.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    children: [
      {
        path: 'home',
        component: () => import('@/components/dashboard/containers/overview/HomePage.vue'),
      },
      {
        path: 'hypervisor',
        component: () => import('@/components/dashboard/containers/overview/HypervisorPage.vue'),
      },
      {
        path: 'hypervisor/tenantUsage',
        component: () => import('@/components/dashboard/containers/overview/TenantUsage.vue'),
      },
      {
        path: 'server',
        component: () => import('@/components/dashboard/containers/compute/ServerPage.vue'),
      },
      {
        path: 'server/new',
        component: () => import('@/components/dashboard/containers/compute/NewServer.vue'),
      },
      {
        path: 'server/:id',
        component: () => import('@/components/dashboard/containers/compute/ServerInfoPage.vue'),
      },
      {
        path: 'compute',
        component: () => import('@/components/dashboard/containers/compute/ComputePage.vue'),
      },
      {
        path: 'storage',
        component: () => import('@/components/dashboard/containers/storage/StoragePage.vue'),
      },
      {
        path: 'image',
        component: () => import('@/components/dashboard/containers/image/ImagePage.vue'),
      },
      {
        path: 'networking',
        component: () => import('@/components/dashboard/containers/networking/NetPage.vue'),
      },
      {
        path: 'endpoint',
        component: () => import('@/components/dashboard/containers/identity/EndpointPage.vue'),
      },
      {
        path: 'project',
        component: () => import('@/components/dashboard/containers/identity/ProjectPage.vue'),
      },
      {
        path: 'domain',
        component: () => import('@/components/dashboard/containers/identity/DomainPage.vue'),
      },
    ]
  },
  {
    path: '/config.json',
    name: 'ConfigJson',
    component: () => import('/config.json?url'),
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

export default router
