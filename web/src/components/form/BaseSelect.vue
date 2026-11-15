<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { onClickOutside, useElementBounding, useWindowSize } from '@vueuse/core'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useFormFieldAccessibility } from '@/composables/use-form-field-accessibility'
import { OpenMenuIcon, SelectedIcon } from '@/theme/app-icons'
import type { FieldStatus } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'
import BaseFormField from './BaseFormField.vue'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface BaseSelectProps {
  options: SelectOption[]
  label?: string
  hint?: string
  placeholder?: string
  statusMessage?: string
  status?: FieldStatus
  size?: ControlSize
  isRequired?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<BaseSelectProps>(), {
  label: undefined,
  hint: undefined,
  placeholder: 'Escolha uma opção',
  statusMessage: undefined,
  status: 'default',
  size: 'md',
  isRequired: false,
  isDisabled: false,
})

const selectedValue = defineModel<string>({ default: '' })

const LIST_GAP_PIXELS = 8
const ESTIMATED_OPTION_HEIGHT_PIXELS = 56
const LIST_PADDING_PIXELS = 16

const { controlId, messageId, describedById, isInvalid } = useFormFieldAccessibility({
  hint: () => props.hint,
  statusMessage: () => props.statusMessage,
  status: () => props.status,
})

const listboxId = useId()
const triggerElement = ref<HTMLButtonElement>()
const popoverElement = ref<HTMLElement>()
const fieldElement = computed(() => triggerElement.value?.parentElement ?? undefined)
const isOpen = ref(false)
const highlightedPosition = ref(0)

const fieldBounds = useElementBounding(fieldElement)
const { height: windowHeight } = useWindowSize()

const selectedOption = computed(() =>
  props.options.find((option) => option.value === selectedValue.value),
)
const estimatedListHeight = computed(
  () => props.options.length * ESTIMATED_OPTION_HEIGHT_PIXELS + LIST_PADDING_PIXELS,
)
const shouldOpenUpward = computed(() => {
  const spaceBelow = windowHeight.value - fieldBounds.bottom.value
  return spaceBelow < estimatedListHeight.value && fieldBounds.top.value > spaceBelow
})
const popoverPositionStyle = computed(() => ({
  left: `${fieldBounds.left.value}px`,
  width: `${fieldBounds.width.value}px`,
  top: shouldOpenUpward.value ? 'auto' : `${fieldBounds.bottom.value + LIST_GAP_PIXELS}px`,
  bottom: shouldOpenUpward.value
    ? `${windowHeight.value - fieldBounds.top.value + LIST_GAP_PIXELS}px`
    : 'auto',
}))
const highlightedOptionId = computed(() =>
  isOpen.value ? `${listboxId}-option-${highlightedPosition.value}` : undefined,
)

function openList() {
  if (props.isDisabled || props.options.length === 0) {
    return
  }
  const selectedPosition = props.options.findIndex((option) => option.value === selectedValue.value)
  highlightedPosition.value = Math.max(selectedPosition, 0)
  fieldBounds.update()
  isOpen.value = true
}

function closeList() {
  isOpen.value = false
}

function selectOption(option: SelectOption) {
  selectedValue.value = option.value
  closeList()
  triggerElement.value?.focus()
}

function moveHighlight(step: number) {
  const optionCount = props.options.length
  highlightedPosition.value = (highlightedPosition.value + step + optionCount) % optionCount
}

function handleTriggerClick() {
  if (isOpen.value) {
    closeList()
    return
  }
  openList()
}

function handleTriggerKeydown(keyboardEvent: KeyboardEvent) {
  const highlightedOption = props.options[highlightedPosition.value]
  if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
    keyboardEvent.preventDefault()
    if (!isOpen.value) {
      openList()
      return
    }
    moveHighlight(keyboardEvent.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (keyboardEvent.key === 'Home' || keyboardEvent.key === 'End') {
    keyboardEvent.preventDefault()
    highlightedPosition.value = keyboardEvent.key === 'Home' ? 0 : props.options.length - 1
    return
  }
  if ((keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') && isOpen.value) {
    keyboardEvent.preventDefault()
    if (highlightedOption) {
      selectOption(highlightedOption)
    }
    return
  }
  if (keyboardEvent.key === 'Escape' && isOpen.value) {
    keyboardEvent.preventDefault()
    closeList()
    return
  }
  if (keyboardEvent.key === 'Tab') {
    closeList()
  }
}

onClickOutside(popoverElement, closeList, { ignore: [triggerElement] })

watch(isOpen, async (isNowOpen) => {
  await nextTick()
  if (isNowOpen) {
    popoverElement.value?.showPopover()
    return
  }
  popoverElement.value?.hidePopover()
})
</script>

<template>
  <BaseFormField
    v-slot="{ controlClasses }"
    :control-id="controlId"
    :message-id="messageId"
    :label="label"
    :hint="hint"
    :status-message="statusMessage"
    :status="status"
    :size="size"
    :is-required="isRequired"
    :is-disabled="isDisabled"
    line-mode="single-line"
  >
    <button
      :id="controlId"
      ref="triggerElement"
      type="button"
      role="combobox"
      class="flex h-full cursor-pointer items-center gap-2 text-left"
      :class="controlClasses"
      :disabled="isDisabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="highlightedOptionId"
      :aria-invalid="isInvalid"
      :aria-describedby="describedById"
      :aria-required="isRequired"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
    >
      <span
        class="min-w-0 flex-1 truncate"
        :class="{ 'text-neutral-400 dark:text-neutral-500': !selectedOption }"
      >
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <span
        class="grid size-6 shrink-0 place-items-center rounded-full text-neutral-400 transition-bouncy"
        :class="{ 'rotate-180 bg-brand-50 text-brand-600 dark:bg-brand-950': isOpen }"
      >
        <BaseIcon :icon="OpenMenuIcon" size="sm" />
      </span>
    </button>
    <input
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      :value="selectedValue"
      :required="isRequired"
      @focus="triggerElement?.focus()"
    />

    <div
      ref="popoverElement"
      popover="manual"
      class="fixed inset-auto m-0 overflow-hidden rounded-tile bg-white p-1.5 opacity-100 shadow-lift ring-1 ring-neutral-200 transition-bouncy starting:scale-95 starting:opacity-0 motion-reduce:transition-none dark:bg-neutral-900 dark:ring-neutral-700"
      :class="
        shouldOpenUpward
          ? 'origin-bottom starting:translate-y-1'
          : 'origin-top starting:-translate-y-1'
      "
      :style="popoverPositionStyle"
    >
      <StaggeredTransitionGroup
        :id="listboxId"
        tag="ul"
        role="listbox"
        class="flex flex-col gap-0.5"
        :delay-between-items-in-milliseconds="35"
        :aria-label="label"
      >
        <template v-if="isOpen">
          <li
            v-for="(option, optionPosition) in options"
            :id="`${listboxId}-option-${optionPosition}`"
            :key="option.value"
            :data-stagger-index="optionPosition"
            role="option"
            :aria-selected="option.value === selectedValue"
            class="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 transition-colors duration-150"
            :class="
              optionPosition === highlightedPosition
                ? 'bg-brand-50 dark:bg-brand-950'
                : 'bg-transparent'
            "
            @pointerenter="highlightedPosition = optionPosition"
            @mousedown.prevent
            @click="selectOption(option)"
          >
            <span class="min-w-0 flex-1">
              <BaseText
                as="span"
                size="sm"
                weight="bold"
                class="block truncate"
                :tone="option.value === selectedValue ? 'brand' : 'default'"
              >
                {{ option.label }}
              </BaseText>
              <BaseText
                v-if="option.description"
                as="span"
                size="caption"
                tone="subtle"
                class="block truncate"
              >
                {{ option.description }}
              </BaseText>
            </span>
            <BaseIcon
              v-if="option.value === selectedValue"
              :icon="SelectedIcon"
              size="sm"
              class="animate-icon-pop text-brand-600 dark:text-brand-400"
            />
          </li>
        </template>
      </StaggeredTransitionGroup>
    </div>
  </BaseFormField>
</template>
