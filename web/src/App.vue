<script setup lang="ts">
import ToastViewport from '@/components/toast/ToastViewport.vue'
import { useColorScheme } from '@/composables/use-color-scheme'

useColorScheme()
</script>

<template>
  <RouterView />
  <ToastViewport />
</template>
