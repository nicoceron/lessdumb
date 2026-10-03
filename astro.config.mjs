import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'node:url';
import { catalogIndexPlugin } from './scripts/catalog-index-plugin.mjs';

const edge = process.env.LESSDUMB_PLATFORM === 'cloudflare';

export default defineConfig({
  output: 'server',
  adapter: edge
    ? cloudflare({ imageService: 'passthrough' })
    : node({ mode: 'standalone' }),
  session: false,
  integrations: [react()],
  devToolbar: { enabled: false },
  vite: {
    resolve: {
      alias: {
        '#request-backend': fileURLToPath(
          new URL(
            edge
              ? './src/lib/server/cloudflare-backend.ts'
              : './src/lib/server/request-backend.ts',
            import.meta.url,
          ),
        ),
      },
    },
    plugins: [catalogIndexPlugin(), tailwindcss()],
    optimizeDeps: {
      include: [
        'lucide-react',
        '@uiw/react-codemirror',
        '@codemirror/lang-python',
        'better-auth/react',
      ],
    },
  },
});
