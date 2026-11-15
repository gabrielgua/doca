import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import type { InviteMemberSubmission } from '@/components/access/InviteMemberDialog.vue'
import {
  fetchCompanyAccessSummaries,
  inviteCompanyMember,
  unlinkCompanyMember,
  type Company,
  type CompanyAccessSummary,
  type CompanyMember,
} from '@/services/companies-service'
import { describeError } from '@/services/describe-error'
import { describeInviteError } from '@/services/describe-invite-error'
import { useToastStore } from '@/stores/toast-store'

interface PendingUnlink {
  company: Company
  member: CompanyMember
}

export function useCompanyAccessDirectory(companiesSource: MaybeRefOrGetter<Company[]>) {
  const toastStore = useToastStore()
  const router = useRouter()

  const summaryByCompanyId = ref(new Map<string, CompanyAccessSummary>())
  const isLoadingSummaries = ref(false)
  const loadErrorMessage = ref<string>()
  const inviteTargetCompany = ref<Company | null>(null)
  const isInviteDialogOpen = ref(false)
  const isInviting = ref(false)
  const inviteErrorMessage = ref<string>()
  const pendingUnlink = ref<PendingUnlink | null>(null)
  const isUnlinking = ref(false)

  const companyIds = computed(() => toValue(companiesSource).map((company) => company.id))

  const isUnlinkConfirmationOpen = computed({
    get: () => pendingUnlink.value !== null,
    set: (isNowOpen) => {
      if (!isNowOpen) {
        pendingUnlink.value = null
      }
    },
  })
  const unlinkDescription = computed(() => {
    if (!pendingUnlink.value) {
      return ''
    }
    const { company, member } = pendingUnlink.value
    return `${member.fullName ?? member.email ?? ''} deixa de ver a ${company.name}. A conta continua existindo.`
  })

  async function loadSummaries() {
    if (companyIds.value.length === 0) {
      summaryByCompanyId.value = new Map()
      return
    }
    isLoadingSummaries.value = true
    loadErrorMessage.value = undefined
    try {
      summaryByCompanyId.value = await fetchCompanyAccessSummaries(companyIds.value)
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Não foi possível carregar os acessos.')
    } finally {
      isLoadingSummaries.value = false
    }
  }

  function readSummary(companyId: string): CompanyAccessSummary | undefined {
    return summaryByCompanyId.value.get(companyId)
  }

  function openInviteDialog(company: Company) {
    inviteErrorMessage.value = undefined
    inviteTargetCompany.value = company
    isInviteDialogOpen.value = true
  }

  async function inviteMember(submission: InviteMemberSubmission) {
    const company = inviteTargetCompany.value
    if (!company) {
      return
    }
    isInviting.value = true
    inviteErrorMessage.value = undefined
    try {
      const invitationResult = await inviteCompanyMember({ companyId: company.id, ...submission })
      toastStore.showToast({
        title: invitationResult.wasInviteEmailSent ? 'Convite enviado' : 'Pessoa vinculada',
        description: invitationResult.wasInviteEmailSent
          ? `${submission.email} vai receber um email para entrar na ${company.name}.`
          : `${submission.email} já tinha conta e agora acessa a ${company.name}.`,
        tone: 'success',
      })
      isInviteDialogOpen.value = false
      await loadSummaries()
    } catch (inviteError) {
      inviteErrorMessage.value = describeInviteError(inviteError)
    } finally {
      isInviting.value = false
    }
  }

  function requestUnlink(company: Company, member: CompanyMember) {
    pendingUnlink.value = { company, member }
  }

  async function confirmUnlink() {
    const unlink = pendingUnlink.value
    if (!unlink) {
      return
    }
    isUnlinking.value = true
    try {
      await unlinkCompanyMember(unlink.company.id, unlink.member.userId)
      toastStore.showToast({ title: 'Acesso removido', tone: 'neutral' })
      pendingUnlink.value = null
      await loadSummaries()
    } catch (unlinkError) {
      toastStore.showToast({
        title: 'Não foi possível remover o acesso',
        description: describeError(unlinkError, 'Tente de novo.'),
        tone: 'neutral',
      })
    } finally {
      isUnlinking.value = false
    }
  }

  function openCompany(company: Company) {
    router.push({ name: 'company-overview', params: { companyId: company.id } })
  }

  watch(() => companyIds.value.join(','), loadSummaries, { immediate: true })

  return {
    isLoadingSummaries,
    loadErrorMessage,
    inviteTargetCompany,
    isInviteDialogOpen,
    isInviting,
    inviteErrorMessage,
    isUnlinkConfirmationOpen,
    unlinkDescription,
    isUnlinking,
    loadSummaries,
    readSummary,
    openInviteDialog,
    inviteMember,
    requestUnlink,
    confirmUnlink,
    openCompany,
  }
}
