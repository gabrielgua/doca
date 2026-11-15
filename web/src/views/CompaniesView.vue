<script setup lang="ts">
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import CompanyFormDialog from '@/components/access/CompanyFormDialog.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import CompaniesTable from '@/components/company/CompaniesTable.vue'
import CompanyCard from '@/components/company/CompanyCard.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSegmentedControl from '@/components/form/BaseSegmentedControl.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCompanyAccessDirectory } from '@/composables/use-company-access-directory'
import { useViewMode, VIEW_MODE_OPTIONS } from '@/composables/use-view-mode'
import { normalizeForSearch } from '@/formatting/normalize-for-search'
import { useCompaniesStore } from '@/stores/companies-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { AddIcon, CompanyIcon, InformationIcon, SearchIcon } from '@/theme/app-icons'

const VIEW_MODE_STORAGE_KEY = 'doca-companies-view-mode'
const SEARCH_DEBOUNCE_MILLISECONDS = 250

const companiesStore = useCompaniesStore()
const currentUserStore = useCurrentUserStore()

const isNewCompanyDialogOpen = ref(false)
const { viewMode } = useViewMode(VIEW_MODE_STORAGE_KEY)
const searchText = ref('')
const debouncedSearchText = refDebounced(searchText, SEARCH_DEBOUNCE_MILLISECONDS)

const managedCompanies = computed(() =>
  companiesStore.companies.filter((company) =>
    companiesStore.managedCompanyIds.includes(company.id),
  ),
)
const normalizedSearch = computed(() => normalizeForSearch(debouncedSearchText.value))
const searchDigits = computed(() => debouncedSearchText.value.replace(/\D/g, ''))
const visibleCompanies = computed(() => {
  if (!normalizedSearch.value) {
    return managedCompanies.value
  }
  return managedCompanies.value.filter((company) => {
    const matchesName = normalizeForSearch(company.name).includes(normalizedSearch.value)
    const matchesCnpj =
      searchDigits.value.length > 0 && (company.cnpj ?? '').includes(searchDigits.value)
    return matchesName || matchesCnpj
  })
})
const companyAccessDirectory = useCompanyAccessDirectory(managedCompanies)
const { loadErrorMessage } = companyAccessDirectory

const companyCountLabel = computed(() => {
  const totalLabel =
    managedCompanies.value.length === 1 ? '1 empresa' : `${managedCompanies.value.length} empresas`
  return normalizedSearch.value ? `${visibleCompanies.value.length} de ${totalLabel}` : totalLabel
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div
      v-if="!currentUserStore.isAdmin"
      class="flex items-center gap-3 rounded-tile bg-brand-50 p-4 text-sm font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
    >
      <BaseIcon :icon="InformationIcon" size="sm" />
      Aqui estão as empresas em que você é gerente. Abra uma para ver o catálogo e quem tem acesso.
    </div>

    <EmptyState
      v-if="managedCompanies.length === 0 && currentUserStore.isAdmin"
      :icon="CompanyIcon"
      title="Comece criando uma empresa"
      description="Cada empresa tem as próprias marcas, produtos e envios. Depois é só vincular quem vai acessar."
    >
      <BaseButton :leading-icon="AddIcon" @click="isNewCompanyDialogOpen = true">
        Nova empresa
      </BaseButton>
    </EmptyState>

    <EmptyState
      v-else-if="managedCompanies.length === 0"
      :icon="CompanyIcon"
      title="Nenhuma empresa por aqui"
      description="Quando você virar gerente de uma empresa, ela aparece nesta lista."
    />

    <template v-else>
      <div class="flex flex-wrap items-center gap-3">
        <BaseInput
          v-model="searchText"
          type="search"
          placeholder="Buscar por nome ou CNPJ"
          :leading-icon="SearchIcon"
          class="min-w-56 flex-1 sm:max-w-sm"
        />
        <BaseText weight="bold" tone="muted">{{ companyCountLabel }}</BaseText>
        <div class="ml-auto flex flex-wrap items-center justify-end gap-3">
          <BaseSegmentedControl
            v-model="viewMode"
            :options="VIEW_MODE_OPTIONS"
            accessible-label="Mostrar empresas como"
          />
          <BaseButton
            v-if="currentUserStore.isAdmin"
            :leading-icon="AddIcon"
            @click="isNewCompanyDialogOpen = true"
          >
            Nova empresa
          </BaseButton>
        </div>
      </div>

      <LoadErrorRetry
        v-if="loadErrorMessage"
        :error-message="loadErrorMessage"
        @retry-requested="companyAccessDirectory.loadSummaries"
      />

      <EmptyState
        v-else-if="visibleCompanies.length === 0"
        :icon="SearchIcon"
        title="Nenhuma empresa encontrada"
        :description="`Nada com “${debouncedSearchText.trim()}” no nome ou no CNPJ.`"
      >
        <BaseButton variant="neutral" appearance="outlined" @click="searchText = ''">
          Limpar busca
        </BaseButton>
      </EmptyState>

      <Transition
        v-else
        mode="out-in"
        enter-active-class="transition duration-400 ease-bounce motion-reduce:transition-none"
        enter-from-class="translate-y-3 opacity-0"
        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <StaggeredTransitionGroup
          v-if="viewMode === 'cards'"
          key="cards"
          class="grid gap-5 xl:grid-cols-2"
          :delay-between-items-in-milliseconds="80"
        >
          <CompanyCard
            v-for="(company, companyPosition) in visibleCompanies"
            :key="company.id"
            :data-stagger-index="companyPosition"
            :company="company"
            :summary="companyAccessDirectory.readSummary(company.id)"
            @open-requested="companyAccessDirectory.openCompany(company)"
          />
        </StaggeredTransitionGroup>
        <CompaniesTable
          v-else
          key="list"
          :companies="visibleCompanies"
          :read-summary="companyAccessDirectory.readSummary"
          @open-requested="companyAccessDirectory.openCompany"
        />
      </Transition>
    </template>

    <CompanyFormDialog v-model:open="isNewCompanyDialogOpen" />
  </div>
</template>
