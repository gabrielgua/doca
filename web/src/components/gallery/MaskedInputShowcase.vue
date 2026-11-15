<script setup lang="ts">
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import { isValidCnpj, isValidCpf, isValidCpfOrCnpj } from '@/formatting/brazilian-documents'
import type { InputMaskName } from '@/formatting/input-masks'
import MaskedInputSample from './MaskedInputSample.vue'

interface MaskedInputExample {
  mask: InputMaskName
  label: string
  hint: string
  validate?: (modelValue: string) => string | undefined
}

const CPF_LENGTH = 11
const CNPJ_LENGTH = 14

const MASKED_INPUT_EXAMPLES: MaskedInputExample[] = [
  {
    mask: 'cnpj',
    label: 'CNPJ',
    hint: 'Salva só os números e confere os dígitos.',
    validate: (digits) =>
      digits.length === CNPJ_LENGTH && !isValidCnpj(digits) ? 'Esse CNPJ não existe.' : undefined,
  },
  {
    mask: 'cpf',
    label: 'CPF',
    hint: 'Salva só os números e confere os dígitos.',
    validate: (digits) =>
      digits.length === CPF_LENGTH && !isValidCpf(digits) ? 'Esse CPF não existe.' : undefined,
  },
  {
    mask: 'cpf-or-cnpj',
    label: 'CPF ou CNPJ',
    hint: 'Troca de formato sozinho pelo tamanho.',
    validate: (digits) =>
      (digits.length === CPF_LENGTH || digits.length === CNPJ_LENGTH) && !isValidCpfOrCnpj(digits)
        ? 'Documento inválido.'
        : undefined,
  },
  { mask: 'phone', label: 'Telefone', hint: 'Fixo ou celular, com DDD.' },
  { mask: 'cep', label: 'CEP', hint: 'Salva os 8 números.' },
  { mask: 'date', label: 'Data', hint: 'Salva como 2026-11-15 quando a data existe.' },
  { mask: 'time', label: 'Horário', hint: 'Salva como 14:30 quando o horário existe.' },
  { mask: 'money', label: 'Valor', hint: 'Digite só números: os centavos entram primeiro.' },
  { mask: 'integer', label: 'Quantidade', hint: 'Números inteiros com ponto de milhar.' },
  { mask: 'decimal', label: 'Número decimal', hint: 'Use vírgula. Até 2 casas.' },
  { mask: 'percent', label: 'Porcentagem', hint: 'Até 2 casas decimais.' },
  { mask: 'weight', label: 'Peso', hint: 'Em quilos, até 3 casas.' },
  { mask: 'length', label: 'Medida', hint: 'Em centímetros, 1 casa.' },
  { mask: 'amazon-code', label: 'FNSKU / ASIN', hint: '10 letras e números, sempre maiúsculas.' },
]
</script>

<template>
  <StaggeredTransitionGroup
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    :delay-between-items-in-milliseconds="40"
  >
    <MaskedInputSample
      v-for="(example, examplePosition) in MASKED_INPUT_EXAMPLES"
      :key="example.mask"
      :data-stagger-index="examplePosition"
      :mask="example.mask"
      :label="example.label"
      :hint="example.hint"
      :validate="example.validate"
    />
  </StaggeredTransitionGroup>
</template>
