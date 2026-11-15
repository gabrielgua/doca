<script setup lang="ts">
import { computed } from 'vue'
import type { CompanyColor } from '@/theme/company-colors'
import type { ControlSize } from '@/theme/component-sizes'

interface CompanyAvatarProps {
  name: string
  color: CompanyColor
  size?: ControlSize
}

const props = withDefaults(defineProps<CompanyAvatarProps>(), {
  size: 'md',
})

const colorClassesByColor: Record<CompanyColor, string> = {
  sky: 'bg-sky-600 dark:bg-sky-500',
  emerald: 'bg-emerald-600 dark:bg-emerald-500',
  violet: 'bg-violet-600 dark:bg-violet-500',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-600 dark:bg-rose-500',
  indigo: 'bg-indigo-600 dark:bg-indigo-500',
  teal: 'bg-teal-600 dark:bg-teal-500',
  orange: 'bg-orange-600 dark:bg-orange-500',
}

const sizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-8 rounded-xl text-sm',
  md: 'size-10 rounded-control text-base',
  lg: 'size-12 rounded-tile text-lg',
}

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())
</script>

<template>
  <span
    class="grid shrink-0 place-items-center font-extrabold text-white dark:text-neutral-950"
    :class="[colorClassesByColor[color], sizeClassesBySize[size]]"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>
