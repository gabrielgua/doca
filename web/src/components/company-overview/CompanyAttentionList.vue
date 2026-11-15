<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Product } from '@/services/catalog-service'
import type { Company, CompanyMember } from '@/services/companies-service'
import { BarcodeIcon, CompanyIcon, SuccessIcon, AccessIcon, type AppIcon } from '@/theme/app-icons'

interface CompanyAttentionListProps {
  company: Company
  members?: CompanyMember[]
  brandCount: number
  productsWithoutLabel: Product[]
  productsWithoutFnsku: Product[]
}

const props = withDefaults(defineProps<CompanyAttentionListProps>(), {
  members: undefined,
})

interface AttentionItem {
  key: string
  icon: AppIcon
  title: string
  description: string
}

const MAXIMUM_LISTED_PRODUCT_NAMES = 3

function listProductNames(products: Product[]): string {
  const listedNames = products.slice(0, MAXIMUM_LISTED_PRODUCT_NAMES).map((product) => product.name)
  const hiddenCount = products.length - listedNames.length
  return hiddenCount > 0
    ? `${listedNames.join(', ')} e mais ${hiddenCount}`
    : listedNames.join(', ')
}

const attentionItems = computed<AttentionItem[]>(() => {
  const items: AttentionItem[] = []
  if (props.members && props.members.length === 0) {
    items.push({
      key: 'no-members',
      icon: AccessIcon,
      title: 'Ninguém da empresa tem acesso',
      description: 'Vincule um gerente ou cliente para a empresa acompanhar os envios.',
    })
  }
  if (props.productsWithoutLabel.length > 0) {
    items.push({
      key: 'missing-labels',
      icon: BarcodeIcon,
      title: `${props.productsWithoutLabel.length} sem etiqueta FNSKU`,
      description: listProductNames(props.productsWithoutLabel),
    })
  }
  if (props.productsWithoutFnsku.length > 0) {
    items.push({
      key: 'missing-fnsku',
      icon: BarcodeIcon,
      title: `${props.productsWithoutFnsku.length} sem FNSKU cadastrado`,
      description: listProductNames(props.productsWithoutFnsku),
    })
  }
  if (props.brandCount === 0) {
    items.push({
      key: 'no-brands',
      icon: CompanyIcon,
      title: 'Nenhuma marca cadastrada',
      description: 'Sem marca não dá para cadastrar produtos nem registrar envios.',
    })
  }
  if (!props.company.cnpj) {
    items.push({
      key: 'no-cnpj',
      icon: CompanyIcon,
      title: 'CNPJ não informado',
      description: 'Ajuda a conferir as notas de remessa. Dá para incluir em Editar empresa.',
    })
  }
  return items
})
</script>

<template>
  <BaseCard as="section" class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <BaseHeading :level="2" size="section">Precisa de atenção</BaseHeading>
      <span
        v-if="attentionItems.length > 0"
        class="rounded-full bg-warning-100 px-2.5 py-0.5 text-caption font-bold text-warning-800 dark:bg-warning-950 dark:text-warning-300"
      >
        {{ attentionItems.length }}
      </span>
    </div>
    <div
      v-if="attentionItems.length === 0"
      class="flex items-center gap-3 rounded-tile bg-success-50 p-4 dark:bg-success-950"
    >
      <BaseIcon
        :icon="SuccessIcon"
        size="md"
        class="animate-icon-pop text-success-600 dark:text-success-400"
      />
      <BaseText size="sm" weight="semibold" class="text-success-700 dark:text-success-300">
        Tudo em ordem por aqui.
      </BaseText>
    </div>
    <StaggeredTransitionGroup v-else tag="ul" class="flex flex-col gap-2">
      <li
        v-for="(attentionItem, itemPosition) in attentionItems"
        :key="attentionItem.key"
        :data-stagger-index="itemPosition"
        class="flex items-start gap-3 rounded-tile bg-warning-50 p-3 dark:bg-warning-950"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-warning-700 dark:bg-neutral-900 dark:text-warning-300"
        >
          <BaseIcon :icon="attentionItem.icon" size="sm" />
        </span>
        <div class="min-w-0">
          <BaseText size="sm" weight="bold">{{ attentionItem.title }}</BaseText>
          <BaseText size="caption" tone="muted">{{ attentionItem.description }}</BaseText>
        </div>
      </li>
    </StaggeredTransitionGroup>
  </BaseCard>
</template>
