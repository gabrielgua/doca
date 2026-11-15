<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface GallerySectionProps {
  title: string
  description: string
}

defineProps<GallerySectionProps>()
</script>

<template>
  <section class="flex flex-col gap-4">
    <div>
      <BaseHeading :level="2" size="section">{{ title }}</BaseHeading>
      <BaseText size="sm" tone="subtle">{{ description }}</BaseText>
    </div>
    <slot />
  </section>
</template>
