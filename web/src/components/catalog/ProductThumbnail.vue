<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { ProductIcon } from '@/theme/app-icons'
</script>

<template>
  <span
    class="grid size-11 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-600 transition-bouncy group-hover:scale-110 group-hover:-rotate-6 dark:bg-brand-950 dark:text-brand-300"
  >
    <BaseIcon :icon="ProductIcon" size="md" />
  </span>
</template>
