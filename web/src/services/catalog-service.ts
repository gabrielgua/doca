import { supabaseClient } from '@/services/supabase-client'

const DOCUMENTS_BUCKET = 'documents'
const SIGNED_URL_LIFETIME_SECONDS = 120

export interface Brand {
  id: string
  name: string
}

export interface Product {
  id: string
  brandId: string
  name: string
  sku: string | null
  asin: string | null
  fnsku: string | null
  fnskuLabelPath: string | null
  isActive: boolean
}

export interface ProductDraft {
  brandId: string
  name: string
  sku: string | null
  asin: string | null
  fnsku: string | null
}

interface ProductRow {
  id: string
  brand_id: string
  name: string
  sku: string | null
  asin: string | null
  fnsku: string | null
  fnsku_label_path: string | null
  is_active: boolean
}

const PRODUCT_COLUMNS = 'id, brand_id, name, sku, asin, fnsku, fnsku_label_path, is_active'

function toProduct(productRow: ProductRow): Product {
  return {
    id: productRow.id,
    brandId: productRow.brand_id,
    name: productRow.name,
    sku: productRow.sku,
    asin: productRow.asin,
    fnsku: productRow.fnsku,
    fnskuLabelPath: productRow.fnsku_label_path,
    isActive: productRow.is_active,
  }
}

function toProductColumns(productDraft: ProductDraft) {
  return {
    brand_id: productDraft.brandId,
    name: productDraft.name,
    sku: productDraft.sku,
    asin: productDraft.asin,
    fnsku: productDraft.fnsku,
  }
}

export async function fetchBrands(companyId: string): Promise<Brand[]> {
  const { data, error } = await supabaseClient
    .from('brands')
    .select('id, name')
    .eq('company_id', companyId)
    .order('name')
  if (error) {
    throw error
  }
  return data
}

export async function createBrand(companyId: string, brandName: string): Promise<Brand> {
  const { data, error } = await supabaseClient
    .from('brands')
    .insert({ company_id: companyId, name: brandName })
    .select('id, name')
    .single()
  if (error) {
    throw error
  }
  return data
}

export async function fetchProducts(companyId: string): Promise<Product[]> {
  const { data, error } = await supabaseClient
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('company_id', companyId)
    .order('name')
  if (error) {
    throw error
  }
  return (data as ProductRow[]).map(toProduct)
}

export async function createProduct(companyId: string, productDraft: ProductDraft) {
  const { data, error } = await supabaseClient
    .from('products')
    .insert({ company_id: companyId, ...toProductColumns(productDraft) })
    .select(PRODUCT_COLUMNS)
    .single()
  if (error) {
    throw error
  }
  return toProduct(data as ProductRow)
}

export async function updateProduct(productId: string, productDraft: ProductDraft) {
  const { data, error } = await supabaseClient
    .from('products')
    .update(toProductColumns(productDraft))
    .eq('id', productId)
    .select(PRODUCT_COLUMNS)
    .single()
  if (error) {
    throw error
  }
  return toProduct(data as ProductRow)
}

export async function deleteProduct(productId: string) {
  const { error } = await supabaseClient.from('products').delete().eq('id', productId)
  if (error) {
    throw error
  }
}

export async function uploadProductLabel(companyId: string, productId: string, labelFile: File) {
  const labelPath = `${companyId}/products/${productId}.pdf`
  const { error: uploadError } = await supabaseClient.storage
    .from(DOCUMENTS_BUCKET)
    .upload(labelPath, labelFile, { upsert: true, contentType: 'application/pdf' })
  if (uploadError) {
    throw uploadError
  }
  const { data, error } = await supabaseClient
    .from('products')
    .update({ fnsku_label_path: labelPath })
    .eq('id', productId)
    .select(PRODUCT_COLUMNS)
    .single()
  if (error) {
    throw error
  }
  return toProduct(data as ProductRow)
}

export async function createDocumentViewUrl(documentPath: string) {
  const { data, error } = await supabaseClient.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(documentPath, SIGNED_URL_LIFETIME_SECONDS)
  if (error) {
    throw error
  }
  return data.signedUrl
}

export async function createDocumentDownloadUrl(documentPath: string, downloadName: string) {
  const { data, error } = await supabaseClient.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(documentPath, SIGNED_URL_LIFETIME_SECONDS, { download: downloadName })
  if (error) {
    throw error
  }
  return data.signedUrl
}
