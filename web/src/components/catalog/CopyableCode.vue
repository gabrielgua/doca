<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { CopyIcon, SelectedIcon } from '@/theme/app-icons'

interface CopyableCodeProps {
  code: string
  accessibleName: string
}

const props = defineProps<CopyableCodeProps>()

const COPIED_FEEDBACK_MILLISECONDS = 1600

const { copy, copied } = useClipboard({ copiedDuring: COPIED_FEEDBACK_MILLISECONDS, legacy: true })

function handleCopyClick() {
  copy(props.code)
}
</script>

<template>
  <button
    type="button"
    class="group -mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-0.5 font-mono text-sm font-semibold transition duration-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500 active:scale-95 dark:hover:bg-brand-950 dark:hover:text-brand-300"
    :aria-label="copied ? `${accessibleName} copiado` : `Copiar ${accessibleName} ${code}`"
    @click="handleCopyClick"
  >
    {{ code }}
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-bounce"
      enter-from-class="scale-50 opacity-0"
      leave-active-class="transition duration-100"
      leave-to-class="scale-50 opacity-0"
    >
      <BaseIcon v-if="copied" :icon="SelectedIcon" size="xs" class="text-success-600" />
      <BaseIcon
        v-else
        :icon="CopyIcon"
        size="xs"
        class="text-neutral-400 group-hover:text-brand-600"
      />
    </Transition>
  </button>
</template>
