<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import CompanyAvatar from '@/components/company/CompanyAvatar.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatCnpj, type Company } from '@/services/companies-service'
import { BreadcrumbSeparatorIcon, EditIcon } from '@/theme/app-icons'

interface CompanyOverviewHeroProps {
  company: Company
  canEditCompany?: boolean
}

withDefaults(defineProps<CompanyOverviewHeroProps>(), {
  canEditCompany: false,
})

const emit = defineEmits<{
  editRequested: []
  catalogRequested: []
}>()
</script>

<template>
  <BaseCard as="section" class="flex flex-wrap items-center gap-5">
    <CompanyAvatar
      :name="company.name"
      :color="company.color"
      size="lg"
      class="animate-pop-in transition-bouncy hover:scale-110 hover:-rotate-6"
    />
    <div class="min-w-0 flex-1">
      <BaseText size="caption" tone="subtle" weight="extrabold" class="uppercase">Empresa</BaseText>
      <BaseText size="subtitle" weight="extrabold" class="truncate">{{ company.name }}</BaseText>
      <BaseText size="sm" tone="subtle">
        {{ company.cnpj ? `CNPJ ${formatCnpj(company.cnpj)}` : 'CNPJ não informado' }}
      </BaseText>
    </div>
    <div class="flex flex-wrap gap-2">
      <BaseButton
        v-if="canEditCompany"
        variant="neutral"
        appearance="outlined"
        :leading-icon="EditIcon"
        @click="emit('editRequested')"
      >
        Editar empresa
      </BaseButton>
      <BaseButton :trailing-icon="BreadcrumbSeparatorIcon" @click="emit('catalogRequested')">
        Ver catálogo
      </BaseButton>
    </div>
  </BaseCard>
</template>
