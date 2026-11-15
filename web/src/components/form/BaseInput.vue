<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { useFormFieldAccessibility } from '@/composables/use-form-field-accessibility'
import {
  countSignificantCharacters,
  findPositionAfterSignificantCharacters,
  INPUT_MASKS,
  keepSignificantCharacters,
  type InputMaskName,
} from '@/formatting/input-masks'
import { HidePasswordIcon, ShowPasswordIcon, type AppIcon } from '@/theme/app-icons'
import type { FieldStatus } from '@/theme/color-variants'
import { iconSizeByControlSize, type ControlSize } from '@/theme/component-sizes'
import BaseFormField from './BaseFormField.vue'

export type InputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number'

interface BaseInputProps {
  label?: string
  hint?: string
  statusMessage?: string
  status?: FieldStatus
  size?: ControlSize
  type?: InputType
  placeholder?: string
  autocomplete?: string
  leadingIcon?: AppIcon
  mask?: InputMaskName
  prefix?: string
  suffix?: string
  isRequired?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  label: undefined,
  hint: undefined,
  statusMessage: undefined,
  status: 'default',
  size: 'md',
  type: 'text',
  placeholder: undefined,
  autocomplete: undefined,
  leadingIcon: undefined,
  mask: undefined,
  prefix: undefined,
  suffix: undefined,
  isRequired: false,
  isDisabled: false,
  isReadOnly: false,
})

const inputValue = defineModel<string>({ default: '' })

const { controlId, messageId, describedById, isInvalid } = useFormFieldAccessibility({
  hint: () => props.hint,
  statusMessage: () => props.statusMessage,
  status: () => props.status,
})

const leadingIconToneClassesByStatus: Record<FieldStatus, string> = {
  default: 'text-neutral-400 dark:text-neutral-500',
  danger: 'text-danger-500 dark:text-danger-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
}

const isPasswordVisible = ref(false)
const isPasswordInput = computed(() => props.type === 'password')
const renderedInputType = computed(() =>
  isPasswordInput.value && isPasswordVisible.value ? 'text' : props.type,
)
const passwordToggleLabel = computed(() =>
  isPasswordVisible.value ? 'Esconder senha' : 'Mostrar senha',
)
const passwordToggleIcon = computed(() =>
  isPasswordVisible.value ? HidePasswordIcon : ShowPasswordIcon,
)
const iconSize = computed(() => iconSizeByControlSize[props.size])

const inputElement = useTemplateRef<HTMLInputElement>('input')
const activeMask = computed(() => (props.mask ? INPUT_MASKS[props.mask] : undefined))
const displayedText = ref('')
const visiblePrefix = computed(() => props.prefix ?? activeMask.value?.prefix)
const visibleSuffix = computed(() => props.suffix ?? activeMask.value?.suffix)
const visiblePlaceholder = computed(() => props.placeholder ?? activeMask.value?.placeholder)
const visibleAutocomplete = computed(() => props.autocomplete ?? activeMask.value?.autocomplete)

let lastEmittedModelValue: string | undefined

watch(
  [inputValue, activeMask],
  ([modelValue, mask]) => {
    if (!mask) {
      displayedText.value = modelValue
      return
    }
    if (modelValue === lastEmittedModelValue) {
      return
    }
    displayedText.value = mask.formatModelValue(modelValue)
    lastEmittedModelValue = modelValue
  },
  { immediate: true },
)

function readTypedTextForMask(typedText: string, inputType: string, caretPosition: number) {
  const mask = activeMask.value
  if (!mask || inputType !== 'deleteContentBackward') {
    return { typedText, caretPosition }
  }
  const { isSignificantCharacter } = mask
  const significantBefore = keepSignificantCharacters(displayedText.value, isSignificantCharacter)
  const significantAfter = keepSignificantCharacters(typedText, isSignificantCharacter)
  if (significantBefore !== significantAfter) {
    return { typedText, caretPosition }
  }
  const significantCountBeforeCaret = countSignificantCharacters(
    typedText,
    caretPosition,
    isSignificantCharacter,
  )
  if (significantCountBeforeCaret === 0) {
    return { typedText, caretPosition }
  }
  const textWithoutDeletedCharacter =
    significantAfter.slice(0, significantCountBeforeCaret - 1) +
    significantAfter.slice(significantCountBeforeCaret)
  return {
    typedText: textWithoutDeletedCharacter,
    caretPosition: findPositionAfterSignificantCharacters(
      textWithoutDeletedCharacter,
      significantCountBeforeCaret - 1,
      isSignificantCharacter,
    ),
  }
}

function handleInput(event: Event) {
  const element = event.target as HTMLInputElement
  const mask = activeMask.value
  if (!mask) {
    inputValue.value = element.value
    return
  }
  const { typedText, caretPosition } = readTypedTextForMask(
    element.value,
    (event as InputEvent).inputType ?? '',
    element.selectionStart ?? element.value.length,
  )
  const significantCountBeforeCaret = countSignificantCharacters(
    typedText,
    caretPosition,
    mask.isSignificantCharacter,
  )
  const formattedText = mask.formatTypedText(typedText)
  displayedText.value = formattedText
  element.value = formattedText
  const nextCaretPosition =
    mask.caretPlacement === 'always-at-end'
      ? formattedText.length
      : findPositionAfterSignificantCharacters(
          formattedText,
          significantCountBeforeCaret,
          mask.isSignificantCharacter,
        )
  if (document.activeElement === element) {
    element.setSelectionRange(nextCaretPosition, nextCaretPosition)
  }
  const modelValue = mask.readModelValue(formattedText)
  lastEmittedModelValue = modelValue
  inputValue.value = modelValue
}

function focusInput() {
  inputElement.value?.focus()
}

defineExpose({ focusInput })

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}
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
    <BaseIcon
      v-if="leadingIcon"
      :icon="leadingIcon"
      :size="iconSize"
      :class="leadingIconToneClassesByStatus[status]"
    />
    <span
      v-if="visiblePrefix"
      class="shrink-0 font-semibold text-neutral-400 select-none dark:text-neutral-500"
      aria-hidden="true"
    >
      {{ visiblePrefix }}
    </span>
    <input
      :id="controlId"
      ref="input"
      :value="displayedText"
      :type="mask ? 'text' : renderedInputType"
      :inputmode="activeMask?.keyboard"
      :placeholder="visiblePlaceholder"
      :autocomplete="visibleAutocomplete"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :aria-invalid="isInvalid"
      :aria-describedby="describedById"
      :class="[controlClasses, { 'tabular-nums': mask }]"
      @input="handleInput"
    />
    <span
      v-if="visibleSuffix"
      class="shrink-0 font-semibold text-neutral-400 select-none dark:text-neutral-500"
      aria-hidden="true"
    >
      {{ visibleSuffix }}
    </span>
    <BaseIconButton
      v-if="isPasswordInput"
      :icon="passwordToggleIcon"
      :accessible-label="passwordToggleLabel"
      :is-pressed="isPasswordVisible"
      :is-disabled="isDisabled"
      variant="neutral"
      appearance="ghost"
      size="sm"
      class="-mr-2 sm:-mr-1.5"
      @click="togglePasswordVisibility"
    />
    <slot name="trailing" />
  </BaseFormField>
</template>
