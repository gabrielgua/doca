<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDropZone, useFileDialog } from '@vueuse/core'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { CloseIcon, PdfFileIcon, UploadIcon } from '@/theme/app-icons'

interface BaseFileDropProps {
  label: string
  hint: string
  acceptedMimeTypes: string[]
  currentFileName?: string
}

const props = withDefaults(defineProps<BaseFileDropProps>(), {
  currentFileName: undefined,
})

const selectedFile = defineModel<File | null>({ default: null })

const dropZoneElement = ref<HTMLElement>()
const rejectionMessage = ref<string>()

function acceptFile(candidateFiles: File[] | FileList | null) {
  const candidateFile = candidateFiles?.[0]
  if (!candidateFile) {
    return
  }
  if (!props.acceptedMimeTypes.includes(candidateFile.type)) {
    rejectionMessage.value = 'Esse tipo de arquivo não é aceito aqui.'
    return
  }
  rejectionMessage.value = undefined
  selectedFile.value = candidateFile
}

const { isOverDropZone } = useDropZone(dropZoneElement, {
  dataTypes: props.acceptedMimeTypes,
  multiple: false,
  onDrop: acceptFile,
})

const { open: openFileDialog, onChange: onFileDialogChange } = useFileDialog({
  accept: props.acceptedMimeTypes.join(','),
  multiple: false,
  reset: true,
})

onFileDialogChange(acceptFile)

const shownFileName = computed(() => selectedFile.value?.name ?? props.currentFileName)

function clearSelectedFile() {
  selectedFile.value = null
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <BaseText as="span" size="sm" weight="semibold">{{ label }}</BaseText>
    <div
      ref="dropZoneElement"
      role="button"
      tabindex="0"
      class="group flex cursor-pointer items-center gap-3 rounded-tile border-2 border-dashed p-4 transition-bouncy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="
        isOverDropZone
          ? 'scale-102 border-brand-500 bg-brand-50 dark:bg-brand-950'
          : selectedFile
            ? 'border-success-500 bg-success-50 dark:bg-success-950'
            : 'border-neutral-300 bg-neutral-50 hover:border-brand-400 hover:bg-brand-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-brand-950'
      "
      @click="openFileDialog()"
      @keydown.enter.prevent="openFileDialog()"
      @keydown.space.prevent="openFileDialog()"
    >
      <span
        class="grid size-11 shrink-0 place-items-center rounded-control bg-white text-brand-600 shadow-card transition-bouncy group-hover:-translate-y-0.5 group-hover:rotate-6 dark:bg-neutral-900 dark:text-brand-400"
        :class="{ 'animate-icon-pop text-success-600': selectedFile }"
      >
        <BaseIcon :icon="shownFileName ? PdfFileIcon : UploadIcon" size="md" />
      </span>
      <span class="min-w-0 flex-1">
        <BaseText as="span" size="sm" weight="bold" class="block truncate">
          {{ shownFileName ?? 'Arraste o arquivo ou clique para escolher' }}
        </BaseText>
        <BaseText as="span" size="caption" tone="subtle" class="block">
          {{ selectedFile ? 'Vai ser enviado ao salvar' : hint }}
        </BaseText>
      </span>
      <button
        v-if="selectedFile"
        type="button"
        class="grid size-8 cursor-pointer place-items-center rounded-full text-neutral-500 transition hover:bg-white hover:text-danger-600 dark:hover:bg-neutral-900"
        aria-label="Remover arquivo escolhido"
        @click.stop="clearSelectedFile"
      >
        <BaseIcon :icon="CloseIcon" size="sm" />
      </button>
    </div>
    <BaseText v-if="rejectionMessage" size="caption" tone="danger" weight="medium" role="alert">
      {{ rejectionMessage }}
    </BaseText>
  </div>
</template>
