<script setup lang="ts">
import EmptyState from '@/components/feedback/EmptyState.vue'
import GallerySection from '@/components/gallery/GallerySection.vue'
import InputStyleShowcase from '@/components/gallery/InputStyleShowcase.vue'
import MaskedInputShowcase from '@/components/gallery/MaskedInputShowcase.vue'
import ToastShowcase from '@/components/gallery/ToastShowcase.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { ComponentGalleryIcon } from '@/theme/app-icons'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <EmptyState
    v-if="!currentUserStore.isAdmin"
    :icon="ComponentGalleryIcon"
    title="Página só para admins"
    description="Aqui ficam os componentes da Doca para teste."
  />
  <div v-else class="flex flex-col gap-10">
    <GallerySection
      title="Toasts"
      description="Clique para disparar. Ficam no canto da tela, por cima até de modais."
    >
      <ToastShowcase />
    </GallerySection>

    <GallerySection
      title="Inputs com máscara"
      description="BaseInput com a prop mask. Embaixo de cada um aparece o valor que vai para o banco."
    >
      <MaskedInputShowcase />
    </GallerySection>

    <GallerySection title="Estilos dos inputs" description="Tipos, tamanhos e estados.">
      <InputStyleShowcase />
    </GallerySection>
  </div>
</template>
