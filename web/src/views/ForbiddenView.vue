<script setup lang="ts">
import ErrorPageState from '@/components/feedback/ErrorPageState.vue'
</script>

<template>
  <ErrorPageState
    code="403"
    title="Essa porta está trancada"
    description="Você não tem acesso a esta página. Se acha que deveria ter, fale com quem administra a Doca."
  />
</template>
