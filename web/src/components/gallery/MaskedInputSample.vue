<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { InputMaskName } from '@/formatting/input-masks'
import type { FieldStatus } from '@/theme/color-variants'

interface MaskedInputSampleProps {
  mask: InputMaskName
  label: string
  hint: string
  validate?: (modelValue: string) => string | undefined
}

const props = withDefaults(defineProps<MaskedInputSampleProps>(), {
  validate: undefined,
})

const modelValue = ref('')

const validationMessage = computed(() =>
  modelValue.value ? props.validate?.(modelValue.value) : undefined,
)
const fieldStatus = computed<FieldStatus>(() => (validationMessage.value ? 'danger' : 'default'))
</script>

<template>
  <BaseCard class="flex flex-col gap-3">
    <BaseInput
      v-model="modelValue"
      :mask="mask"
      :label="label"
      :hint="hint"
      :status="fieldStatus"
      :status-message="validationMessage"
    />
    <div
      class="flex items-center justify-between gap-2 rounded-control bg-neutral-100 px-3 py-2 dark:bg-neutral-800"
    >
      <BaseText as="span" size="caption" tone="subtle" weight="bold" class="uppercase">
        mask="{{ mask }}"
      </BaseText>
      <code class="truncate font-mono text-xs font-semibold text-brand-700 dark:text-brand-300">
        {{ modelValue ? JSON.stringify(modelValue) : 'vazio' }}
      </code>
    </div>
  </BaseCard>
</template>
