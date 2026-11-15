<script setup lang="ts">
import ComingInPhaseNotice from '@/components/feedback/ComingInPhaseNotice.vue'
import { AddIcon } from '@/theme/app-icons'
</script>

<template>
  <ComingInPhaseNotice
    :icon="AddIcon"
    title="Registrar envio"
    description="Aqui você vai subir a planilha de caixas da Amazon, montar as caixas, anexar etiqueta e DANFE e marcar a coleta."
    :phase-number="2"
  />
</template>
