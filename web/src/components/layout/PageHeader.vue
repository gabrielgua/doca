<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import { useCompaniesStore } from '@/stores/companies-store'
import AccountMenu from './AccountMenu.vue'
import PageBreadcrumbs from './PageBreadcrumbs.vue'

const route = useRoute()
const companiesStore = useCompaniesStore()

const overviewedCompany = computed(() =>
  route.name === 'company-overview'
    ? companiesStore.companies.find((company) => company.id === route.params.companyId)
    : undefined,
)
const pageTitle = computed(() => overviewedCompany.value?.name ?? route.meta.pageTitle ?? 'Doca')
const breadcrumbs = computed(() => {
  if (overviewedCompany.value) {
    return [
      { label: 'Administração' },
      { label: 'Empresas' },
      { label: overviewedCompany.value.name },
    ]
  }
  if (route.meta.isAdministrationPage) {
    return [{ label: 'Administração' }, { label: pageTitle.value }]
  }
  return [{ label: companiesStore.currentCompany?.name ?? 'Doca' }, { label: pageTitle.value }]
})
</script>

<template>
  <header class="relative z-30 flex flex-wrap items-center gap-4 px-4 pt-6 pb-2 lg:px-8 lg:pt-7">
    <div class="min-w-0">
      <PageBreadcrumbs :breadcrumbs="breadcrumbs" />
      <Transition
        mode="out-in"
        enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
        enter-from-class="translate-y-3 opacity-0"
        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <BaseHeading :key="pageTitle" :level="1" size="title" class="mt-1 text-balance">
          {{ pageTitle }}
        </BaseHeading>
      </Transition>
    </div>
    <div class="ml-auto flex items-center gap-2.5">
      <slot name="actions" />
      <div class="hidden animate-pop-in lg:block">
        <AccountMenu />
      </div>
    </div>
  </header>
</template>
