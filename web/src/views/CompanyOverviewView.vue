<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompanyAccessDialogs from '@/components/access/CompanyAccessDialogs.vue'
import CompanyFormDialog from '@/components/access/CompanyFormDialog.vue'
import CompanyMemberList from '@/components/access/CompanyMemberList.vue'
import CompanyStatTile from '@/components/access/CompanyStatTile.vue'
import RolePermissionsTable from '@/components/access/RolePermissionsTable.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/card/BaseCard.vue'
import ProductTable from '@/components/catalog/ProductTable.vue'
import BrandBreakdownCard from '@/components/company-overview/BrandBreakdownCard.vue'
import CompanyAttentionList from '@/components/company-overview/CompanyAttentionList.vue'
import CompanyOverviewHero from '@/components/company-overview/CompanyOverviewHero.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCompanyAccessDirectory } from '@/composables/use-company-access-directory'
import { useCompanyOverview } from '@/composables/use-company-overview'
import { useCompaniesStore } from '@/stores/companies-store'
import ForbiddenView from '@/views/ForbiddenView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import {
  AccessIcon,
  AddIcon,
  BarcodeIcon,
  CatalogIcon,
  ProductIcon,
  ShipmentsIcon,
} from '@/theme/app-icons'

const route = useRoute()
const router = useRouter()
const companiesStore = useCompaniesStore()
const currentUserStore = useCurrentUserStore()

const isEditDialogOpen = ref(false)

const companyId = computed(() => String(route.params.companyId ?? ''))
const company = computed(
  () => companiesStore.companies.find((candidate) => candidate.id === companyId.value) ?? null,
)
const canManageCompany = computed(() => companiesStore.managedCompanyIds.includes(companyId.value))

const companyAccessDirectory = useCompanyAccessDirectory(() =>
  company.value && canManageCompany.value ? [company.value] : [],
)
const {
  brands,
  products,
  isLoadingCatalog,
  catalogErrorMessage,
  productsWithoutLabel,
  productsWithoutFnsku,
  brandBreakdowns,
  findBrandName,
  loadCatalog,
} = useCompanyOverview(companyId)

const summary = computed(() => companyAccessDirectory.readSummary(companyId.value))

function openCatalog() {
  companiesStore.selectCompany(companyId.value)
  router.push({ name: 'catalog' })
}
</script>

<template>
  <div v-if="!companiesStore.hasLoadedCompanies" class="grid place-items-center py-20">
    <BaseSpinner size="lg" class="text-brand-600" />
  </div>
  <NotFoundView v-else-if="!company" />
  <ForbiddenView v-else-if="!canManageCompany" />
  <div v-else class="flex flex-col gap-6">
    <CompanyOverviewHero
      :company="company"
      :can-edit-company="currentUserStore.isAdmin"
      @edit-requested="isEditDialogOpen = true"
      @catalog-requested="openCatalog"
    />

    <StaggeredTransitionGroup
      class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      :delay-between-items-in-milliseconds="60"
    >
      <CompanyStatTile
        key="people"
        :data-stagger-index="0"
        surface="card"
        :icon="AccessIcon"
        label="pessoas com acesso"
        :value="summary?.members.length ?? null"
      />
      <CompanyStatTile
        key="brands"
        :data-stagger-index="1"
        surface="card"
        :icon="CatalogIcon"
        label="marcas"
        :value="isLoadingCatalog ? null : brands.length"
      />
      <CompanyStatTile
        key="products"
        :data-stagger-index="2"
        surface="card"
        :icon="ProductIcon"
        label="produtos"
        :value="isLoadingCatalog ? null : products.length"
      />
      <CompanyStatTile
        key="missing-labels"
        :data-stagger-index="3"
        surface="card"
        :icon="BarcodeIcon"
        label="sem etiqueta FNSKU"
        :tone="productsWithoutLabel.length > 0 ? 'warning' : 'success'"
        :value="isLoadingCatalog ? null : productsWithoutLabel.length"
      />
      <CompanyStatTile
        key="shipments"
        :data-stagger-index="4"
        surface="card"
        :icon="ShipmentsIcon"
        label="envios · chega na fase 2"
        :value="null"
      />
    </StaggeredTransitionGroup>

    <LoadErrorRetry
      v-if="catalogErrorMessage"
      :error-message="catalogErrorMessage"
      @retry-requested="loadCatalog"
    />

    <div class="grid items-start gap-6 lg:grid-cols-2">
      <CompanyAttentionList
        :company="company"
        :members="summary?.members"
        :brand-count="brands.length"
        :products-without-label="productsWithoutLabel"
        :products-without-fnsku="productsWithoutFnsku"
      />
      <BrandBreakdownCard :brand-breakdowns="brandBreakdowns" />
    </div>

    <section class="flex flex-col gap-3" aria-labelledby="company-access-heading">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <BaseHeading id="company-access-heading" :level="2" size="section">Acessos</BaseHeading>
          <BaseText size="sm" tone="subtle"
            >Quem entra na Doca para ver ou editar esta empresa.</BaseText
          >
        </div>
        <BaseButton
          :leading-icon="AddIcon"
          @click="companyAccessDirectory.openInviteDialog(company)"
        >
          Vincular pessoa
        </BaseButton>
      </div>
      <div class="grid items-start gap-6 xl:grid-cols-5">
        <BaseCard class="xl:col-span-2">
          <CompanyMemberList
            :company-name="company.name"
            :members="summary?.members"
            :can-unlink-people="currentUserStore.isAdmin"
            @unlink-requested="
              (member) => company && companyAccessDirectory.requestUnlink(company, member)
            "
          />
        </BaseCard>
        <RolePermissionsTable class="xl:col-span-3" />
      </div>
    </section>

    <section class="flex flex-col gap-3" aria-label="Produtos">
      <BaseHeading :level="2" size="section">Produtos</BaseHeading>
      <div v-if="isLoadingCatalog" class="grid place-items-center py-10">
        <BaseSpinner size="lg" class="text-brand-600" />
      </div>
      <BaseCard v-else-if="products.length === 0" class="text-center">
        <BaseHeading :level="3" size="section" tone="muted">Nenhum produto cadastrado</BaseHeading>
      </BaseCard>
      <ProductTable v-else :products="products" :find-brand-name="findBrandName" />
    </section>

    <CompanyFormDialog v-model:open="isEditDialogOpen" :edited-company="company" />
    <CompanyAccessDialogs :company-access-directory="companyAccessDirectory" />
  </div>
</template>
