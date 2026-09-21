import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  return {
    plugins: [
      vue(),
      ...(isLib
        ? [
            dts({
              include: ['src/lib/**/*.ts', 'src/lib/**/*.vue'],
              exclude: ['src/dev/**', 'src/test/**'],
              outDirs: 'dist',
              tsconfigPath: './tsconfig.app.json',
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
    ...(isLib
      ? {
          build: {
            lib: {
              entry: resolve(rootDir, 'src/lib/index.ts'),
              name: 'Vue3CronSelector',
              formats: ['es', 'umd'] as const,
              fileName: 'vue3-cron-selector',
            },
            rollupOptions: {
              external: ['vue'],
              output: {
                globals: { vue: 'Vue' },
                exports: 'named',
              },
            },
            cssCodeSplit: false,
          },
        }
      : {}),
  }
})
