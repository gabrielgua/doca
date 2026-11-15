<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import AnimatedNumber from '@/components/motion/AnimatedNumber.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

export type StatTileTone = 'neutral' | 'warning' | 'success'

interface CompanyStatTileProps {
  icon: AppIcon
  label: string
  value: number | null
  tone?: StatTileTone
  surface?: 'muted' | 'card'
}

withDefaults(defineProps<CompanyStatTileProps>(), {
  tone: 'neutral',
  surface: 'muted',
})

const iconClassesByTone: Record<StatTileTone, string> = {
  neutral: 'bg-white text-brand-600 dark:bg-neutral-900 dark:text-brand-400',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
}

const surfaceClassesBySurface = {
  muted: 'bg-neutral-100 dark:bg-neutral-800',
  card: 'bg-white shadow-card dark:bg-neutral-900',
}
</script>

<template>
  <div
    class="group flex items-center gap-3 rounded-tile p-3 transition-bouncy hover:-translate-y-0.5"
    :class="surfaceClassesBySurface[surface]"
  >
    <span
      class="grid size-9 shrink-0 place-items-center rounded-xl shadow-xs transition-bouncy group-hover:scale-110 group-hover:-rotate-6"
      :class="iconClassesByTone[tone]"
    >
      <BaseIcon :icon="icon" size="sm" />
    </span>
    <div class="min-w-0 leading-tight">
      <BaseText as="span" size="lg" weight="extrabold" class="block">
        <AnimatedNumber v-if="value !== null" :value="value" />
        <span v-else class="text-neutral-300 dark:text-neutral-600">–</span>
      </BaseText>
      <BaseText as="span" size="caption" tone="subtle" weight="semibold" class="block">
        {{ label }}
      </BaseText>
    </div>
  </div>
</template>
