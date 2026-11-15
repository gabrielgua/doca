<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import { BreadcrumbSeparatorIcon } from '@/theme/app-icons'

export interface Breadcrumb {
  label: string
}

interface PageBreadcrumbsProps {
  breadcrumbs: Breadcrumb[]
}

defineProps<PageBreadcrumbsProps>()
</script>

<template>
  <nav aria-label="Você está em">
    <StaggeredTransitionGroup
      tag="ol"
      direction="right"
      class="flex flex-wrap items-center gap-1.5 text-caption font-semibold text-neutral-400 dark:text-neutral-500"
    >
      <li
        v-for="(breadcrumb, breadcrumbPosition) in breadcrumbs"
        :key="breadcrumbPosition"
        :data-stagger-index="breadcrumbPosition"
        class="flex items-center gap-1.5"
      >
        <BaseIcon v-if="breadcrumbPosition > 0" :icon="BreadcrumbSeparatorIcon" size="xs" />
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
          enter-from-class="translate-y-1 opacity-0"
          leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
          leave-to-class="-translate-y-1 opacity-0"
        >
          <span
            :key="breadcrumb.label"
            class="inline-block"
            :class="{
              'text-brand-600 dark:text-brand-400': breadcrumbPosition === breadcrumbs.length - 1,
            }"
            :aria-current="breadcrumbPosition === breadcrumbs.length - 1 ? 'page' : undefined"
          >
            {{ breadcrumb.label }}
          </span>
        </Transition>
      </li>
    </StaggeredTransitionGroup>
  </nav>
</template>
