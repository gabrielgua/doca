<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { BrandMarkIcon } from '@/theme/app-icons'

interface AppBrandMarkProps {
  isWordmarkVisible?: boolean
}

withDefaults(defineProps<AppBrandMarkProps>(), {
  isWordmarkVisible: true,
})
</script>

<template>
  <RouterLink
    :to="{ name: 'home' }"
    class="flex items-center gap-3 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    aria-label="Doca, ir para o início"
  >
    <span
      class="grid size-10 shrink-0 place-items-center rounded-control bg-brand-600 text-white shadow-brand"
    >
      <BaseIcon :icon="BrandMarkIcon" size="md" />
    </span>
    <span
      v-if="isWordmarkVisible"
      class="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
    >
      Doca
    </span>
  </RouterLink>
</template>
