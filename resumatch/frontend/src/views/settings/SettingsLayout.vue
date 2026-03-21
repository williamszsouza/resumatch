<template>
  <div>
    <AppHeader :show-nav="true" />
    <div class="settings-wrap">

      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <p class="sidebar-title">Configurações</p>
        <nav class="sidebar-nav">
          <RouterLink to="/settings/profile" class="nav-item">
            <span class="nav-icon">👤</span> Perfil
          </RouterLink>
          <RouterLink to="/settings/billing" class="nav-item">
            <span class="nav-icon">💳</span> Assinatura & Faturas
          </RouterLink>
        </nav>
      </aside>

      <!-- Content -->
      <main class="settings-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
.settings-wrap {
  display: grid;
  grid-template-columns: 220px 1fr;
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
  gap: 3rem;
  min-height: calc(100vh - 65px);
}

.sidebar-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.75rem;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--paper-mid); color: var(--ink); }
.nav-item.router-link-active { background: var(--paper-mid); color: var(--ink); }

.nav-icon { font-size: 0.95rem; }

@media (max-width: 640px) {
  .settings-wrap { grid-template-columns: 1fr; padding: 1.5rem 1.25rem; gap: 1.5rem; }
  .sidebar-nav { flex-direction: row; flex-wrap: wrap; }
}
</style>
