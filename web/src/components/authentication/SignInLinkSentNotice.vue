<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { MagicLinkIcon } from '@/theme/app-icons'

interface SignInLinkSentNoticeProps {
  email: string
}

defineProps<SignInLinkSentNoticeProps>()

const emit = defineEmits<{
  useAnotherEmail: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 text-center" role="status">
    <BaseIconCircle :icon="MagicLinkIcon" variant="success" class="animate-icon-pop" />
    <BaseHeading :level="1" size="subtitle">Link enviado</BaseHeading>
    <BaseText size="sm" tone="muted" class="text-pretty">
      Mandamos um link de acesso para <strong>{{ email }}</strong
      >. Abra o email neste mesmo navegador para entrar.
    </BaseText>
    <BaseButton variant="neutral" appearance="ghost" size="sm" @click="emit('useAnotherEmail')">
      Usar outro email
    </BaseButton>
  </div>
</template>
