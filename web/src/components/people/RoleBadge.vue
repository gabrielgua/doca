<script setup lang="ts">
import { ROLE_LABELS, type UserRole } from '@/theme/user-roles'

interface RoleBadgeProps {
  role: UserRole
}

defineProps<RoleBadgeProps>()

const colorClassesByRole: Record<UserRole, string> = {
  admin: 'bg-accent-100 text-accent-600 dark:bg-accent-950 dark:text-accent-500',
  manager: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  client: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-caption leading-none font-bold"
    :class="colorClassesByRole[role]"
  >
    {{ ROLE_LABELS[role] }}
  </span>
</template>
