<script setup lang="ts">
export type CardPadding = 'none' | 'md' | 'lg'

export type CardElement = 'div' | 'section' | 'article' | 'aside'

interface BaseCardProps {
  as?: CardElement
  padding?: CardPadding
}

withDefaults(defineProps<BaseCardProps>(), {
  as: 'div',
  padding: 'md',
})

const paddingClassesByPadding: Record<CardPadding, string> = {
  none: '',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}
</script>

<template>
  <component
    :is="as"
    class="rounded-card bg-white shadow-card dark:bg-neutral-900"
    :class="paddingClassesByPadding[padding]"
  >
    <slot />
  </component>
</template>
