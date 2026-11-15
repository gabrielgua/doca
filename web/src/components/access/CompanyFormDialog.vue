<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import CompanyAvatar from '@/components/company/CompanyAvatar.vue'
import CompanyColorPicker from '@/components/company/CompanyColorPicker.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { isValidCnpj } from '@/formatting/brazilian-documents'
import type { Company } from '@/services/companies-service'
import { describeError } from '@/services/describe-error'
import { useCompaniesStore } from '@/stores/companies-store'
import { useToastStore } from '@/stores/toast-store'
import type { CompanyColor } from '@/theme/company-colors'

interface CompanyFormDialogProps {
  editedCompany?: Company | null
}

const props = withDefaults(defineProps<CompanyFormDialogProps>(), {
  editedCompany: null,
})

const CNPJ_DIGIT_COUNT = 14

const isOpen = defineModel<boolean>('open', { default: false })

const companiesStore = useCompaniesStore()
const toastStore = useToastStore()

const formId = useId()
const companyName = ref('')
const companyCnpj = ref('')
const companyColor = ref<CompanyColor>('sky')
const isSaving = ref(false)
const hasTriedSaving = ref(false)
const errorMessage = ref<string>()

const isEditing = computed(() => props.editedCompany !== null)
const isCnpjIncomplete = computed(
  () => companyCnpj.value.length > 0 && companyCnpj.value.length < CNPJ_DIGIT_COUNT,
)
const isCnpjInvalid = computed(
  () =>
    (hasTriedSaving.value && isCnpjIncomplete.value) ||
    (companyCnpj.value.length === CNPJ_DIGIT_COUNT && !isValidCnpj(companyCnpj.value)),
)
const cnpjErrorMessage = computed(() =>
  isCnpjIncomplete.value
    ? 'O CNPJ precisa ter 14 números.'
    : 'Esse CNPJ não existe. Confira os números.',
)
const previewName = computed(() => companyName.value.trim() || 'Nova empresa')

watch(isOpen, (isNowOpen) => {
  if (!isNowOpen) {
    return
  }
  companyName.value = props.editedCompany?.name ?? ''
  companyCnpj.value = props.editedCompany?.cnpj ?? ''
  companyColor.value = props.editedCompany?.color ?? 'sky'
  errorMessage.value = undefined
  hasTriedSaving.value = false
})

async function handleSaveSubmit() {
  hasTriedSaving.value = true
  if (isCnpjInvalid.value) {
    return
  }
  isSaving.value = true
  errorMessage.value = undefined
  const companyFields = {
    name: companyName.value.trim(),
    cnpj: companyCnpj.value || null,
    color: companyColor.value,
  }
  try {
    if (props.editedCompany) {
      await companiesStore.editCompany(props.editedCompany.id, companyFields)
      toastStore.showToast({
        title: 'Empresa atualizada',
        description: companyFields.name,
        tone: 'success',
      })
    } else {
      const createdCompany = await companiesStore.addCompany(companyFields)
      toastStore.showToast({
        title: `${createdCompany.name} criada`,
        description: 'Agora vincule as pessoas que vão acessar a empresa.',
        tone: 'success',
      })
    }
    isOpen.value = false
  } catch (saveError) {
    errorMessage.value = describeError(saveError, 'Não foi possível salvar a empresa.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="isEditing ? 'Editar empresa' : 'Nova empresa'"
    :is-close-blocked="isSaving"
  >
    <form :id="formId" class="flex flex-col gap-5" @submit.prevent="handleSaveSubmit">
      <div class="flex items-center gap-3 rounded-tile bg-neutral-100 p-3 dark:bg-neutral-800">
        <CompanyAvatar
          :key="`${companyColor}-${previewName.charAt(0)}`"
          :name="previewName"
          :color="companyColor"
          size="lg"
          class="animate-icon-pop"
        />
        <BaseText weight="extrabold" class="truncate">{{ previewName }}</BaseText>
      </div>
      <BaseInput v-model="companyName" label="Nome" placeholder="Ex.: Wiiva" is-required />
      <BaseInput
        v-model="companyCnpj"
        label="CNPJ"
        mask="cnpj"
        hint="Opcional."
        :status="isCnpjInvalid ? 'danger' : 'default'"
        :status-message="isCnpjInvalid ? cnpjErrorMessage : undefined"
      />
      <CompanyColorPicker v-model="companyColor" />
      <BaseText v-if="errorMessage" size="sm" tone="danger" weight="medium" role="alert">
        {{ errorMessage }}
      </BaseText>
    </form>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="ghost"
        :is-disabled="isSaving"
        @click="isOpen = false"
      >
        Cancelar
      </BaseButton>
      <BaseButton type="submit" :form="formId" :is-loading="isSaving">
        {{ isEditing ? 'Salvar' : 'Criar empresa' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>
