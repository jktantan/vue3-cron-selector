import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

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
        '@': resolve(__dirname, 'src'),
      },
    },
    ...(isLib
      ? {
          build: {
            lib: {
              entry: resolve(__dirname, 'src/lib/index.ts'),
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
