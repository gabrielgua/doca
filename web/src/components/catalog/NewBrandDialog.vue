<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Brand } from '@/services/catalog-service'
import { describeError } from '@/services/describe-error'
import { useCatalogStore } from '@/stores/catalog-store'
import { useCompaniesStore } from '@/stores/companies-store'
import { useToastStore } from '@/stores/toast-store'
import { AddIcon, CatalogIcon } from '@/theme/app-icons'

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: [brand: Brand]
}>()

const catalogStore = useCatalogStore()
const companiesStore = useCompaniesStore()
const toastStore = useToastStore()

const formId = useId()
const brandName = ref('')
const isSaving = ref(false)
const errorMessage = ref<string>()

watch(isOpen, (isNowOpen) => {
  if (isNowOpen) {
    brandName.value = ''
    errorMessage.value = undefined
  }
})

async function handleCreateSubmit() {
  isSaving.value = true
  errorMessage.value = undefined
  try {
    const createdBrand = await catalogStore.addBrand(brandName.value.trim())
    toastStore.showToast({ title: 'Marca criada', description: createdBrand.name, tone: 'success' })
    emit('created', createdBrand)
    isOpen.value = false
  } catch (createError) {
    errorMessage.value = describeError(createError, 'Não foi possível criar a marca.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" title="Nova marca" width="compact" :is-close-blocked="isSaving">
    <form :id="formId" class="flex flex-col gap-4" @submit.prevent="handleCreateSubmit">
      <BaseText size="sm" tone="muted">
        A marca fica dentro da {{ companiesStore.currentCompany?.name }}. Depois os produtos entram
        nela.
      </BaseText>
      <BaseInput
        v-model="brandName"
        label="Nome da marca"
        placeholder="Ex.: Wiiva Life"
        :leading-icon="CatalogIcon"
        is-required
      />
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
      <BaseButton type="submit" :form="formId" :leading-icon="AddIcon" :is-loading="isSaving">
        Criar marca
      </BaseButton>
    </template>
  </BaseDialog>
</template>
