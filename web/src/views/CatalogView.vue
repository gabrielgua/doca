<script setup lang="ts">
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import BaseButton from '@/components/button/BaseButton.vue'
import BrandFilterList from '@/components/catalog/BrandFilterList.vue'
import { ALL_BRANDS_FILTER } from '@/components/catalog/catalog-filters'
import NewBrandDialog from '@/components/catalog/NewBrandDialog.vue'
import ProductCard from '@/components/catalog/ProductCard.vue'
import ProductTable from '@/components/catalog/ProductTable.vue'
import ProductFormDialog from '@/components/catalog/ProductFormDialog.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSegmentedControl from '@/components/form/BaseSegmentedControl.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import { useViewMode, VIEW_MODE_OPTIONS } from '@/composables/use-view-mode'
import { normalizeForSearch } from '@/formatting/normalize-for-search'
import type { Brand, Product } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useCatalogStore } from '@/stores/catalog-store'
import { useCompaniesStore } from '@/stores/companies-store'
import { useToastStore } from '@/stores/toast-store'
import { AddIcon, CatalogIcon, DeleteIcon, ProductIcon, SearchIcon } from '@/theme/app-icons'

const SEARCH_DEBOUNCE_MILLISECONDS = 250
const VIEW_MODE_STORAGE_KEY = 'doca-catalog-view-mode'

const catalogStore = useCatalogStore()
const companiesStore = useCompaniesStore()
const toastStore = useToastStore()

const selectedBrandId = ref(ALL_BRANDS_FILTER)
const searchText = ref('')
const debouncedSearchText = refDebounced(searchText, SEARCH_DEBOUNCE_MILLISECONDS)
const isProductFormOpen = ref(false)
const isNewBrandDialogOpen = ref(false)
const editedProduct = ref<Product | null>(null)
const productAwaitingDeletion = ref<Product | null>(null)
const isDeletingProduct = ref(false)
const { viewMode } = useViewMode(VIEW_MODE_STORAGE_KEY)

const canEdit = computed(() => companiesStore.canEditCurrentCompany)
const canDelete = computed(() => companiesStore.roleInCurrentCompany === 'admin')
const isDeleteConfirmationOpen = computed({
  get: () => productAwaitingDeletion.value !== null,
  set: (isNowOpen) => {
    if (!isNowOpen) {
      productAwaitingDeletion.value = null
    }
  },
})

const normalizedSearch = computed(() => normalizeForSearch(debouncedSearchText.value))
const productsInSelectedBrand = computed(() =>
  catalogStore.products.filter(
    (product) =>
      selectedBrandId.value === ALL_BRANDS_FILTER || product.brandId === selectedBrandId.value,
  ),
)
const visibleProducts = computed(() =>
  productsInSelectedBrand.value.filter((product) =>
    normalizeForSearch(`${product.name} ${product.fnsku ?? ''} ${product.sku ?? ''}`).includes(
      normalizedSearch.value,
    ),
  ),
)

function openNewProductForm() {
  editedProduct.value = null
  isProductFormOpen.value = true
}

function openEditProductForm(product: Product) {
  editedProduct.value = product
  isProductFormOpen.value = true
}

function handleBrandCreated(createdBrand: Brand) {
  selectedBrandId.value = createdBrand.id
}

async function handleDeleteConfirmed() {
  const product = productAwaitingDeletion.value
  if (!product) {
    return
  }
  isDeletingProduct.value = true
  try {
    await catalogStore.removeProduct(product.id)
    toastStore.showToast({ title: 'Produto excluído', description: product.name, tone: 'neutral' })
    productAwaitingDeletion.value = null
  } catch (deleteError) {
    toastStore.showToast({
      title: 'Não foi possível excluir',
      description: describeError(deleteError, 'Tente de novo.'),
      tone: 'neutral',
    })
  } finally {
    isDeletingProduct.value = false
  }
}
</script>

<template>
  <EmptyState
    v-if="!companiesStore.currentCompany"
    :icon="CatalogIcon"
    title="Nenhuma empresa ainda"
    description="Marcas e produtos ficam dentro de uma empresa. Crie ou peça acesso a uma empresa primeiro."
  />
  <div v-else class="flex flex-col gap-6 lg:flex-row lg:items-start">
    <BrandFilterList
      v-model="selectedBrandId"
      :can-edit="canEdit"
      class="lg:sticky lg:top-6 lg:w-68 lg:shrink-0"
      @new-brand-requested="isNewBrandDialogOpen = true"
    />

    <section class="flex min-w-0 flex-1 flex-col gap-4" aria-label="Produtos">
      <div class="flex flex-wrap items-center gap-3">
        <BaseInput
          v-model="searchText"
          type="search"
          placeholder="Buscar por nome, FNSKU ou SKU"
          :leading-icon="SearchIcon"
          class="min-w-56 flex-1"
        />
        <BaseSegmentedControl
          v-model="viewMode"
          :options="VIEW_MODE_OPTIONS"
          accessible-label="Mostrar produtos como"
        />
        <BaseButton
          v-if="canEdit && catalogStore.brands.length > 0"
          :leading-icon="AddIcon"
          @click="openNewProductForm"
        >
          Novo produto
        </BaseButton>
      </div>

      <div v-if="catalogStore.isLoadingCatalog" class="grid place-items-center py-16">
        <BaseSpinner size="lg" class="text-brand-600" />
      </div>
      <LoadErrorRetry
        v-else-if="catalogStore.loadErrorMessage"
        :error-message="catalogStore.loadErrorMessage"
        @retry-requested="catalogStore.reloadCatalog()"
      />
      <EmptyState
        v-else-if="catalogStore.brands.length === 0"
        :icon="CatalogIcon"
        title="Comece pela marca"
        :description="
          canEdit
            ? 'Crie a primeira marca. Depois os produtos entram dentro dela.'
            : 'Esta empresa ainda não tem marcas cadastradas.'
        "
      >
        <BaseButton v-if="canEdit" :leading-icon="AddIcon" @click="isNewBrandDialogOpen = true">
          Nova marca
        </BaseButton>
      </EmptyState>
      <EmptyState
        v-else-if="visibleProducts.length === 0 && normalizedSearch"
        :icon="SearchIcon"
        title="Nenhum produto encontrado"
        :description="`Nada com “${debouncedSearchText.trim()}” no nome, FNSKU ou SKU.`"
      >
        <BaseButton variant="neutral" appearance="outlined" @click="searchText = ''">
          Limpar busca
        </BaseButton>
      </EmptyState>
      <EmptyState
        v-else-if="productsInSelectedBrand.length === 0"
        :icon="ProductIcon"
        title="Nenhum produto ainda"
        :description="
          canEdit
            ? 'Cadastre o primeiro produto com o FNSKU e a etiqueta.'
            : 'Esta marca ainda não tem produtos cadastrados.'
        "
      >
        <BaseButton v-if="canEdit" :leading-icon="AddIcon" @click="openNewProductForm">
          Novo produto
        </BaseButton>
      </EmptyState>
      <Transition
        v-else
        mode="out-in"
        enter-active-class="transition duration-400 ease-bounce motion-reduce:transition-none"
        enter-from-class="translate-y-3 opacity-0"
        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <StaggeredTransitionGroup
          v-if="viewMode === 'cards'"
          key="cards"
          class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
          :delay-between-items-in-milliseconds="50"
        >
          <ProductCard
            v-for="(product, productPosition) in visibleProducts"
            :key="product.id"
            :data-stagger-index="productPosition"
            :product="product"
            :brand-name="catalogStore.findBrandName(product.brandId)"
            :can-edit="canEdit"
            :can-delete="canDelete"
            @edit-requested="openEditProductForm(product)"
            @delete-requested="productAwaitingDeletion = product"
          />
        </StaggeredTransitionGroup>
        <ProductTable
          v-else
          key="list"
          :products="visibleProducts"
          :find-brand-name="catalogStore.findBrandName"
          :can-edit="canEdit"
          :can-delete="canDelete"
          @edit-requested="openEditProductForm"
          @delete-requested="(product) => (productAwaitingDeletion = product)"
        />
      </Transition>
    </section>

    <ProductFormDialog v-model:open="isProductFormOpen" :edited-product="editedProduct" />
    <NewBrandDialog v-model:open="isNewBrandDialogOpen" @created="handleBrandCreated" />
    <ConfirmActionModal
      v-model:open="isDeleteConfirmationOpen"
      title="Excluir produto?"
      :description="`${productAwaitingDeletion?.name ?? ''} sai do catálogo. Isso não pode ser desfeito.`"
      confirm-label="Excluir"
      :icon="DeleteIcon"
      variant="danger"
      :is-submitting="isDeletingProduct"
      @confirmed="handleDeleteConfirmed"
    />
  </div>
</template>
