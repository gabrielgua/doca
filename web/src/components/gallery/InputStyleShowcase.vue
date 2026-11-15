<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/card/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect, { type SelectOption } from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { EmailIcon, SearchIcon } from '@/theme/app-icons'

const SELECT_OPTIONS: SelectOption[] = [
  { value: 'admin', label: 'Admin', description: 'Faz tudo em todas as empresas.' },
  { value: 'manager', label: 'Gerente', description: 'Cria e edita nas empresas dele.' },
  { value: 'client', label: 'Cliente', description: 'Só acompanha.' },
]

const plainText = ref('')
const emailText = ref('')
const searchText = ref('')
const passwordText = ref('')
const urlText = ref('')
const smallText = ref('')
const mediumText = ref('')
const largeText = ref('')
const dangerText = ref('X00ABC')
const successText = ref('X00ABC1234')
const warningText = ref('Tri-Magnésio')
const disabledText = ref('Não dá para editar')
const readOnlyText = ref('Só leitura')
const notesText = ref('')
const selectedRole = ref('')
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Tipos</BaseText>
      <BaseInput v-model="plainText" label="Texto" placeholder="Qualquer coisa" is-required />
      <BaseInput
        v-model="emailText"
        type="email"
        label="Email com ícone"
        placeholder="voce@empresa.com"
        :leading-icon="EmailIcon"
      />
      <BaseInput
        v-model="searchText"
        type="search"
        placeholder="Buscar por nome"
        :leading-icon="SearchIcon"
      />
      <BaseInput v-model="passwordText" type="password" label="Senha" />
      <BaseInput
        v-model="urlText"
        type="url"
        label="Prefixo e sufixo livres"
        prefix="https://"
        suffix=".com.br"
        placeholder="sualoja"
      />
    </BaseCard>

    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Tamanhos</BaseText>
      <BaseInput v-model="smallText" size="sm" label="Pequeno" placeholder='size="sm"' />
      <BaseInput v-model="mediumText" label="Médio" placeholder='size="md" (padrão)' />
      <BaseInput v-model="largeText" size="lg" label="Grande" placeholder='size="lg"' />
      <BaseSelect
        v-model="selectedRole"
        label="Select"
        placeholder="Escolha um papel"
        :options="SELECT_OPTIONS"
      />
    </BaseCard>

    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Estados</BaseText>
      <BaseInput
        v-model="dangerText"
        label="Erro"
        status="danger"
        status-message="O FNSKU tem 10 letras e números."
      />
      <BaseInput
        v-model="successText"
        label="Sucesso"
        status="success"
        status-message="Código encontrado na Amazon."
      />
      <BaseInput
        v-model="warningText"
        label="Atenção"
        status="warning"
        status-message="Já existe um produto com esse nome."
      />
      <BaseInput v-model="disabledText" label="Desativado" is-disabled />
      <BaseInput v-model="readOnlyText" label="Somente leitura" is-read-only />
    </BaseCard>

    <BaseCard class="flex flex-col gap-4">
      <BaseText size="sm" weight="extrabold" tone="subtle" class="uppercase">Texto longo</BaseText>
      <BaseTextarea
        v-model="notesText"
        label="Observações"
        hint="Aparece no arquivo de informações do envio."
        placeholder="Ex.: caixa frágil"
        :maximum-length="280"
      />
    </BaseCard>
  </div>
</template>
