<script setup lang="ts">
import BaseCard from '@/components/card/BaseCard.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

interface EmptyStateProps {
  icon: AppIcon
  title: string
  description: string
}

defineProps<EmptyStateProps>()
</script>

<template>
  <BaseCard padding="lg" class="py-12">
    <StaggeredTransitionGroup
      class="flex flex-col items-center gap-3 text-center"
      :delay-between-items-in-milliseconds="70"
      :initial-delay-in-milliseconds="120"
    >
      <span key="icon" :data-stagger-index="0" class="animate-float">
        <BaseIconCircle :icon="icon" />
      </span>
      <BaseHeading key="title" :data-stagger-index="1" :level="2" size="section">
        {{ title }}
      </BaseHeading>
      <BaseText key="description" :data-stagger-index="2" tone="muted" class="max-w-md text-pretty">
        {{ description }}
      </BaseText>
      <div key="actions" :data-stagger-index="3">
        <slot />
      </div>
    </StaggeredTransitionGroup>
  </BaseCard>
</template>
