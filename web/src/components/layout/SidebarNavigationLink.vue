<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseTooltip from '@/components/tooltip/BaseTooltip.vue'
import type { NavigationDestination } from './navigation-destinations'

interface SidebarNavigationLinkProps {
  destination: NavigationDestination
  isCollapsed?: boolean
}

const props = withDefaults(defineProps<SidebarNavigationLinkProps>(), {
  isCollapsed: false,
})

type LinkState = 'current' | 'other'

const route = useRoute()

const isCurrentPage = computed(
  () => (route.meta.navigationRouteName ?? route.name) === props.destination.routeName,
)
const linkState = computed<LinkState>(() => (isCurrentPage.value ? 'current' : 'other'))

const linkClassesByState: Record<LinkState, string> = {
  current: 'text-brand-700 dark:text-brand-300',
  other:
    'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
}

const iconBoxClassesByState: Record<LinkState, string> = {
  current: 'animate-icon-pop bg-brand-600 text-white shadow-brand dark:bg-brand-500',
  other: 'bg-neutral-100 group-hover:-rotate-6 group-hover:scale-110 dark:bg-neutral-800',
}
</script>

<template>
  <BaseTooltip :text="destination.label" placement="right" :is-disabled="!isCollapsed">
    <RouterLink
      :to="{ name: destination.routeName }"
      class="group relative flex w-full items-center gap-3 rounded-control p-1.5 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="[linkClassesByState[linkState], { 'justify-center': isCollapsed }]"
      :aria-current="isCurrentPage ? 'page' : undefined"
      :aria-label="isCollapsed ? destination.label : undefined"
    >
      <span
        class="grid size-9.5 shrink-0 place-items-center rounded-xl transition-bouncy"
        :class="iconBoxClassesByState[linkState]"
      >
        <BaseIcon :icon="destination.icon" size="sm" />
      </span>
      <Transition
        enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
        enter-from-class="-translate-x-2 opacity-0"
        leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <span v-if="!isCollapsed" class="flex min-w-0 flex-1 items-center gap-2">
          <span class="min-w-0 flex-1 truncate text-sm">{{ destination.label }}</span>
          <span
            v-if="destination.comingSoonLabel"
            class="rounded-full bg-accent-50 px-2 py-0.5 text-caption font-bold text-accent-600 dark:bg-accent-950 dark:text-accent-500"
          >
            {{ destination.comingSoonLabel }}
          </span>
        </span>
      </Transition>
    </RouterLink>
  </BaseTooltip>
</template>
