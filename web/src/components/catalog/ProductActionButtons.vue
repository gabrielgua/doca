<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import { DeleteIcon, EditIcon } from '@/theme/app-icons'

interface ProductActionButtonsProps {
  productName: string
  canEdit?: boolean
  canDelete?: boolean
}

withDefaults(defineProps<ProductActionButtonsProps>(), {
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  editRequested: []
  deleteRequested: []
}>()
</script>

<template>
  <div v-if="canEdit || canDelete" class="flex shrink-0 gap-0.5">
    <BaseIconButton
      v-if="canEdit"
      :icon="EditIcon"
      :accessible-label="`Editar ${productName}`"
      variant="neutral"
      appearance="ghost"
      size="sm"
      @click="emit('editRequested')"
    />
    <BaseIconButton
      v-if="canDelete"
      :icon="DeleteIcon"
      :accessible-label="`Excluir ${productName}`"
      variant="danger"
      appearance="ghost"
      size="sm"
      @click="emit('deleteRequested')"
    />
  </div>
</template>
