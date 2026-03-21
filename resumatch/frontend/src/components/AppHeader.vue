<template>
  <header class="header">
    <div class="logo">
      <span class="logo-mark">ResuMatch<span class="logo-dot" /></span>
      <span class="logo-tagline">ATS Intelligence</span>
    </div>
    <span class="header-badge">v1.0 · Beta</span>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 3rem;
  border-bottom: 1px solid var(--border);
  background: var(--paper);
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.logo-mark {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.logo-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--emerald-bright);
  margin-left: 2px;
  margin-bottom: 8px;
  vertical-align: bottom;
}

.logo-tagline {
  font-size: 0.7rem;
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
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .header { padding: 1rem 1.25rem; }
  .logo-tagline { display: none; }
}
</style>
