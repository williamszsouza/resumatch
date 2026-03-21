<template>
  <div class="profile">
    <div class="section-header">
      <h2 class="section-title">Perfil & Privacidade</h2>
      <p class="section-sub">Gerencie suas informações pessoais e dados da conta.</p>
    </div>

    <!-- Profile form -->
    <div class="card">
      <h3 class="card-title">Informações da conta</h3>
      <AlertMessage :message="profileSuccess" type="success" />
      <AlertMessage :message="profileError"   type="error" />
      <div class="form-grid">
        <BaseInput id="name"    v-model="form.name"    label="Nome"    placeholder="Seu nome completo" />
        <BaseInput id="email"   v-model="form.email"   label="E-mail"  type="email" placeholder="voce@email.com" />
        <BaseInput id="company" v-model="form.company" label="Empresa" placeholder="Nome da empresa" />
      </div>
      <BaseButton variant="primary" :loading="savingProfile" style="margin-top:1.25rem" @click="saveProfile">
        Salvar alterações
      </BaseButton>
    </div>

    <!-- Password -->
    <div class="card">
      <h3 class="card-title">Alterar senha</h3>
      <AlertMessage :message="pwSuccess" type="success" />
      <AlertMessage :message="pwError"   type="error" />
      <div class="form-grid">
        <BaseInput id="current-pw" v-model="pwForm.current"  label="Senha atual"     type="password" placeholder="••••••••" />
        <BaseInput id="new-pw"     v-model="pwForm.newPw"    label="Nova senha"      type="password" placeholder="Mínimo 8 caracteres" />
        <BaseInput id="confirm-pw" v-model="pwForm.confirm"  label="Confirmar senha" type="password" placeholder="Repita a nova senha" />
      </div>
      <BaseButton variant="ghost" :loading="savingPw" style="margin-top:1.25rem" @click="savePassword">
        Alterar senha
      </BaseButton>
    </div>

    <!-- LGPD / Delete account -->
    <div class="card danger-zone">
      <div class="danger-header">
        <span class="danger-icon">⚠</span>
        <div>
          <h3 class="danger-title">Zona de privacidade</h3>
          <p class="danger-sub">Ações relacionadas aos seus dados pessoais (LGPD).</p>
        </div>
      </div>

      <div class="lgpd-actions">
        <div class="lgpd-row">
          <div>
            <p class="lgpd-action-title">Exportar meus dados</p>
            <p class="lgpd-action-desc">Baixe todos os seus dados em formato JSON.</p>
          </div>
          <BaseButton variant="ghost" @click="exportData">Exportar</BaseButton>
        </div>
        <div class="lgpd-divider" />
        <div class="lgpd-row">
          <div>
            <p class="lgpd-action-title delete-title">Excluir minha conta</p>
            <p class="lgpd-action-desc">Esta ação é permanente e todos os seus dados serão apagados.</p>
          </div>
          <BaseButton variant="danger" @click="showDeleteModal = true">Excluir conta</BaseButton>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <BaseModal v-model="showDeleteModal" title="Excluir conta" width="460px">
      <div class="delete-modal-body">
        <div class="delete-warning-icon">⚠</div>
        <p class="delete-modal-text">
          <strong>Esta ação é irreversível.</strong> Todos os seus dados, histórico de análises e assinatura serão permanentemente apagados.
        </p>
        <p class="delete-modal-confirm-label">Digite <strong>excluir</strong> para confirmar:</p>
        <BaseInput id="confirm-delete" v-model="deleteConfirmText" placeholder="excluir" :error="deleteError" />
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="showDeleteModal = false">Cancelar</BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="deleteAccount">Excluir permanentemente</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'
import BaseInput    from '@/components/ui/BaseInput.vue'
import BaseButton   from '@/components/ui/BaseButton.vue'
import BaseModal    from '@/components/ui/BaseModal.vue'
import AlertMessage from '@/components/ui/AlertMessage.vue'

const router = useRouter()
const auth   = useAuthStore()

const form = reactive({ name: auth.user?.name || '', email: auth.user?.email || '', company: auth.user?.company || '' })
const pwForm = reactive({ current: '', newPw: '', confirm: '' })

const savingProfile  = ref(false)
const profileSuccess = ref('')
const profileError   = ref('')

const savingPw  = ref(false)
const pwSuccess = ref('')
const pwError   = ref('')

const showDeleteModal   = ref(false)
const deleteConfirmText = ref('')
const deleteError       = ref('')
const deleting          = ref(false)

async function saveProfile() {
  savingProfile.value = true; profileSuccess.value = ''; profileError.value = ''
  try {
    await auth.updateProfile(form)
    profileSuccess.value = 'Perfil atualizado com sucesso!'
  } catch (e) {
    profileError.value = e.message
  } finally { savingProfile.value = false }
}

async function savePassword() {
  if (pwForm.newPw !== pwForm.confirm) { pwError.value = 'As senhas não coincidem.'; return }
  if (pwForm.newPw.length < 8) { pwError.value = 'A nova senha deve ter pelo menos 8 caracteres.'; return }
  savingPw.value = true; pwSuccess.value = ''; pwError.value = ''
  try {
    await api.patch(`/users/${auth.user.uuid}/password`, { current_password: pwForm.current, new_password: pwForm.newPw })
    pwSuccess.value = 'Senha alterada com sucesso!'
    pwForm.current = pwForm.newPw = pwForm.confirm = ''
  } catch (e) {
    pwError.value = e.message
  } finally { savingPw.value = false }
}

async function exportData() {
  try {
    const data = await api.get(`/users/${auth.user.uuid}/export`)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'meus-dados-resumatch.json'; a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    profileError.value = 'Erro ao exportar dados: ' + e.message
  }
}

async function deleteAccount() {
  if (deleteConfirmText.value.toLowerCase() !== 'excluir') {
    deleteError.value = 'Digite "excluir" para confirmar.'; return
  }
  deleting.value = true; deleteError.value = ''
  try {
    await auth.deleteAccount()
    router.push('/register')
  } catch (e) {
    deleteError.value = e.message
    deleting.value = false
  }
}
</script>

<style scoped>
.profile { display: flex; flex-direction: column; gap: 0; }
.section-header { margin-bottom: 1.5rem; }
.section-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
.section-sub    { color: var(--muted); font-size: 0.875rem; margin-top: 0.25rem; }
.card { background: rgba(255,255,255,0.55); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.25rem; }
.card-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; margin-bottom: 1.25rem; }
.form-grid { display: flex; flex-direction: column; gap: 1rem; }

.danger-zone { border-color: rgba(192,57,43,0.25); background: rgba(253,232,230,0.3); }
.danger-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
.danger-icon  { font-size: 1.1rem; padding-top: 2px; }
.danger-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: var(--crimson); }
.danger-sub   { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }

.lgpd-actions { display: flex; flex-direction: column; }
.lgpd-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 0.75rem 0; }
.lgpd-divider { height: 1px; background: rgba(192,57,43,0.15); margin: 0.25rem 0; }
.lgpd-action-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.2rem; }
.lgpd-action-desc  { font-size: 0.8rem; color: var(--muted); }
.delete-title { color: var(--crimson); }

.delete-modal-body      { display: flex; flex-direction: column; gap: 1rem; }
.delete-warning-icon    { font-size: 2rem; text-align: center; }
.delete-modal-text      { font-size: 0.9rem; line-height: 1.6; text-align: center; color: var(--ink); }
.delete-modal-confirm-label { font-size: 0.82rem; color: var(--muted); }
</style>
