<script setup lang="ts">
import BaseDisclosureCard from '@/components/card/BaseDisclosureCard.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import RoleBadge from '@/components/people/RoleBadge.vue'
import { CloseIcon, SelectedIcon } from '@/theme/app-icons'
import type { UserRole } from '@/theme/user-roles'

type PermissionAnswer = boolean | string

interface PermissionRow {
  action: string
  answerByRole: Record<UserRole, PermissionAnswer>
}

const ROLES_IN_ORDER: UserRole[] = ['admin', 'manager', 'client']

const PERMISSION_ROWS: PermissionRow[] = [
  {
    action: 'Ver envios, caixas, arquivos e andamento',
    answerByRole: { admin: true, manager: true, client: true },
  },
  {
    action: 'Criar e editar envios, marcas e produtos',
    answerByRole: { admin: true, manager: true, client: false },
  },
  {
    action: 'Excluir envios, marcas e produtos',
    answerByRole: { admin: true, manager: false, client: false },
  },
  {
    action: 'Vincular pessoas',
    answerByRole: { admin: 'Em todas', manager: 'Nas empresas dele', client: false },
  },
  {
    action: 'Desvincular pessoas e criar empresas',
    answerByRole: { admin: true, manager: false, client: false },
  },
]
</script>

<template>
  <BaseDisclosureCard
    title="O que cada papel pode fazer"
    description="Admin, gerente e cliente: o que cada um vê e edita."
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-lg border-collapse text-sm">
        <thead>
          <tr>
            <th class="py-2 text-left" scope="col"><span class="sr-only">Ação</span></th>
            <th v-for="role in ROLES_IN_ORDER" :key="role" class="px-3 py-2" scope="col">
              <RoleBadge :role="role" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="permissionRow in PERMISSION_ROWS"
            :key="permissionRow.action"
            class="border-t border-neutral-100 dark:border-neutral-800"
          >
            <th scope="row" class="py-3 pr-3 text-left font-semibold">
              {{ permissionRow.action }}
            </th>
            <td v-for="role in ROLES_IN_ORDER" :key="role" class="px-3 py-3 text-center">
              <span
                v-if="typeof permissionRow.answerByRole[role] === 'string'"
                class="text-caption font-semibold text-neutral-500 dark:text-neutral-400"
              >
                {{ permissionRow.answerByRole[role] }}
              </span>
              <span
                v-else-if="permissionRow.answerByRole[role]"
                class="inline-grid size-6 place-items-center rounded-full bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300"
                aria-label="Pode"
              >
                <BaseIcon :icon="SelectedIcon" size="xs" />
              </span>
              <span
                v-else
                class="inline-grid size-6 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                aria-label="Não pode"
              >
                <BaseIcon :icon="CloseIcon" size="xs" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-caption text-neutral-500 dark:text-neutral-400">
      As permissões são garantidas pelo banco de dados. Esconder um botão é só a parte visual.
    </p>
  </BaseDisclosureCard>
</template>
