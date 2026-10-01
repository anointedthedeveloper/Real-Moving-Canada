/** Navigation definitions shared by the header, footer and customer portal. */

export const PRIMARY_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const FOOTER_COMPANY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/service-areas', label: 'Service areas' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/login', label: 'Login' },
];

export const DASHBOARD_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'grid', end: true },
  { to: '/dashboard/moves', label: 'My Moves', icon: 'truck' },
  { to: '/dashboard/quotes', label: 'Quotes', icon: 'file' },
  { to: '/dashboard/bookings', label: 'Bookings', icon: 'calendar' },
  { to: '/dashboard/payments', label: 'Payments', icon: 'card' },
  { to: '/dashboard/documents', label: 'Documents', icon: 'folder' },
  { to: '/dashboard/messages', label: 'Messages', icon: 'message' },
  { to: '/dashboard/profile', label: 'Profile', icon: 'user' },
  { to: '/dashboard/settings', label: 'Settings', icon: 'settings' },
];

/** Bottom tab bar on phones (design: Customer App Mobile). */
export const DASHBOARD_TABS = [
  { to: '/dashboard', label: 'Overview', icon: 'grid', end: true },
  { to: '/dashboard/moves', label: 'Moves', icon: 'truck', match: ['/dashboard/moves', '/dashboard/quotes', '/dashboard/bookings', '/dashboard/payments'] },
  { to: '/dashboard/messages', label: 'Messages', icon: 'message' },
  { to: '/dashboard/profile', label: 'Account', icon: 'user', match: ['/dashboard/profile', '/dashboard/settings', '/dashboard/documents'] },
];
