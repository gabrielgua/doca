import { computed, nextTick } from 'vue'
import {
  createSharedComposable,
  useDark,
  useMouse,
  usePreferredReducedMotion,
  useToggle,
} from '@vueuse/core'
import { DarkModeIcon, LightModeIcon } from '@/theme/app-icons'

const COLOR_SCHEME_STORAGE_KEY = 'doca-color-scheme'
const REVEAL_DURATION_MILLISECONDS = 650
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

function useColorSchemeState() {
  const isDarkModeEnabled = useDark({
    storageKey: COLOR_SCHEME_STORAGE_KEY,
    initialValue: 'light',
  })
  const toggleColorScheme = useToggle(isDarkModeEnabled)
  const preferredMotion = usePreferredReducedMotion()
  const { x: pointerX, y: pointerY } = useMouse({ type: 'client' })

  const colorSchemeName = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))
  const switchColorSchemeIcon = computed(() =>
    isDarkModeEnabled.value ? LightModeIcon : DarkModeIcon,
  )
  const switchColorSchemeLabel = computed(() =>
    isDarkModeEnabled.value ? 'Tema claro' : 'Tema escuro',
  )

  async function toggleColorSchemeWithReveal() {
    const canAnimateReveal =
      typeof document.startViewTransition === 'function' && preferredMotion.value !== 'reduce'
    if (!canAnimateReveal) {
      toggleColorScheme()
      return
    }
    const revealCenterX = pointerX.value || window.innerWidth / 2
    const revealCenterY = pointerY.value || window.innerHeight / 2
    const revealRadius = Math.hypot(
      Math.max(revealCenterX, window.innerWidth - revealCenterX),
      Math.max(revealCenterY, window.innerHeight - revealCenterY),
    )
    const viewTransition = document.startViewTransition(async () => {
      toggleColorScheme()
      await nextTick()
    })
    await viewTransition.ready
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${revealCenterX}px ${revealCenterY}px)`,
          `circle(${revealRadius}px at ${revealCenterX}px ${revealCenterY}px)`,
        ],
      },
      {
        duration: REVEAL_DURATION_MILLISECONDS,
        easing: REVEAL_EASING,
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return {
    isDarkModeEnabled,
    colorSchemeName,
    switchColorSchemeIcon,
    switchColorSchemeLabel,
    toggleColorScheme,
    toggleColorSchemeWithReveal,
  }
}

export const useColorScheme = createSharedComposable(useColorSchemeState)
