<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import CompanyAvatar from '@/components/company/CompanyAvatar.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect, { type SelectOption } from '@/components/form/BaseSelect.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Company, CompanyMemberRole } from '@/services/companies-service'
import { EmailIcon, MagicLinkIcon, UserIcon } from '@/theme/app-icons'

export interface InviteMemberSubmission {
  email: string
  fullName: string
  role: CompanyMemberRole
}

interface InviteMemberDialogProps {
  company: Company
  isSubmitting?: boolean
  errorMessage?: string
}

withDefaults(defineProps<InviteMemberDialogProps>(), {
  isSubmitting: false,
  errorMessage: undefined,
})

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submitted: [submission: InviteMemberSubmission]
}>()

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'client', label: 'Cliente', description: 'Acompanha envios e baixa arquivos' },
  { value: 'manager', label: 'Gerente', description: 'Cria e edita envios, marcas e produtos' },
]

const formId = useId()
const email = ref('')
const fullName = ref('')
const role = ref<CompanyMemberRole>('client')

watch(isOpen, (isNowOpen) => {
  if (isNowOpen) {
    email.value = ''
    fullName.value = ''
    role.value = 'client'
  }
})

function handleInviteSubmit() {
  emit('submitted', {
    email: email.value.trim(),
    fullName: fullName.value.trim(),
    role: role.value,
  })
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" title="Vincular pessoa" :is-close-blocked="isSubmitting">
    <form :id="formId" @submit.prevent="handleInviteSubmit">
      <StaggeredTransitionGroup
        class="flex flex-col gap-4"
        :delay-between-items-in-milliseconds="50"
        :initial-delay-in-milliseconds="80"
      >
        <div
          key="company"
          :data-stagger-index="0"
          class="flex items-center gap-3 rounded-tile bg-neutral-100 p-3 dark:bg-neutral-800"
        >
          <CompanyAvatar :name="company.name" :color="company.color" />
          <div class="min-w-0 leading-tight">
            <BaseText as="span" size="caption" tone="subtle" weight="bold" class="block uppercase">
              Acesso à empresa
            </BaseText>
            <BaseText as="span" weight="extrabold" class="block truncate">
              {{ company.name }}
            </BaseText>
          </div>
        </div>
        <BaseInput
          key="email"
          v-model="email"
          :data-stagger-index="1"
          label="Email"
          type="email"
          placeholder="pessoa@empresa.com"
          hint="Quem ainda não tem conta recebe um convite por email."
          :leading-icon="EmailIcon"
          is-required
        />
        <BaseInput
          key="name"
          v-model="fullName"
          :data-stagger-index="2"
          label="Nome"
          placeholder="Opcional"
          :leading-icon="UserIcon"
        />
        <BaseSelect
          key="role"
          v-model="role"
          :data-stagger-index="3"
          label="Papel"
          :options="ROLE_OPTIONS"
        />
        <BaseText
          v-if="errorMessage"
          :key="errorMessage"
          :data-stagger-index="0"
          size="sm"
          tone="danger"
          weight="medium"
          role="alert"
        >
          {{ errorMessage }}
        </BaseText>
      </StaggeredTransitionGroup>
    </form>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="ghost"
        :is-disabled="isSubmitting"
        @click="isOpen = false"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        :form="formId"
        :leading-icon="MagicLinkIcon"
        :is-loading="isSubmitting"
      >
        Enviar convite
      </BaseButton>
    </template>
  </BaseDialog>
</template>
