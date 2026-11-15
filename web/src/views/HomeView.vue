<script setup lang="ts">
import ComingInPhaseNotice from '@/components/feedback/ComingInPhaseNotice.vue'
import { HomeIcon } from '@/theme/app-icons'
</script>

<template>
  <ComingInPhaseNotice
    :icon="HomeIcon"
    title="Ainda não há nada por aqui"
    description="Quando os envios chegarem, o início mostra a próxima coleta, os totais e os envios recentes da empresa."
    :phase-number="3"
  />
</template>
