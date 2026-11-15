<script setup lang="ts">
import type { AppIcon } from '@/theme/app-icons'
import EmptyState from './EmptyState.vue'

interface ComingInPhaseNoticeProps {
  icon: AppIcon
  title: string
  description: string
  phaseNumber: number
}

defineProps<ComingInPhaseNoticeProps>()
</script>

<template>
  <EmptyState :icon="icon" :title="title" :description="description">
    <span
      class="rounded-full bg-accent-50 px-3 py-1 text-caption font-bold text-accent-600 dark:bg-accent-950 dark:text-accent-500"
    >
      Chega na fase {{ phaseNumber }}
    </span>
  </EmptyState>
</template>
