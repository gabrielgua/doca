<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseDropdownMenu, {
  type DropdownMenuAlignment,
} from '@/components/menu/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/components/menu/BaseDropdownMenuItem.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCompaniesStore } from '@/stores/companies-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { CompanyIcon, SelectedIcon, SwitchCompanyIcon } from '@/theme/app-icons'
import CompanyAvatar from './CompanyAvatar.vue'

interface CompanySwitcherProps {
  isCompact?: boolean
  alignment?: DropdownMenuAlignment
}

withDefaults(defineProps<CompanySwitcherProps>(), {
  isCompact: false,
  alignment: 'start',
})

const router = useRouter()
const companiesStore = useCompaniesStore()
const currentUserStore = useCurrentUserStore()

const isMenuOpen = ref(false)

function handleCompanySelected(companyId: string, closeMenu: () => void) {
  companiesStore.selectCompany(companyId)
  closeMenu()
}

function handleManageSelected(closeMenu: () => void) {
  closeMenu()
  router.push({ name: 'companies' })
}
</script>

<template>
  <BaseDropdownMenu
    v-if="companiesStore.currentCompany"
    v-model:open="isMenuOpen"
    accessible-label="Trocar de empresa"
    :alignment="alignment"
  >
    <template #trigger="{ menuId, toggleMenu }">
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center gap-3 rounded-tile bg-neutral-100 p-1.5 text-left ring-2 transition-bouncy hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-97 dark:bg-neutral-800 dark:hover:bg-brand-950"
        :class="[
          isMenuOpen ? 'ring-brand-200 dark:ring-brand-800' : 'ring-transparent',
          isCompact ? 'justify-center' : 'pr-3',
        ]"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        :aria-controls="menuId"
        :aria-label="`Empresa atual: ${companiesStore.currentCompany.name}. Trocar de empresa`"
        @click="toggleMenu"
      >
        <CompanyAvatar
          :key="companiesStore.currentCompany.id"
          :name="companiesStore.currentCompany.name"
          :color="companiesStore.currentCompany.color"
          class="animate-icon-pop transition-bouncy group-hover:-rotate-6"
        />
        <template v-if="!isCompact">
          <span class="min-w-0 flex-1 leading-tight">
            <BaseText as="span" size="caption" tone="subtle" weight="bold" class="block uppercase">
              Empresa
            </BaseText>
            <BaseText as="span" size="sm" weight="extrabold" class="block truncate">
              {{ companiesStore.currentCompany.name }}
            </BaseText>
          </span>
          <BaseIcon
            :icon="SwitchCompanyIcon"
            size="sm"
            class="text-neutral-400 transition-bouncy group-hover:text-brand-600"
          />
        </template>
      </button>
    </template>

    <template #default="{ closeMenu }">
      <BaseText size="caption" tone="subtle" weight="extrabold" class="px-4 pt-4 uppercase">
        {{ currentUserStore.isAdmin ? 'Todas as empresas' : 'Suas empresas' }}
      </BaseText>
      <StaggeredTransitionGroup
        class="flex flex-col gap-0.5 p-2"
        :initial-delay-in-milliseconds="60"
      >
        <button
          v-for="(company, companyPosition) in companiesStore.companies"
          :key="company.id"
          :data-stagger-index="companyPosition"
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-3 rounded-control p-2 text-left font-semibold transition duration-200 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-neutral-800"
          :class="{
            'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300':
              company.id === companiesStore.currentCompany.id,
          }"
          :aria-current="company.id === companiesStore.currentCompany.id ? 'true' : undefined"
          @click="handleCompanySelected(company.id, closeMenu)"
        >
          <CompanyAvatar :name="company.name" :color="company.color" size="sm" />
          <span class="min-w-0 flex-1 truncate">{{ company.name }}</span>
          <BaseIcon
            v-if="company.id === companiesStore.currentCompany.id"
            :icon="SelectedIcon"
            size="sm"
            class="animate-icon-pop"
          />
        </button>
      </StaggeredTransitionGroup>
      <div
        v-if="companiesStore.canLinkPeople"
        class="border-t border-neutral-100 p-2 dark:border-neutral-800"
      >
        <BaseDropdownMenuItem :icon="CompanyIcon" @selected="handleManageSelected(closeMenu)">
          Empresas
        </BaseDropdownMenuItem>
      </div>
    </template>
  </BaseDropdownMenu>
</template>
