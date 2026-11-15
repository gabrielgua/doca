<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ControlSize } from '@/theme/component-sizes'

export type AvatarTone = 'soft' | 'solid'

interface BaseAvatarProps {
  name: string
  imageUrl?: string
  size?: ControlSize
  tone?: AvatarTone
}

const props = withDefaults(defineProps<BaseAvatarProps>(), {
  imageUrl: undefined,
  size: 'md',
  tone: 'soft',
})

const sizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

const toneClassesByTone: Record<AvatarTone, string> = {
  soft: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  solid: 'bg-brand-600 text-white shadow-brand dark:bg-brand-500',
}

const hasImageFailedToLoad = ref(false)
const shouldShowImage = computed(() => props.imageUrl !== undefined && !hasImageFailedToLoad.value)
const initials = computed(() =>
  props.name
    .split(' ')
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join(''),
)

watch(
  () => props.imageUrl,
  () => {
    hasImageFailedToLoad.value = false
  },
)

function handleImageLoadError() {
  hasImageFailedToLoad.value = true
}
</script>

<template>
  <span
    class="grid shrink-0 place-items-center overflow-hidden rounded-full font-bold"
    :class="[sizeClassesBySize[size], toneClassesByTone[tone]]"
  >
    <img
      v-if="shouldShowImage"
      :src="imageUrl"
      :alt="name"
      class="size-full object-cover"
      referrerpolicy="no-referrer"
      @error="handleImageLoadError"
    />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>
