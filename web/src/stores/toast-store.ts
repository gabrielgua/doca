import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

export interface ToastPerson {
  name: string
  imageUrl?: string
}

export interface ToastAction {
  label: string
  onSelected: () => void
}

export interface Toast {
  id: number
  title: string
  description?: string
  tone: ToastTone
  person?: ToastPerson
  action?: ToastAction
  durationInMilliseconds: number
}

export type ToastContent = Omit<Toast, 'id' | 'durationInMilliseconds'> & {
  durationInMilliseconds?: number
}

const DEFAULT_DURATION_MILLISECONDS = 4500
const DANGER_DURATION_MILLISECONDS = 7000
const MAXIMUM_VISIBLE_TOASTS = 4

export const useToastStore = defineStore('toast', () => {
  const visibleToasts = ref<Toast[]>([])

  let nextToastId = 1

  function dismissToast(toastId: number) {
    visibleToasts.value = visibleToasts.value.filter((visibleToast) => visibleToast.id !== toastId)
  }

  function showToast(toastContent: ToastContent): number {
    const toastId = nextToastId++
    const durationInMilliseconds =
      toastContent.durationInMilliseconds ??
      (toastContent.tone === 'danger'
        ? DANGER_DURATION_MILLISECONDS
        : DEFAULT_DURATION_MILLISECONDS)
    visibleToasts.value = [
      ...visibleToasts.value,
      { ...toastContent, id: toastId, durationInMilliseconds },
    ].slice(-MAXIMUM_VISIBLE_TOASTS)
    return toastId
  }

  return { visibleToasts, showToast, dismissToast }
})
