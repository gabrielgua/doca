<script setup lang="ts">
import { useRoute } from 'vue-router'
import DocumentViewerDialog from '@/components/document/DocumentViewerDialog.vue'
import AppMobileBar from '@/components/layout/AppMobileBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import PageTransition from '@/components/layout/PageTransition.vue'

const currentRoute = useRoute()
</script>

<template>
  <div class="flex min-h-dvh">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppMobileBar />
      <MobileNavigation />
      <PageHeader v-if="!currentRoute.meta.isPageHeaderHidden" />
      <main class="w-full max-w-7xl px-4 pt-4 pb-16 lg:px-8">
        <RouterView v-slot="{ Component, route }">
          <PageTransition>
            <component :is="Component" :key="route.path" />
          </PageTransition>
        </RouterView>
      </main>
    </div>
    <DocumentViewerDialog />
  </div>
</template>
