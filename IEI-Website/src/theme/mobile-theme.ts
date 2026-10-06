/**
 * IEI Kuwait Design Tokens - Mirror of IEI-Mobile/src/theme/index.ts
 * EXACT source of truth for the IEI product ecosystem.
 */
export const mobileColors = {
  // Dark Brown Theme (Header, Footer, Dark Card, Hero Accents)
  background: '#402310',
  circleTopRight: '#5D3011',
  circleBottomLeft: '#2E2A18',
  dashboardHeaderBg: '#643312',
  dashboardStatCardBg: '#402310',
  dashboardBellCircle: '#402310',
  borderDark: '#5D3011',

  // Typography colors - Dark Surfaces
  textHeading: '#F9F4ED',
  textBody: '#D8CEC3',
  textPeach: '#FFC6A5',
  textMuted: '#8B634A',
  textFooter: '#D8CEC3',

  // Buttons & Interactive - Dark Screen
  googleButtonBg: '#F9F4ED',
  googleButtonText: '#201E1D',
  appleButtonBorder: '#BE7F54',
  appleButtonText: '#F9F4ED',
  appleButtonBg: 'transparent',
  linkUnderline: '#FFC6A5',

  // Find Record Screen (Warm Cream / Parchment Theme)
  screenBgLight: '#F5EAD8',
  textDark: '#201E1D',
  textSubDark: '#474238',
  textLabelDark: '#605C55',
  stepBadge: '#675F53',
  inputBg: '#E9DCC4',
  inputBorder: '#DCCBB0',
  matchedBannerBg: '#E1EECC',
  matchedBannerText: '#272E1B',
  primaryTerracotta: '#C67139',
  buttonTextLight: '#F9F4ED',
  linkTerracotta: '#C67139',

  // Home Dashboard Screen & Cards
  subscriptionCardBg: '#FFE1D0',
  eventCardBg: '#EBDDC5',
  eventDateBadgeBg: '#CCDBB2',
  eventDateBadgeText: '#272E1B',
  profileCardBg: '#E1EECC',
  profileProgressTrack: '#D0E2B4',
  profileProgressFill: '#5B6F40',
  profileChipBorder: '#B08055',
  profileChipText: '#8C5A34',
  profileMoreChipBg: '#D2E4BA',
  profileMoreChipText: '#55683C',
  utsavCardBg: '#F9F4ED',
  bottomCardBg: '#EBDDC5',

  // Navigation & Tab Bar
  tabBarBg: '#EEE7DB',
  tabBarBorder: '#E4DBD0',
  tabActive: '#C67139',
  tabInactive: '#8A8075',
} as const;

export default mobileColors;
