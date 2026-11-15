<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { onClickOutside, onKeyStroke, useElementBounding } from '@vueuse/core'

export type DropdownMenuAlignment = 'start' | 'end'

interface BaseDropdownMenuProps {
  accessibleLabel: string
  alignment?: DropdownMenuAlignment
}

const props = withDefaults(defineProps<BaseDropdownMenuProps>(), {
  alignment: 'end',
})

const isOpen = defineModel<boolean>('open', { default: false })

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)'
const PANEL_GAP_PIXELS = 8

const menuId = useId()
const containerElement = ref<HTMLElement>()
const menuElement = ref<HTMLElement>()
const wasOpenedWithKeyboard = ref(false)

const containerBounds = useElementBounding(containerElement)

const panelOriginClassesByAlignment: Record<DropdownMenuAlignment, string> = {
  start: 'origin-top-left',
  end: 'origin-top-right',
}

const panelPositionStyle = computed(() => ({
  top: `${containerBounds.bottom.value + PANEL_GAP_PIXELS}px`,
  left: `${props.alignment === 'start' ? containerBounds.left.value : containerBounds.right.value}px`,
  transform: props.alignment === 'end' ? 'translateX(-100%)' : 'none',
}))

function showPanelInTopLayer(panelElement: Element) {
  ;(panelElement as HTMLElement).showPopover()
}

function readMenuItems(): HTMLElement[] {
  return [...(menuElement.value?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [])]
}

function focusTrigger() {
  containerElement.value?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus()
}

function toggleMenu(triggerEvent?: MouseEvent) {
  wasOpenedWithKeyboard.value = triggerEvent?.detail === 0
  containerBounds.update()
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function moveFocus(step: number) {
  const menuItems = readMenuItems()
  if (menuItems.length === 0) {
    return
  }
  const focusedPosition = menuItems.indexOf(document.activeElement as HTMLElement)
  const nextPosition = (focusedPosition + step + menuItems.length) % menuItems.length
  menuItems[nextPosition]?.focus()
}

function handleMenuKeydown(keyboardEvent: KeyboardEvent) {
  if (keyboardEvent.key === 'ArrowDown') {
    keyboardEvent.preventDefault()
    moveFocus(1)
  }
  if (keyboardEvent.key === 'ArrowUp') {
    keyboardEvent.preventDefault()
    moveFocus(-1)
  }
  if (keyboardEvent.key === 'Tab') {
    closeMenu()
  }
}

onClickOutside(containerElement, closeMenu)

onKeyStroke('Escape', () => {
  if (!isOpen.value) {
    return
  }
  closeMenu()
  focusTrigger()
})

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) {
    return
  }
  await nextTick()
  if (wasOpenedWithKeyboard.value) {
    readMenuItems()[0]?.focus()
    return
  }
  menuElement.value?.focus()
})
</script>

<template>
  <div ref="containerElement" class="relative">
    <slot name="trigger" :is-open="isOpen" :menu-id="menuId" :toggle-menu="toggleMenu" />
    <Transition
      enter-from-class="-translate-y-1 scale-95 opacity-0"
      enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
      leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
      leave-to-class="-translate-y-1 scale-95 opacity-0"
      @enter="showPanelInTopLayer"
    >
      <div
        v-if="isOpen"
        :id="menuId"
        ref="menuElement"
        popover="manual"
        role="menu"
        tabindex="-1"
        :aria-label="accessibleLabel"
        class="fixed inset-auto m-0 w-80 max-w-full overflow-hidden rounded-card border border-neutral-200 bg-white p-0 text-neutral-900 shadow-lift outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
        :class="panelOriginClassesByAlignment[alignment]"
        :style="panelPositionStyle"
        @keydown="handleMenuKeydown"
      >
        <slot :close-menu="closeMenu" />
      </div>
    </Transition>
  </div>
</template>
