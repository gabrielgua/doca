<script setup lang="ts">
import { computed } from 'vue'
import { usePreferredReducedMotion, useTimeoutFn } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Toast, ToastTone } from '@/stores/toast-store'
import {
  CloseIcon,
  ErrorIcon,
  InformationIcon,
  NotificationIcon,
  SuccessIcon,
  WarningIcon,
  type AppIcon,
} from '@/theme/app-icons'

interface BaseToastProps {
  toast: Toast
}

const props = defineProps<BaseToastProps>()

const emit = defineEmits<{
  dismissRequested: []
}>()

interface ToneStyle {
  icon: AppIcon
  iconClasses: string
  countdownClasses: string
}

const toneStyleByTone: Record<ToastTone, ToneStyle> = {
  success: {
    icon: SuccessIcon,
    iconClasses: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400',
    countdownClasses: 'bg-success-500',
  },
  danger: {
    icon: ErrorIcon,
    iconClasses: 'bg-danger-100 text-danger-600 dark:bg-danger-950 dark:text-danger-400',
    countdownClasses: 'bg-danger-500',
  },
  warning: {
    icon: WarningIcon,
    iconClasses: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
    countdownClasses: 'bg-warning-500',
  },
  info: {
    icon: InformationIcon,
    iconClasses: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    countdownClasses: 'bg-brand-500',
  },
  neutral: {
    icon: NotificationIcon,
    iconClasses: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    countdownClasses: 'bg-neutral-400',
  },
}

const preferredMotion = usePreferredReducedMotion()

const toneStyle = computed(() => toneStyleByTone[props.toast.tone])
const isUrgent = computed(() => props.toast.tone === 'danger' || props.toast.tone === 'warning')
const countdownStyle = computed(() => ({
  animationDuration: `${props.toast.durationInMilliseconds}ms`,
}))

useTimeoutFn(
  () => {
    if (preferredMotion.value === 'reduce') {
      emit('dismissRequested')
    }
  },
  () => props.toast.durationInMilliseconds,
)

function handleCountdownEnd() {
  if (preferredMotion.value !== 'reduce') {
    emit('dismissRequested')
  }
}

function handleActionClick() {
  props.toast.action?.onSelected()
  emit('dismissRequested')
}
</script>

<template>
  <div
    class="group relative flex w-full items-start gap-3 overflow-hidden rounded-card bg-white p-3.5 pr-2.5 shadow-lift ring-1 ring-neutral-900/5 sm:w-96 dark:bg-neutral-900 dark:ring-white/10"
    :role="isUrgent ? 'alert' : 'status'"
  >
    <span class="relative inline-flex shrink-0">
      <BaseAvatar
        v-if="toast.person"
        :name="toast.person.name"
        :image-url="toast.person.imageUrl"
      />
      <span
        v-else
        class="grid size-10 animate-icon-pop place-items-center rounded-full"
        :class="toneStyle.iconClasses"
      >
        <BaseIcon :icon="toneStyle.icon" size="md" />
      </span>
      <span
        v-if="toast.person"
        class="absolute -right-1 -bottom-1 grid size-5 animate-icon-pop place-items-center rounded-full ring-2 ring-white dark:ring-neutral-900"
        :class="toneStyle.iconClasses"
        aria-hidden="true"
      >
        <BaseIcon :icon="toneStyle.icon" size="xs" />
      </span>
    </span>

    <div class="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
      <BaseText size="sm" weight="bold">{{ toast.title }}</BaseText>
      <BaseText v-if="toast.description" size="sm" tone="muted" class="line-clamp-2">
        {{ toast.description }}
      </BaseText>
      <button
        v-if="toast.action"
        type="button"
        class="mt-1.5 w-fit cursor-pointer rounded-lg text-sm font-bold text-brand-600 transition-bouncy hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95 dark:text-brand-400 dark:hover:text-brand-300"
        @click="handleActionClick"
      >
        {{ toast.action.label }}
      </button>
    </div>

    <BaseIconButton
      :icon="CloseIcon"
      accessible-label="Fechar"
      tooltip-placement="bottom"
      variant="neutral"
      appearance="ghost"
      size="sm"
      class="shrink-0"
      @click="emit('dismissRequested')"
    />

    <span
      v-if="preferredMotion !== 'reduce'"
      class="absolute inset-x-0 bottom-0 h-1 origin-left animate-shrink-to-start opacity-60 group-focus-within:animation-paused group-hover:animation-paused"
      :class="toneStyle.countdownClasses"
      :style="countdownStyle"
      aria-hidden="true"
      @animationend="handleCountdownEnd"
    />
  </div>
</template>
