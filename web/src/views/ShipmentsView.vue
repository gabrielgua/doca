<script setup lang="ts">
import ComingInPhaseNotice from '@/components/feedback/ComingInPhaseNotice.vue'
import { ShipmentsIcon } from '@/theme/app-icons'
</script>

<template>
  <ComingInPhaseNotice
    :icon="ShipmentsIcon"
    title="Nenhum envio ainda"
    description="A lista de envios, agrupada por mês e com busca, aparece aqui depois que o primeiro envio for registrado."
    :phase-number="2"
  />
</template>
