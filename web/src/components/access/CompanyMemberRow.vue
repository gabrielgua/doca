<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import RoleBadge from '@/components/people/RoleBadge.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { CompanyMember } from '@/services/companies-service'
import { CloseIcon } from '@/theme/app-icons'

interface CompanyMemberRowProps {
  member: CompanyMember
  canUnlink?: boolean
}

const props = withDefaults(defineProps<CompanyMemberRowProps>(), {
  canUnlink: false,
})

const emit = defineEmits<{
  unlinkRequested: []
}>()

const displayName = computed(
  () => props.member.fullName ?? props.member.email?.split('@')[0] ?? 'Convidado',
)
</script>

<template>
  <li
    class="flex items-center gap-3 rounded-tile bg-neutral-100 p-2.5 transition-bouncy hover:-translate-y-0.5 dark:bg-neutral-800"
  >
    <BaseAvatar :name="displayName" />
    <div class="min-w-0 flex-1">
      <BaseText size="sm" weight="bold" class="truncate">{{ displayName }}</BaseText>
      <BaseText size="caption" tone="subtle" class="truncate">{{ member.email }}</BaseText>
    </div>
    <RoleBadge :role="member.role" />
    <BaseIconButton
      v-if="canUnlink"
      :icon="CloseIcon"
      :accessible-label="`Desvincular ${displayName}`"
      variant="danger"
      appearance="ghost"
      size="sm"
      @click="emit('unlinkRequested')"
    />
  </li>
</template>
