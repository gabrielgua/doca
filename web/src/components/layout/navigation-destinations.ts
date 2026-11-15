import {
  CompanyIcon,
  AddIcon,
  ComponentGalleryIcon,
  CatalogIcon,
  HomeIcon,
  IntegrationIcon,
  ShipmentsIcon,
  type AppIcon,
} from '@/theme/app-icons'

export type NavigationSection = 'menu' | 'administration' | 'integrations'

export type NavigationRouteName =
  'home' | 'shipments' | 'new-shipment' | 'catalog' | 'companies' | 'component-gallery' | 'amazon'

export interface NavigationDestination {
  routeName: NavigationRouteName
  label: string
  shortLabel: string
  icon: AppIcon
  section: NavigationSection
  comingSoonLabel?: string
}

export const NAVIGATION_SECTION_TITLES: Record<NavigationSection, string> = {
  menu: 'Menu',
  administration: 'Administração',
  integrations: 'Integrações',
}

export const NAVIGATION_SECTIONS: NavigationSection[] = ['menu', 'administration', 'integrations']

export const NAVIGATION_DESTINATIONS: NavigationDestination[] = [
  { routeName: 'home', label: 'Início', shortLabel: 'Início', icon: HomeIcon, section: 'menu' },
  {
    routeName: 'shipments',
    label: 'Envios',
    shortLabel: 'Envios',
    icon: ShipmentsIcon,
    section: 'menu',
  },
  {
    routeName: 'new-shipment',
    label: 'Novo envio',
    shortLabel: 'Novo envio',
    icon: AddIcon,
    section: 'menu',
  },
  {
    routeName: 'catalog',
    label: 'Marcas e produtos',
    shortLabel: 'Produtos',
    icon: CatalogIcon,
    section: 'menu',
  },
  {
    routeName: 'companies',
    label: 'Empresas',
    shortLabel: 'Empresas',
    icon: CompanyIcon,
    section: 'administration',
  },
  {
    routeName: 'component-gallery',
    label: 'Componentes',
    shortLabel: 'Componentes',
    icon: ComponentGalleryIcon,
    section: 'administration',
  },
  {
    routeName: 'amazon',
    label: 'Amazon',
    shortLabel: 'Amazon',
    icon: IntegrationIcon,
    section: 'integrations',
    comingSoonLabel: 'em breve',
  },
]
