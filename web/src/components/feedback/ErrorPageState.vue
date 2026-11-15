<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { BackIcon, HomeIcon } from '@/theme/app-icons'

interface ErrorPageStateProps {
  code: string
  title: string
  description: string
}

const props = defineProps<ErrorPageStateProps>()

const FLOAT_DELAY_STEP_MILLISECONDS = 300
const TILT_CLASSES = ['-rotate-6', 'rotate-3', '-rotate-3']

const router = useRouter()

const codeCharacters = computed(() => props.code.split(''))
const canGoBack = computed(() => window.history.length > 1)
</script>

<template>
  <div class="grid place-items-center py-16 lg:py-24">
    <StaggeredTransitionGroup
      class="flex max-w-md flex-col items-center gap-4 text-center"
      :delay-between-items-in-milliseconds="80"
    >
      <div key="code" :data-stagger-index="0" class="flex gap-3" aria-hidden="true">
        <span
          v-for="(character, characterPosition) in codeCharacters"
          :key="characterPosition"
          class="animate-float"
          :style="{ animationDelay: `${characterPosition * FLOAT_DELAY_STEP_MILLISECONDS}ms` }"
        >
          <span
            class="grid size-20 animate-pop-in place-items-center rounded-tile bg-white text-5xl font-extrabold text-brand-600 shadow-card sm:size-24 sm:text-6xl dark:bg-neutral-900 dark:text-brand-400"
            :class="TILT_CLASSES[characterPosition % TILT_CLASSES.length]"
          >
            {{ character }}
          </span>
        </span>
      </div>
      <BaseHeading key="title" :data-stagger-index="1" :level="1" size="section" class="mt-4">
        {{ title }}
      </BaseHeading>
      <BaseText key="description" :data-stagger-index="2" tone="muted">
        {{ description }}
      </BaseText>
      <div key="actions" :data-stagger-index="3" class="mt-2 flex flex-wrap justify-center gap-3">
        <BaseButton :leading-icon="HomeIcon" @click="router.push({ name: 'home' })">
          Voltar para o início
        </BaseButton>
        <BaseButton
          v-if="canGoBack"
          variant="neutral"
          appearance="ghost"
          :leading-icon="BackIcon"
          @click="router.back()"
        >
          Página anterior
        </BaseButton>
      </div>
    </StaggeredTransitionGroup>
  </div>
</template>
