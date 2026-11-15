<script setup lang="ts">
import { useId } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { OpenMenuIcon } from '@/theme/app-icons'
import BaseCard from './BaseCard.vue'

interface BaseDisclosureCardProps {
  title: string
  description?: string
  headingLevel?: 2 | 3
}

withDefaults(defineProps<BaseDisclosureCardProps>(), {
  description: undefined,
  headingLevel: 2,
})

const OPEN_DURATION_MILLISECONDS = 520
const CLOSE_DURATION_MILLISECONDS = 260

const isOpen = defineModel<boolean>('open', { default: false })

const panelId = useId()
const preferredMotion = usePreferredReducedMotion()

function animateHeight(
  element: Element,
  keyframes: Keyframe[],
  durationInMilliseconds: number,
  easing: string,
  done: () => void,
) {
  if (preferredMotion.value === 'reduce') {
    done()
    return
  }
  const animation = (element as HTMLElement).animate(keyframes, {
    duration: durationInMilliseconds,
    easing,
  })
  animation.onfinish = done
  animation.oncancel = done
}

function handlePanelEnter(element: Element, done: () => void) {
  const fullHeight = `${(element as HTMLElement).scrollHeight}px`
  animateHeight(
    element,
    [
      { height: '0px', opacity: 0, overflow: 'hidden' },
      { height: fullHeight, opacity: 1, overflow: 'hidden' },
    ],
    OPEN_DURATION_MILLISECONDS,
    'cubic-bezier(0.22, 1.3, 0.36, 1)',
    done,
  )
}

function handlePanelLeave(element: Element, done: () => void) {
  const fullHeight = `${(element as HTMLElement).scrollHeight}px`
  animateHeight(
    element,
    [
      { height: fullHeight, opacity: 1, overflow: 'hidden' },
      { height: '0px', opacity: 0, overflow: 'hidden' },
    ],
    CLOSE_DURATION_MILLISECONDS,
    'ease-in',
    done,
  )
}
</script>

<template>
  <BaseCard as="section" padding="none">
    <BaseHeading :level="headingLevel" size="section">
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center gap-4 rounded-card p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:p-6"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        @click="isOpen = !isOpen"
      >
        <span class="min-w-0 flex-1">
          <span class="block">{{ title }}</span>
          <BaseText v-if="description" as="span" size="sm" tone="subtle" class="block font-medium">
            {{ description }}
          </BaseText>
        </span>
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition-bouncy group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-neutral-800 dark:group-hover:bg-brand-950"
          :class="{ 'rotate-180': isOpen }"
        >
          <BaseIcon :icon="OpenMenuIcon" size="sm" />
        </span>
      </button>
    </BaseHeading>
    <Transition :css="false" @enter="handlePanelEnter" @leave="handlePanelLeave">
      <div v-if="isOpen" :id="panelId">
        <div class="px-5 pb-5 sm:px-6 sm:pb-6">
          <slot />
        </div>
      </div>
    </Transition>
  </BaseCard>
</template>
