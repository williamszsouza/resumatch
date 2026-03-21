import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  { path: '/login',      name: 'Login',      component: () => import('@/views/auth/LoginView.vue'),            meta: { guest: true } },
  { path: '/register',   name: 'Register',   component: () => import('@/views/auth/SignUpView.vue'),           meta: { guest: true } },
  { path: '/onboarding', name: 'Onboarding', component: () => import('@/views/onboarding/OnboardingView.vue'), meta: { requiresAuth: true } },
  { path: '/',           name: 'Dashboard',  component: () => import('@/views/DashboardView.vue'),             meta: { requiresAuth: true } },
  {
    path: '/settings',
    component: () => import('@/views/settings/SettingsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',        redirect: '/settings/profile' },
      { path: 'profile', name: 'SettingsProfile', component: () => import('@/views/settings/ProfileView.vue') },
      { path: 'billing', name: 'SettingsBilling', component: () => import('@/views/settings/BillingView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return auth.isOnboarded ? { path: '/' } : { name: 'Onboarding' }
  }

  if (auth.isLoggedIn && !auth.isOnboarded && to.name !== 'Onboarding') {
    return { name: 'Onboarding' }
  }
})

export default router