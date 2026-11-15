<script setup lang="ts">
import BaseCard from '@/components/card/BaseCard.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/table/BaseDataTable.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Product } from '@/services/catalog-service'
import CopyableCode from './CopyableCode.vue'
import ProductActionButtons from './ProductActionButtons.vue'
import ProductLabelCell from './ProductLabelCell.vue'
import ProductThumbnail from './ProductThumbnail.vue'

interface ProductTableProps {
  products: Product[]
  findBrandName: (brandId: string) => string
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<ProductTableProps>(), {
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  editRequested: [product: Product]
  deleteRequested: [product: Product]
}>()

const LABEL_READY_SORT_VALUE = 1
const LABEL_MISSING_SORT_VALUE = 0

const PRODUCT_COLUMNS: DataTableColumn<Product>[] = [
  { key: 'name', label: 'Produto', sortValue: (product) => product.name },
  {
    key: 'brand',
    label: 'Marca',
    sortValue: (product) => props.findBrandName(product.brandId),
    widthClass: 'w-36',
  },
  {
    key: 'fnsku',
    label: 'FNSKU',
    sortValue: (product) => product.fnsku ?? '',
    widthClass: 'w-36',
  },
  { key: 'sku', label: 'SKU', sortValue: (product) => product.sku ?? '', widthClass: 'w-32' },
  {
    key: 'label',
    label: 'Etiqueta',
    sortValue: (product) =>
      product.fnskuLabelPath ? LABEL_READY_SORT_VALUE : LABEL_MISSING_SORT_VALUE,
    widthClass: 'w-48',
  },
  { key: 'actions', label: 'Ações', isLabelHidden: true, alignment: 'end', widthClass: 'w-24' },
]
</script>

<template>
  <BaseCard padding="none" class="overflow-hidden">
    <BaseDataTable
      :rows="products"
      :columns="PRODUCT_COLUMNS"
      :row-key="(product) => product.id"
      :initial-sort="{ columnKey: 'name', direction: 'ascending' }"
      caption="Produtos"
    >
      <template #cell-name="{ row: product }">
        <div class="flex min-w-0 items-center gap-3">
          <ProductThumbnail />
          <BaseText as="span" weight="bold" class="min-w-0">{{ product.name }}</BaseText>
        </div>
      </template>
      <template #cell-brand="{ row: product }">
        <BaseText as="span" size="sm" tone="muted" weight="semibold">
          {{ findBrandName(product.brandId) }}
        </BaseText>
      </template>
      <template #cell-fnsku="{ row: product }">
        <CopyableCode v-if="product.fnsku" :code="product.fnsku" accessible-name="FNSKU" />
        <span v-else class="text-neutral-400">—</span>
      </template>
      <template #cell-sku="{ row: product }">
        <CopyableCode v-if="product.sku" :code="product.sku" accessible-name="SKU" />
        <span v-else class="text-neutral-400">—</span>
      </template>
      <template #cell-label="{ row: product }">
        <ProductLabelCell :product="product" :can-edit="canEdit" />
      </template>
      <template #cell-actions="{ row: product }">
        <ProductActionButtons
          :product-name="product.name"
          :can-edit="canEdit"
          :can-delete="canDelete"
          class="justify-end"
          @edit-requested="emit('editRequested', product)"
          @delete-requested="emit('deleteRequested', product)"
        />
      </template>
    </BaseDataTable>
  </BaseCard>
</template>
