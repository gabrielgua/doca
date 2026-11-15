import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { useRoute } from 'vue-router'

interface IndicatorBox {
  top: number
  left: number
  width: number
  height: number
}

interface SlidingIndicatorOptions {
  shouldScrollActiveIntoView?: boolean
}

const ACTIVE_ITEM_SELECTOR = '[aria-current="page"]'

function measureOffsetWithin(element: HTMLElement, container: HTMLElement) {
  let top = 0
  let left = 0
  let currentElement: HTMLElement | null = element
  while (currentElement && currentElement !== container) {
    top += currentElement.offsetTop
    left += currentElement.offsetLeft
    currentElement = currentElement.offsetParent as HTMLElement | null
  }
  return { top, left }
}

export function useSlidingIndicator(
  containerElement: Ref<HTMLElement | undefined>,
  options: SlidingIndicatorOptions = {},
) {
  const route = useRoute()
  const indicatorBox = ref<IndicatorBox>({ top: 0, left: 0, width: 0, height: 0 })
  const hasActiveItem = ref(false)
  const hasMeasuredOnce = ref(false)

  function measureActiveItem() {
    const container = containerElement.value
    const activeItem = container?.querySelector<HTMLElement>(ACTIVE_ITEM_SELECTOR)
    if (!container || !activeItem) {
      hasActiveItem.value = false
      return
    }
    const { top, left } = measureOffsetWithin(activeItem, container)
    indicatorBox.value = {
      top,
      left,
      width: activeItem.offsetWidth,
      height: activeItem.offsetHeight,
    }
    hasActiveItem.value = true
    requestAnimationFrame(() => {
      hasMeasuredOnce.value = true
    })
    if (options.shouldScrollActiveIntoView) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  watch(
    () => route.fullPath,
    () => nextTick(measureActiveItem),
    { immediate: true },
  )

  useResizeObserver(containerElement, measureActiveItem)

  useMutationObserver(containerElement, measureActiveItem, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-current'],
  })

  const indicatorStyle = computed(() => ({
    transform: `translate3d(${indicatorBox.value.left}px, ${indicatorBox.value.top}px, 0)`,
    width: `${indicatorBox.value.width}px`,
    height: `${indicatorBox.value.height}px`,
    opacity: hasActiveItem.value ? 1 : 0,
  }))

  return { indicatorStyle, hasMeasuredOnce }
}
