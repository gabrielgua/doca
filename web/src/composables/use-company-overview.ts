import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { fetchBrands, fetchProducts, type Brand, type Product } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'

export interface BrandBreakdown {
  brand: Brand
  productCount: number
  productsWithoutLabelCount: number
}

export function useCompanyOverview(companyIdSource: MaybeRefOrGetter<string>) {
  const brands = ref<Brand[]>([])
  const products = ref<Product[]>([])
  const isLoadingCatalog = ref(true)
  const catalogErrorMessage = ref<string>()

  const productsWithoutLabel = computed(() =>
    products.value.filter((product) => !product.fnskuLabelPath),
  )
  const productsWithoutFnsku = computed(() => products.value.filter((product) => !product.fnsku))
  const brandBreakdowns = computed<BrandBreakdown[]>(() =>
    brands.value.map((brand) => {
      const brandProducts = products.value.filter((product) => product.brandId === brand.id)
      return {
        brand,
        productCount: brandProducts.length,
        productsWithoutLabelCount: brandProducts.filter((product) => !product.fnskuLabelPath)
          .length,
      }
    }),
  )

  function findBrandName(brandId: string): string {
    return brands.value.find((brand) => brand.id === brandId)?.name ?? ''
  }

  async function loadCatalog() {
    const companyId = toValue(companyIdSource)
    isLoadingCatalog.value = true
    catalogErrorMessage.value = undefined
    try {
      const [loadedBrands, loadedProducts] = await Promise.all([
        fetchBrands(companyId),
        fetchProducts(companyId),
      ])
      brands.value = loadedBrands
      products.value = loadedProducts
    } catch (loadError) {
      catalogErrorMessage.value = describeError(loadError, 'Não foi possível carregar o catálogo.')
    } finally {
      isLoadingCatalog.value = false
    }
  }

  watch(() => toValue(companyIdSource), loadCatalog, { immediate: true })

  return {
    brands,
    products,
    isLoadingCatalog,
    catalogErrorMessage,
    productsWithoutLabel,
    productsWithoutFnsku,
    brandBreakdowns,
    findBrandName,
    loadCatalog,
  }
}
