<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseFileDrop from '@/components/form/BaseFileDrop.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Product } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useCatalogStore } from '@/stores/catalog-store'
import { useToastStore } from '@/stores/toast-store'

interface ProductFormDialogProps {
  editedProduct?: Product | null
}

const props = withDefaults(defineProps<ProductFormDialogProps>(), {
  editedProduct: null,
})

const isOpen = defineModel<boolean>('open', { default: false })

const AMAZON_CODE_PATTERN = /^[A-Z0-9]{10}$/
const PDF_MIME_TYPES = ['application/pdf']

const catalogStore = useCatalogStore()
const toastStore = useToastStore()

const productName = ref('')
const brandId = ref('')
const sku = ref('')
const asin = ref('')
const fnsku = ref('')
const labelFile = ref<File | null>(null)
const isSaving = ref(false)
const errorMessage = ref<string>()

const brandOptions = computed(() =>
  catalogStore.brands.map((brand) => ({ value: brand.id, label: brand.name })),
)
const dialogTitle = computed(() => (props.editedProduct ? 'Editar produto' : 'Novo produto'))
const normalizedAsin = computed(() => asin.value.trim().toUpperCase())
const normalizedFnsku = computed(() => fnsku.value.trim().toUpperCase())
const isAsinInvalid = computed(
  () => normalizedAsin.value.length > 0 && !AMAZON_CODE_PATTERN.test(normalizedAsin.value),
)
const isFnskuInvalid = computed(
  () => normalizedFnsku.value.length > 0 && !AMAZON_CODE_PATTERN.test(normalizedFnsku.value),
)
const currentLabelName = computed(() =>
  props.editedProduct?.fnskuLabelPath ? 'Etiqueta já cadastrada' : undefined,
)

watch(isOpen, (isNowOpen) => {
  if (!isNowOpen) {
    return
  }
  productName.value = props.editedProduct?.name ?? ''
  brandId.value = props.editedProduct?.brandId ?? catalogStore.brands[0]?.id ?? ''
  sku.value = props.editedProduct?.sku ?? ''
  asin.value = props.editedProduct?.asin ?? ''
  fnsku.value = props.editedProduct?.fnsku ?? ''
  labelFile.value = null
  errorMessage.value = undefined
})

function readOptionalText(rawText: string): string | null {
  return rawText.trim() || null
}

async function handleSaveSubmit() {
  if (isAsinInvalid.value || isFnskuInvalid.value) {
    return
  }
  isSaving.value = true
  errorMessage.value = undefined
  try {
    const savedProduct = await catalogStore.saveProduct(
      {
        brandId: brandId.value,
        name: productName.value.trim(),
        sku: readOptionalText(sku.value),
        asin: readOptionalText(normalizedAsin.value),
        fnsku: readOptionalText(normalizedFnsku.value),
      },
      labelFile.value,
      props.editedProduct?.id,
    )
    toastStore.showToast({
      title: props.editedProduct ? 'Produto atualizado' : 'Produto criado',
      description: savedProduct.name,
      tone: 'success',
    })
    isOpen.value = false
  } catch (saveError) {
    errorMessage.value = describeError(saveError, 'Não foi possível salvar o produto.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" :title="dialogTitle" width="wide" :is-close-blocked="isSaving">
    <form id="product-form" @submit.prevent="handleSaveSubmit">
      <StaggeredTransitionGroup
        class="grid gap-4 sm:grid-cols-2"
        :delay-between-items-in-milliseconds="40"
        :initial-delay-in-milliseconds="80"
      >
        <BaseInput
          key="name"
          v-model="productName"
          :data-stagger-index="0"
          label="Nome"
          placeholder="Ex.: Tri-Magnésio 60 cápsulas"
          is-required
          class="sm:col-span-2"
        />
        <BaseSelect
          key="brand"
          v-model="brandId"
          :data-stagger-index="1"
          label="Marca"
          :options="brandOptions"
          placeholder="Escolha a marca"
          is-required
        />
        <BaseInput
          key="fnsku"
          v-model="fnsku"
          :data-stagger-index="2"
          label="FNSKU"
          mask="amazon-code"
          hint="O código da etiqueta da Amazon."
          :status="isFnskuInvalid ? 'danger' : 'default'"
          :status-message="isFnskuInvalid ? 'O FNSKU tem 10 letras e números.' : undefined"
        />
        <BaseInput
          key="sku"
          v-model="sku"
          :data-stagger-index="3"
          label="SKU"
          placeholder="Opcional"
        />
        <BaseInput
          key="asin"
          v-model="asin"
          :data-stagger-index="4"
          label="ASIN"
          mask="amazon-code"
          placeholder="Opcional"
          :status="isAsinInvalid ? 'danger' : 'default'"
          :status-message="isAsinInvalid ? 'O ASIN tem 10 letras e números.' : undefined"
        />
        <BaseFileDrop
          key="label"
          v-model="labelFile"
          :data-stagger-index="5"
          label="Etiqueta FNSKU (PDF)"
          hint="O PDF que você imprime para colar no produto."
          :accepted-mime-types="PDF_MIME_TYPES"
          :current-file-name="currentLabelName"
          class="sm:col-span-2"
        />
        <BaseText
          v-if="errorMessage"
          :key="errorMessage"
          :data-stagger-index="0"
          size="sm"
          tone="danger"
          weight="medium"
          role="alert"
          class="sm:col-span-2"
        >
          {{ errorMessage }}
        </BaseText>
      </StaggeredTransitionGroup>
    </form>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="ghost"
        :is-disabled="isSaving"
        @click="isOpen = false"
      >
        Cancelar
      </BaseButton>
      <BaseButton type="submit" form="product-form" :is-loading="isSaving">
        {{ editedProduct ? 'Salvar' : 'Criar produto' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>
