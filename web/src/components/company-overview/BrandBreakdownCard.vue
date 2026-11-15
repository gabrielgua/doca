<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/card/BaseCard.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { BrandBreakdown } from '@/composables/use-company-overview'

interface BrandBreakdownCardProps {
  brandBreakdowns: BrandBreakdown[]
}

const props = defineProps<BrandBreakdownCardProps>()

const largestProductCount = computed(() =>
  Math.max(1, ...props.brandBreakdowns.map((breakdown) => breakdown.productCount)),
)

function readBarWidth(productCount: number): string {
  return `${(productCount / largestProductCount.value) * 100}%`
}
</script>

<template>
  <BaseCard as="section" class="flex flex-col gap-4">
    <BaseHeading :level="2" size="section">Marcas</BaseHeading>
    <BaseText v-if="brandBreakdowns.length === 0" size="sm" tone="muted">
      Nenhuma marca cadastrada ainda.
    </BaseText>
    <StaggeredTransitionGroup v-else tag="ul" class="flex flex-col gap-3">
      <li
        v-for="(breakdown, breakdownPosition) in brandBreakdowns"
        :key="breakdown.brand.id"
        :data-stagger-index="breakdownPosition"
        class="flex flex-col gap-1.5"
      >
        <div class="flex items-baseline justify-between gap-3">
          <BaseText size="sm" weight="bold" class="truncate">{{ breakdown.brand.name }}</BaseText>
          <BaseText as="span" size="caption" tone="subtle" weight="semibold" class="shrink-0">
            {{ breakdown.productCount }}
            {{ breakdown.productCount === 1 ? 'produto' : 'produtos' }}
            <template v-if="breakdown.productsWithoutLabelCount > 0">
              · {{ breakdown.productsWithoutLabelCount }} sem etiqueta
            </template>
          </BaseText>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            class="h-full origin-left animate-bar-grow rounded-full bg-brand-500"
            :style="{ width: readBarWidth(breakdown.productCount) }"
          />
        </div>
      </li>
    </StaggeredTransitionGroup>
  </BaseCard>
</template>
