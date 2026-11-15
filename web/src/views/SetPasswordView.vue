<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import AppBrandMark from '@/components/layout/AppBrandMark.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeError } from '@/services/describe-error'
import { updateOwnAccount } from '@/services/profiles-service'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useToastStore } from '@/stores/toast-store'
import { PasswordIcon, UserIcon } from '@/theme/app-icons'

const MINIMUM_PASSWORD_LENGTH = 8

const router = useRouter()
const currentUserStore = useCurrentUserStore()
const toastStore = useToastStore()

const fullName = ref(currentUserStore.profile?.fullName ?? '')
const password = ref('')
const passwordConfirmation = ref('')
const isSaving = ref(false)
const errorMessage = ref<string>()

async function handleSetPasswordSubmit() {
  if (password.value.length < MINIMUM_PASSWORD_LENGTH) {
    errorMessage.value = `A senha precisa ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`
    return
  }
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As duas senhas não são iguais.'
    return
  }
  isSaving.value = true
  errorMessage.value = undefined
  try {
    const trimmedName = fullName.value.trim()
    await updateOwnAccount({ fullName: trimmedName, password: password.value })
    currentUserStore.renameLocally(trimmedName)
    toastStore.showToast({
      title: 'Tudo pronto',
      description: 'Bem-vindo à Doca!',
      tone: 'success',
    })
    router.replace({ name: 'home' })
  } catch (saveError) {
    errorMessage.value = describeError(saveError, 'Não foi possível salvar a senha.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 py-10">
    <div class="flex w-full max-w-sm flex-col items-center gap-6">
      <div class="animate-pop-in">
        <AppBrandMark />
      </div>
      <BaseCard as="section" padding="lg" class="w-full animate-rise-in delay-100">
        <div class="mb-6 text-center">
          <BaseHeading :level="1" size="subtitle">Boas-vindas à Doca</BaseHeading>
          <BaseText size="sm" tone="muted" class="mt-1">
            Diga como quer ser chamado e crie a sua senha para os próximos acessos.
          </BaseText>
        </div>
        <form @submit.prevent="handleSetPasswordSubmit">
          <StaggeredTransitionGroup
            class="flex flex-col gap-4"
            :delay-between-items-in-milliseconds="60"
            :initial-delay-in-milliseconds="220"
          >
            <BaseInput
              key="name"
              v-model="fullName"
              :data-stagger-index="0"
              label="Seu nome"
              autocomplete="name"
              :leading-icon="UserIcon"
              is-required
            />
            <BaseInput
              key="password"
              v-model="password"
              :data-stagger-index="1"
              label="Senha"
              type="password"
              autocomplete="new-password"
              :hint="`Pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`"
              :leading-icon="PasswordIcon"
              is-required
            />
            <BaseInput
              key="password-confirmation"
              v-model="passwordConfirmation"
              :data-stagger-index="2"
              label="Repita a senha"
              type="password"
              autocomplete="new-password"
              :leading-icon="PasswordIcon"
              is-required
            />
            <BaseText
              v-if="errorMessage"
              :key="errorMessage"
              :data-stagger-index="0"
              size="sm"
              tone="danger"
              weight="medium"
              role="alert"
            >
              {{ errorMessage }}
            </BaseText>
            <BaseButton
              key="save"
              :data-stagger-index="3"
              type="submit"
              :is-loading="isSaving"
              is-full-width
            >
              Salvar e entrar
            </BaseButton>
          </StaggeredTransitionGroup>
        </form>
      </BaseCard>
    </div>
  </main>
</template>
