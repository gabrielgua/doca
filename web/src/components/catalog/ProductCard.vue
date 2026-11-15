<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useProductLabel } from '@/composables/use-product-label'
import type { Product } from '@/services/catalog-service'
import {
  BarcodeIcon,
  DownloadIcon,
  UploadIcon,
  ViewDocumentIcon,
  WarningIcon,
} from '@/theme/app-icons'
import CopyableCode from './CopyableCode.vue'
import ProductActionButtons from './ProductActionButtons.vue'
import ProductThumbnail from './ProductThumbnail.vue'

interface ProductCardProps {
  product: Product
  brandName: string
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  editRequested: []
  deleteRequested: []
}>()

const { isDownloadingLabel, isUploadingLabel, chooseNewLabel, viewLabel, downloadLabel } =
  useProductLabel(() => props.product)
</script>

<template>
  <BaseCard
    as="article"
    padding="none"
    class="group flex flex-col gap-4 p-5 transition-bouncy hover:-translate-y-1 hover:shadow-lift"
  >
    <header class="flex items-start gap-3">
      <ProductThumbnail />
      <div class="min-w-0 flex-1">
        <BaseHeading :level="3" size="section" class="leading-snug text-balance">
          {{ product.name }}
        </BaseHeading>
        <BaseText size="caption" tone="subtle" weight="semibold">{{ brandName }}</BaseText>
      </div>
      <ProductActionButtons
        :product-name="product.name"
        :can-edit="canEdit"
        :can-delete="canDelete"
        @edit-requested="emit('editRequested')"
        @delete-requested="emit('deleteRequested')"
      />
    </header>

    <dl class="grid grid-cols-2 gap-2">
      <div class="rounded-tile bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
        <dt class="text-caption font-extrabold tracking-wider text-neutral-400 uppercase">FNSKU</dt>
        <dd>
          <CopyableCode v-if="product.fnsku" :code="product.fnsku" accessible-name="FNSKU" />
          <span v-else class="text-sm text-neutral-400">não cadastrado</span>
        </dd>
      </div>
      <div class="rounded-tile bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
        <dt class="text-caption font-extrabold tracking-wider text-neutral-400 uppercase">SKU</dt>
        <dd>
          <CopyableCode v-if="product.sku" :code="product.sku" accessible-name="SKU" />
          <span v-else class="text-sm text-neutral-400">—</span>
        </dd>
      </div>
    </dl>

    <div
      v-if="product.fnskuLabelPath"
      class="flex items-center gap-3 rounded-tile bg-success-50 px-3 py-2 dark:bg-success-950"
    >
      <BaseIcon :icon="BarcodeIcon" size="sm" class="text-success-700 dark:text-success-300" />
      <button
        type="button"
        class="flex-1 cursor-pointer rounded-lg text-left text-sm font-semibold text-success-700 transition-colors hover:text-success-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-500 dark:text-success-300 dark:hover:text-success-200"
        @click="viewLabel"
      >
        Etiqueta pronta
      </button>
      <BaseIconButton
        v-if="canEdit"
        :icon="UploadIcon"
        accessible-label="Trocar etiqueta"
        variant="neutral"
        appearance="ghost"
        size="sm"
        :is-loading="isUploadingLabel"
        @click="chooseNewLabel"
      />
      <BaseIconButton
        :icon="ViewDocumentIcon"
        accessible-label="Ver etiqueta"
        variant="success"
        appearance="ghost"
        size="sm"
        @click="viewLabel"
      />
      <BaseIconButton
        :icon="DownloadIcon"
        accessible-label="Baixar etiqueta"
        variant="success"
        appearance="ghost"
        size="sm"
        :is-loading="isDownloadingLabel"
        @click="downloadLabel"
      />
    </div>
    <div
      v-else
      class="flex items-center gap-3 rounded-tile bg-warning-50 px-3 py-2 dark:bg-warning-950"
    >
      <BaseIcon :icon="WarningIcon" size="sm" class="text-warning-700 dark:text-warning-300" />
      <BaseText size="sm" weight="semibold" class="flex-1 text-warning-800 dark:text-warning-300">
        Sem etiqueta FNSKU
      </BaseText>
      <BaseButton
        v-if="canEdit"
        variant="warning"
        appearance="ghost"
        size="sm"
        :leading-icon="UploadIcon"
        :is-loading="isUploadingLabel"
        @click="chooseNewLabel"
      >
        Enviar
      </BaseButton>
    </div>
  </BaseCard>
</template>
