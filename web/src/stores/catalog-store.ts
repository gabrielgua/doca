import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  createBrand,
  createProduct,
  deleteProduct,
  fetchBrands,
  fetchProducts,
  updateProduct,
  uploadProductLabel,
  type Brand,
  type Product,
  type ProductDraft,
} from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useCompaniesStore } from '@/stores/companies-store'

function sortByName<Item extends { name: string }>(items: Item[]): Item[] {
  return [...items].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'))
}

export const useCatalogStore = defineStore('catalog', () => {
  const companiesStore = useCompaniesStore()

  const brands = ref<Brand[]>([])
  const products = ref<Product[]>([])
  const isLoadingCatalog = ref(false)
  const loadErrorMessage = ref<string>()

  const productCountByBrandId = computed(() =>
    products.value.reduce<Record<string, number>>((countByBrandId, product) => {
      countByBrandId[product.brandId] = (countByBrandId[product.brandId] ?? 0) + 1
      return countByBrandId
    }, {}),
  )
  const productsWithoutLabel = computed(() =>
    products.value.filter((product) => !product.fnskuLabelPath),
  )

  function findBrandName(brandId: string): string {
    return brands.value.find((brand) => brand.id === brandId)?.name ?? ''
  }

  async function loadCatalog(companyId: string) {
    isLoadingCatalog.value = true
    loadErrorMessage.value = undefined
    try {
      const [loadedBrands, loadedProducts] = await Promise.all([
        fetchBrands(companyId),
        fetchProducts(companyId),
      ])
      brands.value = loadedBrands
      products.value = loadedProducts
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Não foi possível carregar o catálogo.')
    } finally {
      isLoadingCatalog.value = false
    }
  }

  function reloadCatalog() {
    if (companiesStore.currentCompany) {
      return loadCatalog(companiesStore.currentCompany.id)
    }
  }

  function requireCurrentCompanyId(): string {
    const currentCompanyId = companiesStore.currentCompany?.id
    if (!currentCompanyId) {
      throw new Error('Escolha uma empresa primeiro.')
    }
    return currentCompanyId
  }

  async function addBrand(brandName: string): Promise<Brand> {
    const createdBrand = await createBrand(requireCurrentCompanyId(), brandName)
    brands.value = sortByName([...brands.value, createdBrand])
    return createdBrand
  }

  function replaceProduct(savedProduct: Product) {
    const otherProducts = products.value.filter((product) => product.id !== savedProduct.id)
    products.value = sortByName([...otherProducts, savedProduct])
  }

  async function saveProduct(
    productDraft: ProductDraft,
    labelFile: File | null,
    existingProductId?: string,
  ): Promise<Product> {
    const currentCompanyId = requireCurrentCompanyId()
    let savedProduct = existingProductId
      ? await updateProduct(existingProductId, productDraft)
      : await createProduct(currentCompanyId, productDraft)
    if (labelFile) {
      savedProduct = await uploadProductLabel(currentCompanyId, savedProduct.id, labelFile)
    }
    replaceProduct(savedProduct)
    return savedProduct
  }

  async function replaceLabel(productId: string, labelFile: File) {
    const savedProduct = await uploadProductLabel(requireCurrentCompanyId(), productId, labelFile)
    replaceProduct(savedProduct)
  }

  async function removeProduct(productId: string) {
    await deleteProduct(productId)
    products.value = products.value.filter((product) => product.id !== productId)
  }

  watch(
    () => companiesStore.currentCompany?.id,
    (currentCompanyId) => {
      brands.value = []
      products.value = []
      if (currentCompanyId) {
        loadCatalog(currentCompanyId)
      }
    },
    { immediate: true },
  )

  return {
    brands,
    products,
    isLoadingCatalog,
    loadErrorMessage,
    productCountByBrandId,
    productsWithoutLabel,
    findBrandName,
    reloadCatalog,
    addBrand,
    saveProduct,
    replaceLabel,
    removeProduct,
  }
})
