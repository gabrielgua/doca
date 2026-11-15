<script setup lang="ts">
import ComingInPhaseNotice from '@/components/feedback/ComingInPhaseNotice.vue'
import { IntegrationIcon } from '@/theme/app-icons'
</script>

<template>
  <ComingInPhaseNotice
    :icon="IntegrationIcon"
    title="Integração com a Amazon"
    description="Conectar a conta de vendedor de cada empresa para trazer envios e status sozinhos."
    :phase-number="4"
  />
</template>
