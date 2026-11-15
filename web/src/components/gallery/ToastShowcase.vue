<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useToastStore, type ToastContent } from '@/stores/toast-store'
import type { ColorVariant } from '@/theme/color-variants'

interface ToastExample {
  name: string
  buttonVariant: ColorVariant
  content: ToastContent
}

const toastStore = useToastStore()
const currentUserStore = useCurrentUserStore()

const TONE_EXAMPLES: ToastExample[] = [
  {
    name: 'Sucesso',
    buttonVariant: 'success',
    content: { tone: 'success', title: 'Produto salvo', description: 'Tri-Magnésio 60 cápsulas' },
  },
  {
    name: 'Erro',
    buttonVariant: 'danger',
    content: {
      tone: 'danger',
      title: 'Não foi possível salvar',
      description: 'Confira sua conexão e tente de novo.',
    },
  },
  {
    name: 'Atenção',
    buttonVariant: 'warning',
    content: {
      tone: 'warning',
      title: '3 produtos sem etiqueta',
      description: 'Envie os PDFs antes de agendar o envio.',
    },
  },
  {
    name: 'Informação',
    buttonVariant: 'primary',
    content: {
      tone: 'info',
      title: 'Agendamento na sexta, 13/11',
      description: 'A Amazon confirma o horário por email.',
    },
  },
  {
    name: 'Neutro',
    buttonVariant: 'neutral',
    content: { tone: 'neutral', title: 'Link copiado' },
  },
]

function showExample(content: ToastContent) {
  toastStore.showToast(content)
}

function showPersonToast() {
  toastStore.showToast({
    tone: 'success',
    title: 'Convite enviado',
    description: `${currentUserStore.displayName} já pode criar a senha.`,
    person: { name: currentUserStore.displayName },
  })
}

function showActionToast() {
  toastStore.showToast({
    tone: 'neutral',
    title: 'Produto excluído',
    description: 'Tri-Magnésio 60 cápsulas',
    action: {
      label: 'Desfazer',
      onSelected: () => toastStore.showToast({ tone: 'info', title: 'Exclusão desfeita' }),
    },
  })
}

function showLongToast() {
  toastStore.showToast({
    tone: 'warning',
    title: 'Um título bem comprido para ver como o toast quebra a linha quando precisa',
    description:
      'E uma descrição maior ainda, que passa de duas linhas e é cortada com reticências para o toast não crescer sem limite na tela de ninguém.',
  })
}

function showAllTones() {
  TONE_EXAMPLES.forEach((example, examplePosition) => {
    setTimeout(() => toastStore.showToast(example.content), examplePosition * 150)
  })
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Tons</BaseText>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-for="example in TONE_EXAMPLES"
          :key="example.name"
          :variant="example.buttonVariant"
          appearance="outlined"
          @click="showExample(example.content)"
        >
          {{ example.name }}
        </BaseButton>
      </div>
      <BaseText size="sm" tone="subtle">
        Some sozinho em 4,5 s (erro em 7 s). Passe o mouse para pausar a contagem.
      </BaseText>
    </BaseCard>

    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Variações</BaseText>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="neutral" appearance="outlined" @click="showPersonToast">
          Com pessoa
        </BaseButton>
        <BaseButton variant="neutral" appearance="outlined" @click="showActionToast">
          Com ação
        </BaseButton>
        <BaseButton variant="neutral" appearance="outlined" @click="showLongToast">
          Texto longo
        </BaseButton>
        <BaseButton @click="showAllTones">Todos de uma vez</BaseButton>
      </div>
      <BaseText size="sm" tone="subtle">Aparecem no máximo 4 por vez.</BaseText>
    </BaseCard>
  </div>
</template>
