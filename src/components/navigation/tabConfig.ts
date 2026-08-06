import {
  HouseIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  BellIcon,
  UserIcon,
  type IconProps,
} from 'phosphor-react-native';
import type React from 'react';

// Keyed by the file-based route name under app/(tabs)/ — shared by the
// mobile bottom bar (app/(tabs)/_layout.tsx) and the desktop sidebar
// (DesktopSidebar.tsx) so both stay in sync from one source of truth.
export const TAB_ROUTE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  index: HouseIcon,
  search: MagnifyingGlassIcon,
  vendors: StorefrontIcon,
  alerts: BellIcon,
  profile: UserIcon,
};
