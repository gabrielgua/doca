<script setup lang="ts">
import CompanyStatTile from '@/components/access/CompanyStatTile.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatCnpj, type Company, type CompanyAccessSummary } from '@/services/companies-service'
import { AccessIcon, BreadcrumbSeparatorIcon, CatalogIcon, ProductIcon } from '@/theme/app-icons'
import CompanyAvatar from './CompanyAvatar.vue'

interface CompanyCardProps {
  company: Company
  summary?: CompanyAccessSummary
}

withDefaults(defineProps<CompanyCardProps>(), {
  summary: undefined,
})

const emit = defineEmits<{
  openRequested: []
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full cursor-pointer flex-col gap-5 rounded-card bg-white p-5 text-left shadow-card transition-bouncy hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-99 sm:p-6 dark:bg-neutral-900"
    :aria-label="`Abrir ${company.name}`"
    @click="emit('openRequested')"
  >
    <span class="flex w-full items-center gap-4">
      <CompanyAvatar
        :name="company.name"
        :color="company.color"
        size="lg"
        class="transition-bouncy group-hover:scale-110 group-hover:-rotate-6"
      />
      <span class="min-w-0 flex-1">
        <BaseText as="span" size="subtitle" weight="extrabold" class="block truncate">
          {{ company.name }}
        </BaseText>
        <BaseText as="span" size="sm" tone="subtle" class="block truncate">
          {{ company.cnpj ? `CNPJ ${formatCnpj(company.cnpj)}` : 'CNPJ não informado' }}
        </BaseText>
      </span>
      <span
        class="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition-bouncy group-hover:translate-x-1 group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-neutral-800 dark:group-hover:bg-brand-950"
      >
        <BaseIcon :icon="BreadcrumbSeparatorIcon" size="sm" />
      </span>
    </span>

    <span class="grid w-full grid-cols-3 gap-2">
      <CompanyStatTile
        :icon="AccessIcon"
        label="pessoas"
        :value="summary?.members.length ?? null"
      />
      <CompanyStatTile :icon="CatalogIcon" label="marcas" :value="summary?.brandCount ?? null" />
      <CompanyStatTile
        :icon="ProductIcon"
        label="produtos"
        :value="summary?.productCount ?? null"
      />
    </span>
  </button>
</template>
