<script setup lang="ts">
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import type { useCompanyAccessDirectory } from '@/composables/use-company-access-directory'
import { CloseIcon } from '@/theme/app-icons'
import InviteMemberDialog from './InviteMemberDialog.vue'

interface CompanyAccessDialogsProps {
  companyAccessDirectory: ReturnType<typeof useCompanyAccessDirectory>
}

const props = defineProps<CompanyAccessDialogsProps>()

const {
  inviteTargetCompany,
  isInviteDialogOpen,
  isInviting,
  inviteErrorMessage,
  isUnlinkConfirmationOpen,
  unlinkDescription,
  isUnlinking,
  inviteMember,
  confirmUnlink,
} = props.companyAccessDirectory
</script>

<template>
  <InviteMemberDialog
    v-if="inviteTargetCompany"
    v-model:open="isInviteDialogOpen"
    :company="inviteTargetCompany"
    :is-submitting="isInviting"
    :error-message="inviteErrorMessage"
    @submitted="inviteMember"
  />
  <ConfirmActionModal
    v-model:open="isUnlinkConfirmationOpen"
    title="Remover acesso?"
    :description="unlinkDescription"
    confirm-label="Remover acesso"
    :icon="CloseIcon"
    variant="danger"
    :is-submitting="isUnlinking"
    @confirmed="confirmUnlink"
  />
</template>
