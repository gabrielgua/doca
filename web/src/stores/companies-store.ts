import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { describeError } from '@/services/describe-error'
import {
  createCompany,
  updateCompany,
  fetchCompanies,
  fetchOwnMemberships,
  type Company,
  type CompanyMembership,
  type NewCompany,
} from '@/services/companies-service'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import type { UserRole } from '@/theme/user-roles'

const CURRENT_COMPANY_STORAGE_KEY = 'doca-current-company'

export const useCompaniesStore = defineStore('companies', () => {
  const authenticationStore = useAuthenticationStore()
  const currentUserStore = useCurrentUserStore()

  const companies = ref<Company[]>([])
  const ownMemberships = ref<CompanyMembership[]>([])
  const isLoadingCompanies = ref(false)
  const hasLoadedCompanies = ref(false)
  const loadErrorMessage = ref<string>()
  let companiesLoading: Promise<void> | undefined
  let companiesLoadingUserId: string | undefined
  const savedCurrentCompanyId = useLocalStorage<string | null>(CURRENT_COMPANY_STORAGE_KEY, null)

  const currentCompany = computed(
    () =>
      companies.value.find((company) => company.id === savedCurrentCompanyId.value) ??
      companies.value[0] ??
      null,
  )
  const hasCompanies = computed(() => companies.value.length > 0)
  const roleInCurrentCompany = computed<UserRole>(() => {
    if (currentUserStore.isAdmin) {
      return 'admin'
    }
    const currentMembership = ownMemberships.value.find(
      (membership) => membership.companyId === currentCompany.value?.id,
    )
    return currentMembership?.role ?? 'client'
  })
  const canEditCurrentCompany = computed(() => roleInCurrentCompany.value !== 'client')
  const managedCompanyIds = computed(() =>
    currentUserStore.isAdmin
      ? companies.value.map((company) => company.id)
      : ownMemberships.value
          .filter((membership) => membership.role === 'manager')
          .map((membership) => membership.companyId),
  )
  const canLinkPeople = computed(
    () => managedCompanyIds.value.length > 0 || currentUserStore.isAdmin,
  )

  async function loadCompanies(userId: string) {
    isLoadingCompanies.value = true
    loadErrorMessage.value = undefined
    try {
      const [loadedCompanies, loadedMemberships] = await Promise.all([
        fetchCompanies(),
        fetchOwnMemberships(userId),
      ])
      companies.value = loadedCompanies
      ownMemberships.value = loadedMemberships
      hasLoadedCompanies.value = true
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Não foi possível carregar as empresas.')
    } finally {
      isLoadingCompanies.value = false
    }
  }

  function selectCompany(companyId: string) {
    savedCurrentCompanyId.value = companyId
  }

  async function addCompany(newCompany: NewCompany): Promise<Company> {
    const createdCompany = await createCompany(newCompany)
    companies.value = [...companies.value, createdCompany].sort((first, second) =>
      first.name.localeCompare(second.name, 'pt-BR'),
    )
    if (!savedCurrentCompanyId.value) {
      selectCompany(createdCompany.id)
    }
    return createdCompany
  }

  async function editCompany(companyId: string, companyChanges: NewCompany): Promise<Company> {
    const updatedCompany = await updateCompany(companyId, companyChanges)
    companies.value = companies.value
      .map((company) => (company.id === companyId ? updatedCompany : company))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'))
    return updatedCompany
  }

  function ensureCompaniesLoaded(): Promise<void> {
    const signedInUserId = authenticationStore.signedInUser?.id
    if (!signedInUserId) {
      return Promise.resolve()
    }
    if (!companiesLoading || companiesLoadingUserId !== signedInUserId) {
      companiesLoadingUserId = signedInUserId
      companiesLoading = loadCompanies(signedInUserId)
    }
    return companiesLoading
  }

  function reloadCompanies() {
    companiesLoading = undefined
    return ensureCompaniesLoaded()
  }

  watch(
    () => authenticationStore.signedInUser?.id,
    (signedInUserId) => {
      if (signedInUserId) {
        ensureCompaniesLoaded()
        return
      }
      companiesLoading = undefined
      companiesLoadingUserId = undefined
      companies.value = []
      ownMemberships.value = []
      hasLoadedCompanies.value = false
    },
    { immediate: true },
  )

  return {
    companies,
    isLoadingCompanies,
    hasLoadedCompanies,
    loadErrorMessage,
    currentCompany,
    hasCompanies,
    roleInCurrentCompany,
    canEditCurrentCompany,
    managedCompanyIds,
    canLinkPeople,
    selectCompany,
    addCompany,
    editCompany,
    ensureCompaniesLoaded,
    reloadCompanies,
  }
})
