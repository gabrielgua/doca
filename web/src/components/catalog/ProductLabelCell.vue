<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { useProductLabel } from '@/composables/use-product-label'
import type { Product } from '@/services/catalog-service'
import {
  BarcodeIcon,
  DownloadIcon,
  UploadIcon,
  ViewDocumentIcon,
  WarningIcon,
} from '@/theme/app-icons'

interface ProductLabelCellProps {
  product: Product
  canEdit?: boolean
}

const props = withDefaults(defineProps<ProductLabelCellProps>(), {
  canEdit: false,
})

const { isDownloadingLabel, isUploadingLabel, chooseNewLabel, viewLabel, downloadLabel } =
  useProductLabel(() => props.product)
</script>

<template>
  <div class="flex items-center gap-1">
    <span
      v-if="product.fnskuLabelPath"
      class="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-caption font-bold whitespace-nowrap text-success-700 dark:bg-success-950 dark:text-success-300"
    >
      <BaseIcon :icon="BarcodeIcon" size="xs" />
      Pronta
    </span>
    <span
      v-else
      class="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-2.5 py-1 text-caption font-bold whitespace-nowrap text-warning-800 dark:bg-warning-950 dark:text-warning-300"
    >
      <BaseIcon :icon="WarningIcon" size="xs" />
      Sem etiqueta
    </span>
    <BaseIconButton
      v-if="product.fnskuLabelPath"
      :icon="ViewDocumentIcon"
      :accessible-label="`Ver etiqueta de ${product.name}`"
      variant="success"
      appearance="ghost"
      size="sm"
      @click="viewLabel"
    />
    <BaseIconButton
      v-if="product.fnskuLabelPath"
      :icon="DownloadIcon"
      :accessible-label="`Baixar etiqueta de ${product.name}`"
      variant="success"
      appearance="ghost"
      size="sm"
      :is-loading="isDownloadingLabel"
      @click="downloadLabel"
    />
    <BaseIconButton
      v-if="canEdit"
      :icon="UploadIcon"
      :accessible-label="
        product.fnskuLabelPath
          ? `Trocar etiqueta de ${product.name}`
          : `Enviar etiqueta de ${product.name}`
      "
      variant="neutral"
      appearance="ghost"
      size="sm"
      :is-loading="isUploadingLabel"
      @click="chooseNewLabel"
    />
  </div>
</template>
