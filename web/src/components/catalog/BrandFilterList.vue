<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import { useCatalogStore } from '@/stores/catalog-store'
import { AddIcon } from '@/theme/app-icons'
import { ALL_BRANDS_FILTER } from './catalog-filters'

interface BrandFilterListProps {
  canEdit?: boolean
}

withDefaults(defineProps<BrandFilterListProps>(), {
  canEdit: false,
})

const emit = defineEmits<{
  newBrandRequested: []
}>()

const selectedBrandId = defineModel<string>({ default: 'all' })

const catalogStore = useCatalogStore()

const brandOptions = computed(() => [
  { id: ALL_BRANDS_FILTER, name: 'Todas as marcas', count: catalogStore.products.length },
  ...catalogStore.brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    count: catalogStore.productCountByBrandId[brand.id] ?? 0,
  })),
])
</script>

<template>
  <BaseCard as="aside" class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <BaseHeading :level="2" size="section">Marcas</BaseHeading>
      <BaseButton
        v-if="canEdit"
        size="sm"
        appearance="ghost"
        :leading-icon="AddIcon"
        @click="emit('newBrandRequested')"
      >
        Marca
      </BaseButton>
    </div>

    <StaggeredTransitionGroup class="flex flex-col gap-1" direction="right">
      <button
        v-for="(brandOption, brandPosition) in brandOptions"
        :key="brandOption.id"
        :data-stagger-index="brandPosition"
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-semibold transition-bouncy focus-visible:outline-2 focus-visible:outline-brand-500 active:scale-97"
        :class="
          selectedBrandId === brandOption.id
            ? 'bg-brand-600 text-white shadow-brand dark:bg-brand-500'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
        "
        :aria-pressed="selectedBrandId === brandOption.id"
        @click="selectedBrandId = brandOption.id"
      >
        <span class="min-w-0 flex-1 truncate">{{ brandOption.name }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-caption font-bold"
          :class="
            selectedBrandId === brandOption.id
              ? 'bg-white/25'
              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
          "
        >
          {{ brandOption.count }}
        </span>
      </button>
    </StaggeredTransitionGroup>
  </BaseCard>
</template>
