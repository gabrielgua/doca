<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { createDocumentDownloadUrl, createDocumentViewUrl } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useDocumentViewerStore } from '@/stores/document-viewer-store'
import { DownloadIcon } from '@/theme/app-icons'
import PdfPages from './PdfPages.vue'

const documentViewerStore = useDocumentViewerStore()

const documentUrl = ref<string>()
const errorMessage = ref<string>()
const isDownloading = ref(false)

watch(
  () => documentViewerStore.isViewerOpen && documentViewerStore.viewedDocument,
  async (viewedDocument) => {
    if (!viewedDocument) {
      return
    }
    documentUrl.value = undefined
    errorMessage.value = undefined
    try {
      documentUrl.value = await createDocumentViewUrl(viewedDocument.documentPath)
    } catch (urlError) {
      errorMessage.value = describeError(urlError, 'Não foi possível abrir o arquivo.')
    }
  },
)

async function handleDownloadClick() {
  const viewedDocument = documentViewerStore.viewedDocument
  if (!viewedDocument) {
    return
  }
  isDownloading.value = true
  try {
    window.location.assign(
      await createDocumentDownloadUrl(viewedDocument.documentPath, viewedDocument.downloadName),
    )
  } catch (downloadError) {
    errorMessage.value = describeError(downloadError, 'Não foi possível baixar o arquivo.')
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <BaseDialog
    v-model:open="documentViewerStore.isViewerOpen"
    :title="documentViewerStore.viewedDocument?.title ?? 'Documento'"
    width="document"
  >
    <BaseText v-if="errorMessage" tone="danger" weight="semibold" role="alert">
      {{ errorMessage }}
    </BaseText>
    <PdfPages v-else-if="documentUrl" :document-url="documentUrl" />
    <div v-else class="grid place-items-center py-24">
      <BaseSpinner size="lg" class="text-brand-600" />
    </div>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="ghost"
        @click="documentViewerStore.isViewerOpen = false"
      >
        Fechar
      </BaseButton>
      <BaseButton
        :leading-icon="DownloadIcon"
        :is-loading="isDownloading"
        @click="handleDownloadClick"
      >
        Baixar PDF
      </BaseButton>
    </template>
  </BaseDialog>
</template>
