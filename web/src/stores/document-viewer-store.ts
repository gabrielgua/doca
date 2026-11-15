import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ViewedDocument {
  title: string
  documentPath: string
  downloadName: string
}

export const useDocumentViewerStore = defineStore('document-viewer', () => {
  const viewedDocument = ref<ViewedDocument | null>(null)
  const isViewerOpen = ref(false)

  function openDocument(documentToView: ViewedDocument) {
    viewedDocument.value = documentToView
    isViewerOpen.value = true
  }

  return { viewedDocument, isViewerOpen, openDocument }
})
