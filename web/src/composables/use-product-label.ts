import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { createDocumentDownloadUrl, type Product } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useCatalogStore } from '@/stores/catalog-store'
import { useDocumentViewerStore } from '@/stores/document-viewer-store'
import { useToastStore } from '@/stores/toast-store'

export function useProductLabel(productSource: MaybeRefOrGetter<Product>) {
  const catalogStore = useCatalogStore()
  const toastStore = useToastStore()
  const documentViewerStore = useDocumentViewerStore()

  const isDownloadingLabel = ref(false)
  const isUploadingLabel = ref(false)

  const { open: openFileDialog, onChange: onLabelChosen } = useFileDialog({
    accept: 'application/pdf',
    multiple: false,
    reset: true,
  })

  onLabelChosen(async (chosenFiles) => {
    const labelFile = chosenFiles?.[0]
    const product = toValue(productSource)
    if (!labelFile) {
      return
    }
    isUploadingLabel.value = true
    try {
      await catalogStore.replaceLabel(product.id, labelFile)
      toastStore.showToast({ title: 'Etiqueta salva', description: product.name, tone: 'success' })
    } catch (uploadError) {
      toastStore.showToast({
        title: 'Não foi possível enviar a etiqueta',
        description: describeError(uploadError, 'Tente de novo.'),
        tone: 'neutral',
      })
    } finally {
      isUploadingLabel.value = false
    }
  })

  function chooseNewLabel() {
    openFileDialog()
  }

  function viewLabel() {
    const product = toValue(productSource)
    if (!product.fnskuLabelPath) {
      return
    }
    documentViewerStore.openDocument({
      title: `Etiqueta · ${product.name}`,
      documentPath: product.fnskuLabelPath,
      downloadName: `${product.fnsku ?? product.name}.pdf`,
    })
  }

  async function downloadLabel() {
    const product = toValue(productSource)
    if (!product.fnskuLabelPath) {
      return
    }
    isDownloadingLabel.value = true
    try {
      const downloadName = `${product.fnsku ?? product.name}.pdf`
      window.location.assign(await createDocumentDownloadUrl(product.fnskuLabelPath, downloadName))
    } catch (downloadError) {
      toastStore.showToast({
        title: 'Não foi possível baixar a etiqueta',
        description: describeError(downloadError, 'Tente de novo.'),
        tone: 'neutral',
      })
    } finally {
      isDownloadingLabel.value = false
    }
  }

  return { isDownloadingLabel, isUploadingLabel, chooseNewLabel, viewLabel, downloadLabel }
}
