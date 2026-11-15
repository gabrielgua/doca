import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { SegmentedOption } from '@/components/form/BaseSegmentedControl.vue'
import { CardsViewIcon, ListViewIcon } from '@/theme/app-icons'

export type ViewMode = 'cards' | 'list'

export const VIEW_MODE_OPTIONS: SegmentedOption[] = [
  { value: 'cards', label: 'Cards', icon: CardsViewIcon },
  { value: 'list', label: 'Lista', icon: ListViewIcon },
]

export function useViewMode(storageKey: string) {
  const savedViewMode = useLocalStorage<string>(storageKey, 'cards')

  const viewMode = computed<ViewMode>({
    get: () => (savedViewMode.value === 'list' ? 'list' : 'cards'),
    set: (nextViewMode) => {
      savedViewMode.value = nextViewMode
    },
  })

  return { viewMode }
}
