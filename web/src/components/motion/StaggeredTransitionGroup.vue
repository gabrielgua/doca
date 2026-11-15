<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

export type StaggerDirection = 'up' | 'down' | 'left' | 'right'

interface StaggeredTransitionGroupProps {
  tag?: string
  direction?: StaggerDirection
  delayBetweenItemsInMilliseconds?: number
  initialDelayInMilliseconds?: number
}

const props = withDefaults(defineProps<StaggeredTransitionGroupProps>(), {
  tag: 'div',
  direction: 'up',
  delayBetweenItemsInMilliseconds: 45,
  initialDelayInMilliseconds: 0,
})

const ENTER_DURATION_MILLISECONDS = 620
const LEAVE_DURATION_MILLISECONDS = 180
const BOUNCE_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const LEAVE_EASING = 'cubic-bezier(0.4, 0, 1, 1)'

const startingOffsetByDirection: Record<StaggerDirection, string> = {
  up: 'translate3d(0, 14px, 0) scale(0.95)',
  down: 'translate3d(0, -14px, 0) scale(0.95)',
  left: 'translate3d(14px, 0, 0) scale(0.95)',
  right: 'translate3d(-14px, 0, 0) scale(0.95)',
}

const preferredMotion = usePreferredReducedMotion()

function readStaggerIndex(element: HTMLElement): number {
  const staggerIndex = Number(element.dataset.staggerIndex)
  return Number.isFinite(staggerIndex) ? staggerIndex : 0
}

function handleEnter(element: Element, done: () => void) {
  const enteringElement = element as HTMLElement
  if (preferredMotion.value === 'reduce') {
    done()
    return
  }
  const enterAnimation = enteringElement.animate(
    [
      { opacity: 0, transform: startingOffsetByDirection[props.direction] },
      { opacity: 1, transform: 'none' },
    ],
    {
      duration: ENTER_DURATION_MILLISECONDS,
      delay:
        props.initialDelayInMilliseconds +
        readStaggerIndex(enteringElement) * props.delayBetweenItemsInMilliseconds,
      easing: BOUNCE_EASING,
      fill: 'backwards',
    },
  )
  enterAnimation.onfinish = done
  enterAnimation.oncancel = done
}

function handleLeave(element: Element, done: () => void) {
  const leavingElement = element as HTMLElement
  if (preferredMotion.value === 'reduce') {
    done()
    return
  }
  const leaveAnimation = leavingElement.animate(
    [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'scale(0.94)' },
    ],
    { duration: LEAVE_DURATION_MILLISECONDS, easing: LEAVE_EASING, fill: 'forwards' },
  )
  leaveAnimation.onfinish = done
  leaveAnimation.oncancel = done
}
</script>

<template>
  <TransitionGroup
    :tag="tag"
    appear
    :css="false"
    move-class="transition-transform duration-500 ease-bounce motion-reduce:transition-none"
    @enter="handleEnter"
    @leave="handleLeave"
  >
    <slot />
  </TransitionGroup>
</template>
