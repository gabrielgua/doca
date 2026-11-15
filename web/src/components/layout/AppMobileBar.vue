<script setup lang="ts">
import CompanySwitcher from '@/components/company/CompanySwitcher.vue'
import AccountMenu from './AccountMenu.vue'
import AppBrandMark from './AppBrandMark.vue'
</script>

<template>
  <div
    class="relative z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-card lg:hidden dark:bg-neutral-900"
  >
    <AppBrandMark />
    <div class="ml-auto flex items-center gap-2">
      <CompanySwitcher is-compact alignment="end" />
      <AccountMenu is-compact />
    </div>
  </div>
</template>
