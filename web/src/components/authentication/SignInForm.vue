<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeSignInError } from '@/services/describe-sign-in-error'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { EmailIcon, MagicLinkIcon, PasswordIcon } from '@/theme/app-icons'
import SignInLinkSentNotice from './SignInLinkSentNotice.vue'

const emit = defineEmits<{
  signedIn: []
}>()

const authenticationStore = useAuthenticationStore()

const email = ref('')
const password = ref('')
const isSigningIn = ref(false)
const isSendingLink = ref(false)
const errorMessage = ref<string>()
const linkSentToEmail = defineModel<string | undefined>('linkSentToEmail')

const trimmedEmail = computed(() => email.value.trim())
const isBusy = computed(() => isSigningIn.value || isSendingLink.value)

async function handleSignInSubmit() {
  isSigningIn.value = true
  errorMessage.value = undefined
  try {
    await authenticationStore.signInWithPassword(trimmedEmail.value, password.value)
    emit('signedIn')
  } catch (signInError) {
    errorMessage.value = describeSignInError(signInError)
  } finally {
    isSigningIn.value = false
  }
}

async function handleSendLinkClick() {
  if (!trimmedEmail.value) {
    errorMessage.value = 'Digite o seu email para receber o link de acesso.'
    return
  }
  isSendingLink.value = true
  errorMessage.value = undefined
  try {
    await authenticationStore.sendSignInLink(trimmedEmail.value)
    linkSentToEmail.value = trimmedEmail.value
  } catch (sendError) {
    errorMessage.value = describeSignInError(sendError)
  } finally {
    isSendingLink.value = false
  }
}

function handleUseAnotherEmailClick() {
  linkSentToEmail.value = undefined
}
</script>

<template>
  <Transition
    mode="out-in"
    enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
    enter-from-class="translate-y-3 scale-95 opacity-0"
    leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
    leave-to-class="scale-95 opacity-0"
  >
    <SignInLinkSentNotice
      v-if="linkSentToEmail"
      :email="linkSentToEmail"
      @use-another-email="handleUseAnotherEmailClick"
    />
    <form v-else @submit.prevent="handleSignInSubmit">
      <StaggeredTransitionGroup
        class="flex flex-col gap-4"
        :delay-between-items-in-milliseconds="60"
        :initial-delay-in-milliseconds="220"
      >
        <BaseInput
          key="email"
          v-model="email"
          :data-stagger-index="0"
          label="Email"
          type="email"
          autocomplete="email"
          placeholder="voce@empresa.com"
          :leading-icon="EmailIcon"
          is-required
        />
        <BaseInput
          key="password"
          v-model="password"
          :data-stagger-index="1"
          label="Senha"
          type="password"
          autocomplete="current-password"
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
          key="sign-in"
          :data-stagger-index="2"
          type="submit"
          :is-loading="isSigningIn"
          :is-disabled="isBusy"
          is-full-width
        >
          Entrar
        </BaseButton>
        <div
          key="divider"
          :data-stagger-index="3"
          class="flex items-center gap-3"
          aria-hidden="true"
        >
          <span class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <BaseText as="span" size="caption" tone="subtle" weight="semibold">ou</BaseText>
          <span class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <BaseButton
          key="sign-in-link"
          :data-stagger-index="4"
          variant="neutral"
          appearance="outlined"
          :leading-icon="MagicLinkIcon"
          :is-loading="isSendingLink"
          :is-disabled="isBusy"
          is-full-width
          @click="handleSendLinkClick"
        >
          Receber link de acesso por email
        </BaseButton>
      </StaggeredTransitionGroup>
    </form>
  </Transition>
</template>
