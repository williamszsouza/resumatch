<template>
  <div class="profile-page">
    <h2 class="page-title">Perfil</h2>

    <!-- Profile form -->
    <section class="section-card">
      <p class="section-label">Informações pessoais</p>

      <AlertBanner :message="feedback.message" :type="feedback.type" @dismiss="feedback.message = ''" />

      <form class="profile-form" @submit.prevent="saveProfile">
        <BaseInput v-model="form.name"  label="Nome completo" placeholder="Seu nome" />
        <BaseInput v-model="form.email" label="E-mail" type="email" placeholder="voce@empresa.com" />
        <BaseInput v-model="form.company_name" label="Empresa" placeholder="Nome da empresa (opcional)" />

        <div class="form-actions">
          <BaseButton type="submit" :loading="saving">Salvar alterações</BaseButton>
        </div>
      </form>
    </section>

    <!-- Privacy / LGPD -->
    <section class="section-card danger-zone">
      <div class="danger-header">
        <div>
          <p class="section-label danger-label">Zona de privacidade</p>
          <h3 class="danger-title">Excluir minha conta</h3>
          <p class="danger-desc">
            Ao excluir sua conta, todos os seus dados pessoais, histórico de análises e informações de pagamento serão permanentemente removidos do nosso sistema. Esta ação é irreversível e está em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>.
          </p>
        </div>
      </div>
      <BaseButton variant="danger" size="sm" @click="showDeleteModal = true">
        🗑 Excluir minha conta
      </BaseButton>
    </section>

    <!-- Delete confirmation modal -->
    <BaseModal :open="showDeleteModal" title="Excluir conta permanentemente" @close="showDeleteModal = false">
      <div class="delete-modal-body">
        <div class="warning-icon">⚠</div>
        <p class="warning-title">Esta ação é irreversível</p>
        <p class="warning-desc">
          Tem certeza? Todos os seus dados serão <strong>permanentemente apagados</strong>: perfil, histórico de análises, assinatura e faturas. Não será possível recuperar nada após a confirmação.
        </p>
        <div class="confirm-field">
          <label class="field-label-sm">
            Digite <strong>excluir</strong> para confirmar:
          </label>
          <BaseInput v-model="deleteConfirm" placeholder="excluir" />
        </div>
      </div>
      <AlertBanner :message="auth.error" type="error" @dismiss="auth.error = ''" />
      <template #footer>
        <BaseButton variant="ghost" @click="showDeleteModal = false">Cancelar</BaseButton>
        <BaseButton
          variant="danger"
          :disabled="deleteConfirm.toLowerCase() !== 'excluir'"
          :loading="auth.loading"
          @click="doDelete"
        >
          Excluir permanentemente
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { updateProfile } from '@/services/api.js'
import BaseInput   from '@/components/ui/BaseInput.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import BaseModal   from '@/components/ui/BaseModal.vue'
import AlertBanner from '@/components/ui/AlertBanner.vue'

const auth   = useAuthStore()
const router = useRouter()

const form   = reactive({ name: '', email: '', company_name: '' })
const saving = ref(false)
const feedback = reactive({ message: '', type: 'success' })

const showDeleteModal = ref(false)
const deleteConfirm   = ref('')

onMounted(() => {
  if (auth.user) {
    form.name    = auth.user.name    || ''
    form.email   = auth.user.email   || ''
    form.company_name = auth.user.company_name || ''

  }
})

async function saveProfile() {
  saving.value = true
  feedback.message = ''
  try {
    const updated = await updateProfile(auth.user.uuid,form)
    auth.user = { ...auth.user, ...updated }
    feedback.type    = 'success'
    feedback.message = 'Perfil atualizado com sucesso!'
  } catch (e) {
    feedback.type    = 'error'
    feedback.message = e.message
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  const ok = await auth.doDeleteAccount()
  if (ok) router.push('/signup')
}
</script>

<style scoped>
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.section-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  background: rgba(255,255,255,0.5);
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 1.25rem; display: block;
}

.profile-form { display: flex; flex-direction: column; gap: 1rem; }
.form-actions { margin-top: 0.5rem; }

/* Danger zone */
.danger-zone {
  border-color: rgba(192, 57, 43, 0.25);
  background: rgba(253, 232, 230, 0.3);
}
.danger-label { color: var(--crimson); }
.danger-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.danger-desc {
  font-size: 0.875rem; color: var(--muted);
  line-height: 1.65; margin-bottom: 1.25rem; max-width: 520px;
}

/* Delete modal */
.delete-modal-body { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.warning-icon { font-size: 2.5rem; }
.warning-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--crimson); }
.warning-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.65; max-width: 340px; }
.confirm-field { width: 100%; text-align: left; }
.field-label-sm { display: block; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.4rem; }
</style>
