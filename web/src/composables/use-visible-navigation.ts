import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAVIGATION_DESTINATIONS,
  NAVIGATION_SECTIONS,
  type NavigationSection,
} from '@/components/layout/navigation-destinations'
import { useRouteAudienceAccess } from '@/router/route-audience'

export function useVisibleNavigation() {
  const router = useRouter()
  const { isAudienceAllowed } = useRouteAudienceAccess()

  const visibleDestinations = computed(() =>
    NAVIGATION_DESTINATIONS.filter((destination) =>
      isAudienceAllowed(router.resolve({ name: destination.routeName }).meta.audience),
    ),
  )

  const visibleSections = computed(() =>
    NAVIGATION_SECTIONS.map((section: NavigationSection) => ({
      section,
      destinations: visibleDestinations.value.filter(
        (destination) => destination.section === section,
      ),
    })).filter((sectionGroup) => sectionGroup.destinations.length > 0),
  )

  return { visibleDestinations, visibleSections }
}
