<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { TransitionPresets, usePreferredReducedMotion, useTransition } from '@vueuse/core'

interface AnimatedNumberProps {
  value: number
}

const props = defineProps<AnimatedNumberProps>()

const COUNT_DURATION_MILLISECONDS = 900

const preferredMotion = usePreferredReducedMotion()
const targetValue = ref(0)

const animatedValue = useTransition(targetValue, {
  duration: COUNT_DURATION_MILLISECONDS,
  transition: TransitionPresets.easeOutBack,
  disabled: computed(() => preferredMotion.value === 'reduce'),
})

const shownValue = computed(() =>
  Math.max(0, Math.round(animatedValue.value)).toLocaleString('pt-BR'),
)

onMounted(() => {
  targetValue.value = props.value
})

watch(
  () => props.value,
  (nextValue) => {
    targetValue.value = nextValue
  },
)
</script>

<template>
  <span class="tabular-nums">{{ shownValue }}</span>
</template>
