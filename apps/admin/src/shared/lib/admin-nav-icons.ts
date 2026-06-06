import type { IconComponent } from '@/shared/ui/icons';
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tags,
  TrendingUp,
  Users,
  Wallet,
} from '@/shared/ui/icons';

export const ADMIN_SECTION_ICONS: Record<string, IconComponent> = {
  overview: LayoutDashboard,
  catalog: Store,
  commerce: ShoppingBag,
  trading: TrendingUp,
  pricing: Tags,
  people: Users,
  finance: Wallet,
  reports: BarChart3,
  content: FileText,
  security: Shield,
  settings: Settings,
};

export function getSectionIcon(sectionId: string): IconComponent {
  return ADMIN_SECTION_ICONS[sectionId] ?? LayoutDashboard;
}
