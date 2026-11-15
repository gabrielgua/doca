<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue'
import { useToastStore } from '@/stores/toast-store'
import BaseToast from './BaseToast.vue'

const toastStore = useToastStore()

const viewportElement = useTemplateRef<HTMLElement>('viewport')

function bringViewportToFront() {
  const viewport = viewportElement.value
  if (!viewport) {
    return
  }
  if (viewport.matches(':popover-open')) {
    viewport.hidePopover()
  }
  viewport.showPopover()
}

onMounted(bringViewportToFront)

watch(
  () => toastStore.visibleToasts.at(-1)?.id,
  (newestToastId, previousNewestToastId) => {
    if (newestToastId !== undefined && newestToastId !== previousNewestToastId) {
      bringViewportToFront()
    }
  },
)
</script>

<template>
  <section
    ref="viewport"
    popover="manual"
    aria-label="Notificações"
    class="pointer-events-none fixed inset-x-4 top-auto h-fit w-auto bottom-24 m-0 overflow-visible border-0 bg-transparent p-0 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:left-auto"
  >
    <TransitionGroup
      tag="ol"
      class="flex flex-col items-stretch gap-2 lg:items-end"
      enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
      enter-from-class="translate-y-4 scale-90 opacity-0"
      leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
      leave-to-class="scale-95 opacity-0 lg:translate-x-8"
      move-class="transition-transform duration-500 ease-bounce motion-reduce:transition-none"
    >
      <li v-for="toast in toastStore.visibleToasts" :key="toast.id" class="pointer-events-auto">
        <BaseToast :toast="toast" @dismiss-requested="toastStore.dismissToast(toast.id)" />
      </li>
    </TransitionGroup>
  </section>
</template>
