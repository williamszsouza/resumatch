<template>
  <div class="page">
    <div class="page-header">
      <p class="page-eyebrow">Conta</p>
      <h1 class="page-title">Configurações</h1>
    </div>

    <div class="settings-layout">
      <nav class="settings-nav">
        <RouterLink to="/settings/billing" class="settings-link" active-class="settings-link--active">
          💳 Assinatura
        </RouterLink>
        <RouterLink to="/settings/profile" class="settings-link" active-class="settings-link--active">
          👤 Perfil & Privacidade
        </RouterLink>
      </nav>
      <div class="settings-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page         { max-width: 860px; margin: 0 auto; padding: 3rem 2rem; }
.page-eyebrow { font-family: 'DM Mono', monospace; font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; color: var(--emerald); margin-bottom: .4rem; }
.page-title   { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; }
.page-header  { margin-bottom: 2rem; }
.settings-layout { display: grid; grid-template-columns: 180px 1fr; gap: 2rem; }
.settings-nav    { display: flex; flex-direction: column; gap: .25rem; }
.settings-link   { display: block; padding: .6rem .85rem; border-radius: var(--radius-sm); font-size: .875rem; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .15s; }
.settings-link:hover { background: var(--paper-mid); color: var(--ink); }
.settings-link--active { background: var(--emerald-pale); color: var(--emerald); }
@media (max-width: 640px) { .settings-layout { grid-template-columns: 1fr; } .settings-nav { flex-direction: row; } .page { padding: 1.5rem 1.25rem; } }
</style>
