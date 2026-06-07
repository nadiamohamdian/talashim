import type { IconComponent } from '@/shared/ui/icons';
import {
  ClipboardList,
  History,
  KeyRound,
  Monitor,
  UserCog,
} from '@/shared/ui/icons';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';

export interface SectionTheme {
  accent: string;
  accentMuted: string;
  iconBg: string;
  iconColor: string;
}

/** یکپارچه — همه بخش‌ها از پالت گرم برند */
const UNIFIED: SectionTheme = {
  accent: '#b8955f',
  accentMuted: 'rgba(203, 166, 112, 0.22)',
  iconBg: 'rgba(203, 166, 112, 0.14)',
  iconColor: '#6b5648',
};

export const SECTION_THEMES: Record<string, SectionTheme> = {
  overview: UNIFIED,
  catalog: UNIFIED,
  commerce: UNIFIED,
  trading: UNIFIED,
  pricing: UNIFIED,
  people: UNIFIED,
  finance: UNIFIED,
  reports: UNIFIED,
  content: UNIFIED,
  security: UNIFIED,
  settings: UNIFIED,
};

const NAV_ITEM_ICONS: Record<string, IconComponent> = {
  'security.audit': ClipboardList,
  'security.sessions': Monitor,
  'security.loginHistory': History,
  'security.roles': UserCog,
  'security.permissions': KeyRound,
  'users.roles': UserCog,
  'users.permissions': KeyRound,
};

export function getSectionTheme(_sectionId: string): SectionTheme {
  return UNIFIED;
}

export function getNavItemIcon(routeId: string, sectionId: string): IconComponent {
  return NAV_ITEM_ICONS[routeId] ?? getSectionIcon(sectionId);
}

export const STAT_ACCENTS = ['gold', 'brown', 'warm', 'neutral'] as const;

export type StatAccent = (typeof STAT_ACCENTS)[number];

export const STAT_ACCENT_STYLES: Record<
  StatAccent,
  { bg: string; color: string; ring: string }
> = {
  gold: { bg: 'rgba(203, 166, 112, 0.16)', color: '#6b5648', ring: 'rgba(203, 166, 112, 0.3)' },
  brown: { bg: 'rgba(86, 71, 57, 0.08)', color: '#564739', ring: 'rgba(86, 71, 57, 0.15)' },
  warm: { bg: 'rgba(203, 166, 112, 0.12)', color: '#7a6554', ring: 'rgba(203, 166, 112, 0.22)' },
  neutral: { bg: 'rgba(86, 71, 57, 0.06)', color: '#6b5f55', ring: 'rgba(86, 71, 57, 0.12)' },
};

/** @deprecated use gold | brown | warm | neutral */
export const LEGACY_STAT_ACCENT_MAP: Record<string, StatAccent> = {
  gold: 'gold',
  emerald: 'brown',
  teal: 'warm',
  slate: 'neutral',
  amber: 'gold',
  violet: 'brown',
  rose: 'neutral',
  cyan: 'warm',
};
