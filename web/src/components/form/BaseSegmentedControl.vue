<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'

export interface SegmentedOption {
  value: string
  label: string
  icon: AppIcon
}

interface BaseSegmentedControlProps {
  options: SegmentedOption[]
  accessibleLabel: string
}

const props = defineProps<BaseSegmentedControlProps>()

const selectedValue = defineModel<string>({ required: true })

const selectedPosition = computed(() =>
  Math.max(
    props.options.findIndex((option) => option.value === selectedValue.value),
    0,
  ),
)
const indicatorStyle = computed(() => ({
  width: `calc((100% - 0.5rem) / ${props.options.length})`,
  transform: `translateX(${selectedPosition.value * 100}%)`,
}))
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="accessibleLabel"
    class="relative inline-flex rounded-full bg-white p-1 shadow-card dark:bg-neutral-900"
  >
    <span
      class="absolute inset-y-1 left-1 rounded-full bg-brand-600 shadow-brand transition-bouncy dark:bg-brand-500"
      :style="indicatorStyle"
      aria-hidden="true"
    />
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === selectedValue"
      class="relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-bouncy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95"
      :class="
        option.value === selectedValue
          ? 'text-white'
          : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
      "
      @click="selectedValue = option.value"
    >
      <BaseIcon :icon="option.icon" size="sm" />
      {{ option.label }}
    </button>
  </div>
</template>
