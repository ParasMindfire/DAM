export const ROUTES_CONSTANTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  DASHBOARD: {
    HOME: '/',
    ASSETS: '/assets',
    COLLECTIONS: '/collections',
    SETTINGS: '/settings',
    PROFILE: '/profile',
  },
  ASSET: {
    DETAIL: '/assets/:id',
    UPLOAD: '/assets/upload',
    EDIT: '/assets/:id/edit',
  },
  COLLECTION: {
    DETAIL: '/collections/:id',
    CREATE: '/collections/create',
    EDIT: '/collections/:id/edit',
  },
} as const;
