<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <span class="logo-mark">ResuMatch<span class="logo-dot" /></span>
      </div>

      <h1 class="auth-title">Crie sua conta</h1>
      <p class="auth-sub">Comece grátis. Sem cartão de crédito.</p>

      <AlertBanner :message="auth.error" type="error" @dismiss="auth.error = ''" />

      <form class="auth-form" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.name"
          label="Nome completo"
          placeholder="Seu nome"
          :error-msg="errors.name"
        >
          <template #icon>👤</template>
        </BaseInput>

        <BaseInput
          v-model="form.email"
          label="E-mail"
          type="email"
          placeholder="voce@empresa.com"
          :error-msg="errors.email"
        >
          <template #icon>✉</template>
        </BaseInput>

        <BaseInput
          v-model="form.password"
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          :error-msg="errors.password"
        >
          <template #icon>🔒</template>
        </BaseInput>

        <BaseButton type="submit" size="lg" :loading="auth.loading" style="width:100%; margin-top:0.5rem;">
          Criar conta
        </BaseButton>
      </form>

      <!-- Divider -->
      <div class="divider"><span>ou continue com</span></div>

      <!-- Social -->
      <div class="social-row">
        <button class="social-btn" type="button" @click="socialLogin('google')">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button class="social-btn" type="button" @click="socialLogin('github')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          GitHub
        </button>
      </div>

      <p class="auth-footer">
        Já tem conta?
        <RouterLink to="/login">Fazer login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import BaseInput   from '@/components/ui/BaseInput.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import AlertBanner from '@/components/ui/AlertBanner.vue'

const router = useRouter()
const auth   = useAuthStore()

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })

function validate() {
  errors.name     = form.name.trim()     ? '' : 'Informe seu nome.'
  errors.email    = /\S+@\S+\.\S+/.test(form.email) ? '' : 'E-mail inválido.'
  errors.password = form.password.length >= 8 ? '' : 'Mínimo 8 caracteres.'
  return !errors.name && !errors.email && !errors.password
}

async function onSubmit() {
  if (!validate()) return
  const ok = await auth.doRegister(form.name, form.email, form.password)
  if (ok) router.push('/onboarding')
}

function socialLogin(provider) {
  // Redirect to OAuth flow — adjust URL to your backend
  window.location.href = `/api/auth/${provider}`
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255,255,255,0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
}

.auth-logo { margin-bottom: 2rem; }

.logo-mark {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
}

.logo-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--emerald-bright);
  margin-left: 2px;
  vertical-align: middle;
  margin-bottom: 4px;
}

.auth-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.auth-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }

.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  color: var(--muted);
  font-size: 0.78rem;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.social-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  color: var(--ink);
}
.social-btn:hover { border-color: var(--ink); background: var(--paper-mid); }

.auth-footer { text-align: center; font-size: 0.85rem; color: var(--muted); }
.auth-footer a { color: var(--emerald); font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
</style>
