<script setup lang="ts">
import { computed, ref } from 'vue'
import CompanySwitcher from '@/components/company/CompanySwitcher.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseTooltip from '@/components/tooltip/BaseTooltip.vue'
import { useSlidingIndicator } from '@/composables/use-sliding-indicator'
import { useVisibleNavigation } from '@/composables/use-visible-navigation'
import { useSidebarStore } from '@/stores/sidebar-store'
import { CollapseSidebarIcon } from '@/theme/app-icons'
import AppBrandMark from './AppBrandMark.vue'
import { NAVIGATION_SECTION_TITLES, type NavigationDestination } from './navigation-destinations'
import SidebarNavigationLink from './SidebarNavigationLink.vue'
import SidebarSectionTitle from './SidebarSectionTitle.vue'

type SidebarEntry =
  | { kind: 'section-title'; key: string; title: string; staggerIndex: number }
  | { kind: 'link'; key: string; destination: NavigationDestination; staggerIndex: number }

const sidebarStore = useSidebarStore()
const { visibleSections } = useVisibleNavigation()

const navigationElement = ref<HTMLElement>()
const { indicatorStyle, hasMeasuredOnce } = useSlidingIndicator(navigationElement)

const collapseButtonLabel = computed(() =>
  sidebarStore.isCollapsed ? 'Expandir menu' : 'Recolher menu',
)

const sidebarEntries = computed<SidebarEntry[]>(() => {
  let staggerIndex = 0
  return visibleSections.value.flatMap((sectionGroup) => [
    {
      kind: 'section-title' as const,
      key: `title-${sectionGroup.section}`,
      title: NAVIGATION_SECTION_TITLES[sectionGroup.section],
      staggerIndex: staggerIndex++,
    },
    ...sectionGroup.destinations.map((destination) => ({
      kind: 'link' as const,
      key: destination.routeName,
      destination,
      staggerIndex: staggerIndex++,
    })),
  ])
})
</script>

<template>
  <div class="sticky top-0 hidden h-dvh shrink-0 py-3.5 pl-3.5 lg:block">
    <aside
      class="flex h-full flex-col gap-1 rounded-card bg-white px-4 py-5 shadow-card transition-all duration-500 ease-spring motion-reduce:transition-none dark:bg-neutral-900"
      :class="sidebarStore.isCollapsed ? 'w-21' : 'w-64'"
      aria-label="Navegação principal"
    >
      <div
        class="animate-pop-in px-1.5 pb-4"
        :class="{ 'flex justify-center': sidebarStore.isCollapsed }"
      >
        <AppBrandMark :is-wordmark-visible="!sidebarStore.isCollapsed" />
      </div>

      <div class="relative z-20 animate-rise-in pb-1">
        <CompanySwitcher :is-compact="sidebarStore.isCollapsed" />
      </div>

      <nav ref="navigationElement" class="relative" aria-label="Seções do app">
        <span
          class="absolute top-0 left-0 rounded-control bg-brand-50 dark:bg-brand-950"
          :class="{
            'transition-all duration-500 ease-spring motion-reduce:transition-none':
              hasMeasuredOnce,
          }"
          :style="indicatorStyle"
          aria-hidden="true"
        />
        <StaggeredTransitionGroup class="flex flex-col gap-1" direction="right">
          <template v-for="sidebarEntry in sidebarEntries" :key="sidebarEntry.key">
            <SidebarSectionTitle
              v-if="sidebarEntry.kind === 'section-title' && !sidebarStore.isCollapsed"
              :data-stagger-index="sidebarEntry.staggerIndex"
            >
              {{ sidebarEntry.title }}
            </SidebarSectionTitle>
            <SidebarNavigationLink
              v-else-if="sidebarEntry.kind === 'link'"
              :destination="sidebarEntry.destination"
              :is-collapsed="sidebarStore.isCollapsed"
              :data-stagger-index="sidebarEntry.staggerIndex"
            />
          </template>
        </StaggeredTransitionGroup>
      </nav>

      <div class="mt-auto pt-3">
        <BaseTooltip
          :text="collapseButtonLabel"
          placement="right"
          :is-disabled="!sidebarStore.isCollapsed"
        >
          <button
            type="button"
            class="group flex w-full cursor-pointer items-center gap-3 rounded-control p-1.5 text-sm font-semibold text-neutral-600 transition duration-200 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            :class="{ 'justify-center': sidebarStore.isCollapsed }"
            :aria-label="collapseButtonLabel"
            :aria-expanded="!sidebarStore.isCollapsed"
            @click="sidebarStore.toggleCollapsed()"
          >
            <span
              class="grid size-9.5 shrink-0 place-items-center rounded-xl bg-neutral-100 transition-bouncy dark:bg-neutral-800"
              :class="{ 'rotate-180': sidebarStore.isCollapsed }"
            >
              <BaseIcon :icon="CollapseSidebarIcon" size="sm" />
            </span>
            <Transition
              enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
              enter-from-class="-translate-x-2 opacity-0"
              leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
              leave-to-class="opacity-0"
            >
              <span v-if="!sidebarStore.isCollapsed" class="whitespace-nowrap">
                {{ collapseButtonLabel }}
              </span>
            </Transition>
          </button>
        </BaseTooltip>
      </div>
    </aside>
  </div>
</template>
