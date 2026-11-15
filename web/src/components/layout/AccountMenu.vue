<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseDropdownMenu from '@/components/menu/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/components/menu/BaseDropdownMenuItem.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import RoleBadge from '@/components/people/RoleBadge.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCompaniesStore } from '@/stores/companies-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { CompanyIcon, OpenMenuIcon, SignOutIcon } from '@/theme/app-icons'

interface AccountMenuProps {
  isCompact?: boolean
}

withDefaults(defineProps<AccountMenuProps>(), {
  isCompact: false,
})

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const companiesStore = useCompaniesStore()
const { switchColorSchemeIcon, switchColorSchemeLabel, toggleColorSchemeWithReveal } =
  useColorScheme()

const isMenuOpen = ref(false)

function handleColorSchemeSelected() {
  toggleColorSchemeWithReveal()
}

function handleAccessSelected(closeMenu: () => void) {
  closeMenu()
  router.push({ name: 'companies' })
}

async function handleSignOutSelected(closeMenu: () => void) {
  closeMenu()
  await authenticationStore.signOut()
  router.replace({ name: 'sign-in' })
}
</script>

<template>
  <BaseDropdownMenu v-model:open="isMenuOpen" accessible-label="Menu da conta">
    <template #trigger="{ menuId, toggleMenu }">
      <button
        type="button"
        class="group flex cursor-pointer items-center gap-3 rounded-full bg-white p-1.5 shadow-card ring-2 transition-bouncy select-none hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95 dark:bg-neutral-900"
        :class="[
          isMenuOpen ? 'ring-brand-200 dark:ring-brand-800' : 'ring-transparent',
          isCompact ? '' : 'pr-3',
        ]"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        :aria-controls="menuId"
        :aria-label="`Menu da conta de ${currentUserStore.displayName}`"
        @click="toggleMenu"
      >
        <BaseAvatar
          :name="currentUserStore.displayName"
          tone="solid"
          class="transition-bouncy group-hover:scale-110 group-hover:-rotate-6"
        />
        <span v-if="!isCompact" class="hidden flex-col items-start gap-1 sm:flex">
          <BaseText as="span" size="sm" weight="bold" class="leading-none">
            {{ currentUserStore.displayName }}
          </BaseText>
          <RoleBadge :role="companiesStore.roleInCurrentCompany" />
        </span>
        <span
          v-if="!isCompact"
          class="hidden size-7 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition-bouncy group-hover:bg-brand-50 group-hover:text-brand-600 sm:grid dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-brand-950 dark:group-hover:text-brand-300"
          :class="{ 'rotate-180': isMenuOpen }"
        >
          <BaseIcon :icon="OpenMenuIcon" size="xs" />
        </span>
      </button>
    </template>

    <template #default="{ closeMenu }">
      <div class="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800">
        <BaseAvatar
          :name="currentUserStore.displayName"
          tone="solid"
          size="lg"
          class="animate-icon-pop"
        />
        <div class="flex min-w-0 flex-col items-start gap-1">
          <BaseText weight="bold" class="max-w-full truncate leading-tight">
            {{ currentUserStore.displayName }}
          </BaseText>
          <BaseText size="sm" tone="subtle" class="max-w-full truncate leading-tight">
            {{ authenticationStore.signedInEmail }}
          </BaseText>
          <RoleBadge :role="companiesStore.roleInCurrentCompany" />
        </div>
      </div>
      <StaggeredTransitionGroup
        class="flex flex-col gap-0.5 p-2"
        :initial-delay-in-milliseconds="60"
      >
        <BaseDropdownMenuItem
          v-if="companiesStore.canLinkPeople"
          key="access"
          :data-stagger-index="0"
          :icon="CompanyIcon"
          @selected="handleAccessSelected(closeMenu)"
        >
          Empresas
        </BaseDropdownMenuItem>
        <BaseDropdownMenuItem
          key="color-scheme"
          :data-stagger-index="1"
          :icon="switchColorSchemeIcon"
          @selected="handleColorSchemeSelected"
        >
          {{ switchColorSchemeLabel }}
        </BaseDropdownMenuItem>
        <BaseDropdownMenuItem
          key="sign-out"
          :data-stagger-index="2"
          :icon="SignOutIcon"
          tone="danger"
          @selected="handleSignOutSelected(closeMenu)"
        >
          Sair
        </BaseDropdownMenuItem>
      </StaggeredTransitionGroup>
    </template>
  </BaseDropdownMenu>
</template>
