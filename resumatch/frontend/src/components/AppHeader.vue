<template>
  <header class="header">
    <RouterLink to="/" class="logo">
      <span class="logo-mark">ResuMatch<span class="logo-dot" /></span>
      <span class="logo-tagline">ATS Intelligence</span>
    </RouterLink>

    <nav v-if="showNav && auth.isLoggedIn" class="header-nav">
      <RouterLink to="/" class="nav-link">Análise</RouterLink>
      <RouterLink to="/settings/billing" class="nav-link">Assinatura</RouterLink>
      <RouterLink to="/settings/profile" class="nav-link">Perfil</RouterLink>
      <button class="btn-logout" @click="logout">Sair</button>
    </nav>

    <span v-else class="header-badge">v1.0 · Beta</span>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

defineProps({
  showNav: { type: Boolean, default: false }
})

const auth   = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 3rem;
  border-bottom: 1px solid var(--border);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.logo-mark {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.logo-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--emerald-bright);
  margin-left: 2px;
  vertical-align: bottom;
  margin-bottom: 5px;
}

.logo-tagline {
  font-size: 0.68rem;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
}

.header-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--muted);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover { background: var(--paper-mid); color: var(--ink); }
.nav-link.router-link-active { color: var(--ink); background: var(--paper-mid); }

.btn-logout {
  margin-left: 0.5rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.875rem;
  color: var(--muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.btn-logout:hover { border-color: var(--ink); color: var(--ink); }

@media (max-width: 640px) {
  .header { padding: 1rem 1.25rem; }
  .logo-tagline { display: none; }
  .nav-link { padding: 0.4rem 0.6rem; font-size: 0.8rem; }
}
</style>
