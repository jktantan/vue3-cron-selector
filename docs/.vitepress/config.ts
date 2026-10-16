import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * GitHub Pages project sites are served from `/<repo>/`, while local dev and
 * preview run from `/`. The CI workflow sets VITEPRESS_BASE=/vue3-cron-selector/.
 */
const base = process.env.VITEPRESS_BASE ?? '/'

const repoUrl = 'https://github.com/jktantan/vue3-cron-selector'

export default defineConfig({
  base,
  title: 'vue3-cron-selector',
  description: 'A visual cron expression selector component for Vue 3',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://jktantan.github.io/vue3-cron-selector/',
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    ['link', { rel: 'apple-touch-icon', href: `${base}logo.svg` }],
  ],
  vite: {
    resolve: {
      alias: {
        // Demo pages import the real component straight from source, so the
        // site always documents the code that is actually in the repository.
        'vue3-cron-selector': resolve(repoRoot, 'src/lib/index.ts'),
      },
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: repoUrl }],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © jktantan',
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/utilities' },
          { text: 'Demo', link: '/demo/' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Formats', link: '/guide/formats' },
                { text: 'Props & Events', link: '/guide/props-events' },
                { text: 'Composables', link: '/guide/composables' },
                { text: 'i18n / Locale', link: '/guide/i18n' },
                { text: 'Theming', link: '/guide/theming' },
                { text: 'Accessibility & Positioning', link: '/guide/accessibility' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'Utility Functions', link: '/api/utilities' },
                { text: 'Type Definitions', link: '/api/types' },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'vue3-cron-selector',
      description: '面向 Vue 3 的可视化 Cron 表达式选择器组件',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'API', link: '/zh/api/utilities' },
          { text: '演示', link: '/zh/demo/' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速上手', link: '/zh/guide/getting-started' },
                { text: '格式说明', link: '/zh/guide/formats' },
                { text: '属性与事件', link: '/zh/guide/props-events' },
                { text: '组合式函数', link: '/zh/guide/composables' },
                { text: '国际化', link: '/zh/guide/i18n' },
                { text: '主题定制', link: '/zh/guide/theming' },
                { text: '无障碍与定位', link: '/zh/guide/accessibility' },
              ],
            },
          ],
          '/zh/api/': [
            {
              text: 'API 参考',
              items: [
                { text: '工具函数', link: '/zh/api/utilities' },
                { text: '类型定义', link: '/zh/api/types' },
              ],
            },
          ],
        },
        footer: {
          message: '基于 Apache-2.0 许可证发布',
          copyright: 'Copyright © jktantan',
        },
      },
    },
  },
})
