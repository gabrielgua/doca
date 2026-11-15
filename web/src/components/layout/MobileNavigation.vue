<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import { useSlidingIndicator } from '@/composables/use-sliding-indicator'
import { useVisibleNavigation } from '@/composables/use-visible-navigation'

type PillState = 'current' | 'other'

const route = useRoute()
const { visibleDestinations } = useVisibleNavigation()

const navigationElement = ref<HTMLElement>()
const { indicatorStyle, hasMeasuredOnce } = useSlidingIndicator(navigationElement, {
  shouldScrollActiveIntoView: true,
})

const pillClassesByState: Record<PillState, string> = {
  current: 'text-white',
  other: 'bg-white text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300',
}

const currentRouteName = computed(() => route.meta.navigationRouteName ?? route.name)

function readPillState(routeName: string): PillState {
  return currentRouteName.value === routeName ? 'current' : 'other'
}
</script>

<template>
  <nav
    ref="navigationElement"
    class="scrollbar-hidden relative overflow-x-auto px-4 py-2.5 lg:hidden"
    aria-label="Seções do app"
  >
    <span
      class="absolute top-0 left-0 rounded-full bg-brand-600 shadow-brand dark:bg-brand-500"
      :class="{
        'transition-all duration-500 ease-spring motion-reduce:transition-none': hasMeasuredOnce,
      }"
      :style="indicatorStyle"
      aria-hidden="true"
    />
    <StaggeredTransitionGroup class="flex w-max gap-1.5" direction="left">
      <RouterLink
        v-for="(destination, destinationPosition) in visibleDestinations"
        :key="destination.routeName"
        :to="{ name: destination.routeName }"
        :data-stagger-index="destinationPosition"
        class="relative shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95"
        :class="pillClassesByState[readPillState(destination.routeName)]"
        :aria-current="readPillState(destination.routeName) === 'current' ? 'page' : undefined"
      >
        {{ destination.shortLabel }}
      </RouterLink>
    </StaggeredTransitionGroup>
  </nav>
</template>
