<template>
  <div class="shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-name">ResuMatch<span class="brand-dot" /></span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item" exact-active-class="nav-item--active">
          <span class="nav-icon">⚡</span> Dashboard
        </RouterLink>
        <RouterLink to="/settings/billing" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">💳</span> Assinatura
        </RouterLink>
        <RouterLink to="/settings/profile" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">👤</span> Perfil
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-pill">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <p class="user-name">{{ auth.user?.name }}</p>
            <p class="user-email">{{ auth.user?.email }}</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">Sair</button>
      </div>
    </aside>

    <!-- Main -->
    <main class="shell-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const auth   = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const n = auth.user?.name || ''
  return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.shell { display: flex; min-height: 100vh; }

.sidebar {
  width: 240px; flex-shrink: 0; display: flex; flex-direction: column;
  border-right: 1px solid var(--border); padding: 1.75rem 1.25rem;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}

.sidebar-brand { margin-bottom: 2.5rem; padding: 0 .5rem; }
.brand-name { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; }
.brand-dot  { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--emerald-bright); margin-left: 2px; vertical-align: super; }

.sidebar-nav { display: flex; flex-direction: column; gap: .25rem; flex: 1; }

.nav-item {
  display: flex; align-items: center; gap: .75rem; padding: .65rem .85rem;
  border-radius: var(--radius-sm); font-size: .875rem; font-weight: 500; color: var(--muted);
  text-decoration: none; transition: all .15s;
}
.nav-item:hover { background: var(--paper-mid); color: var(--ink); }
.nav-item--active { background: var(--emerald-pale); color: var(--emerald); }
.nav-icon { font-size: .9rem; }

.sidebar-footer { border-top: 1px solid var(--border); padding-top: 1rem; }
.user-pill { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--emerald-pale); color: var(--emerald); font-size: .7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name  { font-size: .8rem; font-weight: 600; line-height: 1.2; }
.user-email { font-size: .7rem; color: var(--muted); }
.logout-btn { width: 100%; padding: .5rem; background: transparent; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: 'Instrument Sans', sans-serif; font-size: .78rem; color: var(--muted); cursor: pointer; transition: all .2s; }
.logout-btn:hover { border-color: var(--crimson); color: var(--crimson); }

.shell-main { flex: 1; overflow-y: auto; }

@media (max-width: 768px) {
  .shell { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; gap: .5rem; padding: 1rem; }
  .sidebar-brand, .sidebar-footer { flex: 1 0 100%; }
  .sidebar-nav { flex-direction: row; }
}
</style>
