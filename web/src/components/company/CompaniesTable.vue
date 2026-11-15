<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import AnimatedNumber from '@/components/motion/AnimatedNumber.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/table/BaseDataTable.vue'
import BaseText from '@/components/typography/BaseText.vue'
import {
  formatCnpj,
  type Company,
  type CompanyAccessSummary,
  type CompanyMember,
} from '@/services/companies-service'
import { BreadcrumbSeparatorIcon } from '@/theme/app-icons'
import CompanyAvatar from './CompanyAvatar.vue'

interface CompaniesTableProps {
  companies: Company[]
  readSummary: (companyId: string) => CompanyAccessSummary | undefined
}

const props = defineProps<CompaniesTableProps>()

const emit = defineEmits<{
  openRequested: [company: Company]
}>()

const VISIBLE_AVATAR_COUNT = 3

const COMPANY_COLUMNS: DataTableColumn<Company>[] = [
  { key: 'name', label: 'Empresa', sortValue: (company) => company.name },
  {
    key: 'cnpj',
    label: 'CNPJ',
    sortValue: (company) => company.cnpj ?? '',
    widthClass: 'w-48',
  },
  {
    key: 'people',
    label: 'Pessoas',
    sortValue: (company) => props.readSummary(company.id)?.members.length ?? 0,
    widthClass: 'w-44',
  },
  {
    key: 'brands',
    label: 'Marcas',
    sortValue: (company) => props.readSummary(company.id)?.brandCount ?? 0,
    alignment: 'end',
    widthClass: 'w-28',
  },
  {
    key: 'products',
    label: 'Produtos',
    sortValue: (company) => props.readSummary(company.id)?.productCount ?? 0,
    alignment: 'end',
    widthClass: 'w-28',
  },
  { key: 'open', label: 'Abrir', isLabelHidden: true, alignment: 'end', widthClass: 'w-16' },
]

function readMemberName(member: CompanyMember): string {
  return member.fullName ?? member.email?.split('@')[0] ?? 'Convidado'
}
</script>

<template>
  <BaseCard padding="none" class="overflow-hidden">
    <BaseDataTable
      :rows="companies"
      :columns="COMPANY_COLUMNS"
      :row-key="(company) => company.id"
      :initial-sort="{ columnKey: 'name', direction: 'ascending' }"
      caption="Empresas"
    >
      <template #cell-name="{ row: company }">
        <button
          type="button"
          class="flex min-w-0 cursor-pointer items-center gap-3 rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          @click="emit('openRequested', company)"
        >
          <CompanyAvatar
            :name="company.name"
            :color="company.color"
            size="sm"
            class="transition-bouncy group-hover:scale-110 group-hover:-rotate-6"
          />
          <BaseText
            as="span"
            weight="extrabold"
            class="truncate transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300"
          >
            {{ company.name }}
          </BaseText>
        </button>
      </template>

      <template #cell-cnpj="{ row: company }">
        <span v-if="company.cnpj" class="font-mono text-neutral-600 dark:text-neutral-300">
          {{ formatCnpj(company.cnpj) }}
        </span>
        <span v-else class="text-neutral-400">—</span>
      </template>

      <template #cell-people="{ row: company }">
        <div class="flex items-center gap-2">
          <span v-if="readSummary(company.id)?.members.length" class="flex">
            <BaseAvatar
              v-for="(member, memberPosition) in readSummary(company.id)?.members.slice(
                0,
                VISIBLE_AVATAR_COUNT,
              )"
              :key="member.userId"
              :name="readMemberName(member)"
              size="sm"
              class="ring-2 ring-white dark:ring-neutral-900"
              :class="{ '-ml-2': memberPosition > 0 }"
            />
          </span>
          <span class="font-semibold text-neutral-600 tabular-nums dark:text-neutral-300">
            <AnimatedNumber
              v-if="readSummary(company.id)"
              :value="readSummary(company.id)?.members.length ?? 0"
            />
            <span v-else>–</span>
          </span>
        </div>
      </template>

      <template #cell-brands="{ row: company }">
        <span class="font-semibold text-neutral-600 tabular-nums dark:text-neutral-300">
          <AnimatedNumber
            v-if="readSummary(company.id)"
            :value="readSummary(company.id)?.brandCount ?? 0"
          />
          <span v-else>–</span>
        </span>
      </template>

      <template #cell-products="{ row: company }">
        <span class="font-semibold text-neutral-600 tabular-nums dark:text-neutral-300">
          <AnimatedNumber
            v-if="readSummary(company.id)"
            :value="readSummary(company.id)?.productCount ?? 0"
          />
          <span v-else>–</span>
        </span>
      </template>

      <template #cell-open="{ row: company }">
        <button
          type="button"
          class="ml-auto grid size-8 cursor-pointer place-items-center rounded-full text-neutral-400 transition-bouncy group-hover:translate-x-1 group-hover:bg-brand-50 group-hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:group-hover:bg-brand-950"
          :aria-label="`Abrir ${company.name}`"
          @click="emit('openRequested', company)"
        >
          <BaseIcon :icon="BreadcrumbSeparatorIcon" size="sm" />
        </button>
      </template>
    </BaseDataTable>
  </BaseCard>
</template>
