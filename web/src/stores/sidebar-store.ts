import { defineStore } from 'pinia'
import { useLocalStorage, useToggle } from '@vueuse/core'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'doca-sidebar-collapsed'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = useLocalStorage(SIDEBAR_COLLAPSED_STORAGE_KEY, false)
  const toggleCollapsed = useToggle(isCollapsed)

  return { isCollapsed, toggleCollapsed }
})
