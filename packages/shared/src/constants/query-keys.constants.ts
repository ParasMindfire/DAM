export const QUERY_KEYS_CONSTANTS = {
  AUTH: {
    ME: 'auth-me',
    LOGIN: 'auth-login',
    REGISTER: 'auth-register',
  },
  ASSETS: {
    LIST: 'assets-list',
    DETAIL: 'assets-detail',
    SEARCH: 'assets-search',
    UPLOAD: 'assets-upload',
    DELETE: 'assets-delete',
  },
  COLLECTIONS: {
    LIST: 'collections-list',
    DETAIL: 'collections-detail',
    CREATE: 'collections-create',
    UPDATE: 'collections-update',
    DELETE: 'collections-delete',
  },
} as const;
