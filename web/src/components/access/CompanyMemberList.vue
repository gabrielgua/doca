<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import StaggeredTransitionGroup from '@/components/motion/StaggeredTransitionGroup.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { CompanyMember } from '@/services/companies-service'
import { AccessIcon } from '@/theme/app-icons'
import CompanyMemberRow from './CompanyMemberRow.vue'

interface CompanyMemberListProps {
  companyName: string
  members?: CompanyMember[]
  canUnlinkPeople?: boolean
}

withDefaults(defineProps<CompanyMemberListProps>(), {
  members: undefined,
  canUnlinkPeople: false,
})

const emit = defineEmits<{
  unlinkRequested: [member: CompanyMember]
}>()
</script>

<template>
  <div v-if="!members" class="grid place-items-center py-6">
    <BaseSpinner size="md" class="text-brand-600" />
  </div>
  <div
    v-else-if="members.length === 0"
    class="flex items-center gap-3 rounded-tile border-2 border-dashed border-neutral-200 p-4 dark:border-neutral-800"
  >
    <span class="animate-float">
      <BaseIconCircle :icon="AccessIcon" size="sm" variant="neutral" />
    </span>
    <BaseText size="sm" tone="muted">
      Ninguém vinculado ainda. Convide quem vai acessar a {{ companyName }}.
    </BaseText>
  </div>
  <StaggeredTransitionGroup v-else tag="ul" class="flex flex-col gap-2">
    <CompanyMemberRow
      v-for="(member, memberPosition) in members"
      :key="member.userId"
      :data-stagger-index="memberPosition"
      :member="member"
      :can-unlink="canUnlinkPeople"
      @unlink-requested="emit('unlinkRequested', member)"
    />
  </StaggeredTransitionGroup>
</template>
