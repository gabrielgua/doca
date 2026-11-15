<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, useTemplateRef, watch } from 'vue'
import type { PDFDocumentLoadingTask } from 'pdfjs-dist'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface PdfPagesProps {
  documentUrl: string
}

const props = defineProps<PdfPagesProps>()

const SHARPNESS_MULTIPLIER = 1.5

const pagesElement = useTemplateRef<HTMLDivElement>('pages')
const pageCount = ref(0)
const isLoading = ref(true)
const errorMessage = ref<string>()
const loadingTask = shallowRef<PDFDocumentLoadingTask>()

async function loadPdfLibrary() {
  const [pdfLibrary, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfLibrary.GlobalWorkerOptions.workerSrc = workerModule.default
  return pdfLibrary
}

async function renderDocument(documentUrl: string) {
  isLoading.value = true
  errorMessage.value = undefined
  pageCount.value = 0
  await loadingTask.value?.destroy()
  try {
    const pdfLibrary = await loadPdfLibrary()
    loadingTask.value = pdfLibrary.getDocument({ url: documentUrl })
    const pdfDocument = await loadingTask.value.promise
    pageCount.value = pdfDocument.numPages
    isLoading.value = false
    const pagesContainer = pagesElement.value
    if (!pagesContainer) {
      return
    }
    pagesContainer.replaceChildren()
    const availableWidth = pagesContainer.clientWidth
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const naturalViewport = page.getViewport({ scale: 1 })
      const fitScale = availableWidth / naturalViewport.width
      const viewport = page.getViewport({
        scale: fitScale * window.devicePixelRatio * SHARPNESS_MULTIPLIER,
      })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.className = 'w-full h-auto rounded-lg bg-white shadow-card animate-rise-in'
      canvas.setAttribute('aria-label', `Página ${pageNumber} de ${pdfDocument.numPages}`)
      canvas.setAttribute('role', 'img')
      pagesContainer.append(canvas)
      await page.render({ canvas, viewport }).promise
    }
  } catch {
    isLoading.value = false
    errorMessage.value = 'Não foi possível abrir o PDF. Tente baixar o arquivo.'
  }
}

watch(
  () => props.documentUrl,
  (documentUrl) => renderDocument(documentUrl),
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(() => {
  loadingTask.value?.destroy()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      class="max-h-160 overflow-y-auto rounded-tile bg-neutral-100 p-3 sm:p-4 dark:bg-neutral-800"
    >
      <div v-if="isLoading" class="grid place-items-center py-24">
        <BaseSpinner size="lg" class="text-brand-600" />
      </div>
      <BaseText v-else-if="errorMessage" tone="danger" weight="semibold" class="py-16 text-center">
        {{ errorMessage }}
      </BaseText>
      <div ref="pages" class="flex flex-col gap-3" />
    </div>
    <BaseText v-if="pageCount > 0" size="caption" tone="subtle">
      {{ pageCount === 1 ? '1 página' : `${pageCount} páginas` }}
    </BaseText>
  </div>
</template>
