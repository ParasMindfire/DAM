import { register } from 'tsconfig-paths';
import { resolve } from 'path';

register({
  baseUrl: resolve(__dirname, '..'),
  paths: {
    '@dam/logger': ['../../packages/logger/src'],
    '@dam/shared': ['../../packages/shared/src'],
  },
});
