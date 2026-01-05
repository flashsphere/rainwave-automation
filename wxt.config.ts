import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Rainwave automation",
    web_accessible_resources: [{
      resources: ["main-world.js"],
      matches: ["https://rainwave.cc/*"],
    }],
    permissions: ['storage'],
  },
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      manifest['browser_specific_settings'] = {
        gecko: {
          id: '@rainwave-automation',
          data_collection_permissions: {
            'required': [
              'none'
            ]
          }
        }
      }
    },
  },
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
  vite: (env) => ({
    esbuild: env.mode === 'production' ? {
      drop: ['debugger'],
      pure: [
        'console.log',
        'console.info',
        'console.debug',
        'console.warn',
        'console.trace',
      ],
    } : undefined,
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    build: {
      emptyOutDir: true,
      sourcemap: true,
    },
  }),
});
