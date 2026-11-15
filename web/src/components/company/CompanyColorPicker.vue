<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { SelectedIcon } from '@/theme/app-icons'
import { COMPANY_COLORS, COMPANY_COLOR_NAMES, type CompanyColor } from '@/theme/company-colors'

const selectedColor = defineModel<CompanyColor>({ default: 'sky' })

const swatchClassesByColor: Record<CompanyColor, string> = {
  sky: 'bg-sky-600 ring-sky-300',
  emerald: 'bg-emerald-600 ring-emerald-300',
  violet: 'bg-violet-600 ring-violet-300',
  amber: 'bg-amber-500 ring-amber-300',
  rose: 'bg-rose-600 ring-rose-300',
  indigo: 'bg-indigo-600 ring-indigo-300',
  teal: 'bg-teal-600 ring-teal-300',
  orange: 'bg-orange-600 ring-orange-300',
}
</script>

<template>
  <fieldset class="flex flex-col gap-2">
    <BaseText as="span" size="sm" weight="semibold">Cor</BaseText>
    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="color in COMPANY_COLORS"
        :key="color"
        type="button"
        class="grid size-9 cursor-pointer place-items-center rounded-full text-white transition-bouncy hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
        :class="[swatchClassesByColor[color], { 'scale-110 ring-4': selectedColor === color }]"
        :aria-label="COMPANY_COLOR_NAMES[color]"
        :aria-pressed="selectedColor === color"
        @click="selectedColor = color"
      >
        <BaseIcon
          v-if="selectedColor === color"
          :icon="SelectedIcon"
          size="sm"
          class="animate-icon-pop"
        />
      </button>
    </div>
  </fieldset>
</template>
