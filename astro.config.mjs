import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  server: { host: '127.0.0.1', port: 4174 },
  devToolbar: { enabled: false },
});
