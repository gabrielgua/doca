<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SignInForm from '@/components/authentication/SignInForm.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import AppBrandMark from '@/components/layout/AppBrandMark.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'

const route = useRoute()
const router = useRouter()

const linkSentToEmail = ref<string>()

function readReturnPath(): string {
  const returnPath = route.query.redirect
  return typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : '/'
}

function handleSignedIn() {
  router.replace(readReturnPath())
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 py-10">
    <div class="flex w-full max-w-sm flex-col items-center gap-6">
      <div class="animate-pop-in">
        <AppBrandMark />
      </div>
      <BaseCard as="section" padding="lg" class="w-full animate-rise-in delay-100">
        <Transition
          enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
          enter-from-class="-translate-y-2 opacity-0"
          leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
          leave-to-class="opacity-0"
        >
          <div v-if="!linkSentToEmail" class="mb-6 text-center">
            <BaseHeading :level="1" size="subtitle">Entrar na Doca</BaseHeading>
            <BaseText size="sm" tone="muted" class="mt-1">
              O acesso é por convite. Use o email em que você recebeu o convite.
            </BaseText>
          </div>
        </Transition>
        <SignInForm v-model:link-sent-to-email="linkSentToEmail" @signed-in="handleSignedIn" />
      </BaseCard>
    </div>
  </main>
</template>
