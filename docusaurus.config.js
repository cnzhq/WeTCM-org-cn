// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import contentMetrics from './plugins/content-metrics.cjs';

const {countContentWords} = contentMetrics;

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '皇家太医院',
  tagline: 'WeTCM',
  favicon: 'img/pic_logo_1333.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://wetcm.org.cn',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Preload only the regular MiSans face used by first-screen body text.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/misans/MiSans-Regular.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'style',
      attributes: {},
      innerHTML: `
@font-face {
  font-family: 'MiSans';
  src: url('/fonts/misans/MiSans-Regular.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'MiSans';
  src: url('/fonts/misans/MiSans-Bold.woff2') format('woff2');
  font-display: swap;
  font-weight: 700;
  font-style: normal;
}
`,
    },
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cnzhq', // Usually your GitHub org/user name.
  projectName: 'WeTCM-org-cn', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans'.
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        htmlLang: 'zh-Hans',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './config/sidebars/docs.js',
        },
        blog: false, // 禁用默认博客，使用下面的插件配置
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    './plugins/literature-authors',
    // 主博客（正常博客）
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'blog', // 默认博客
        path: 'blog',
        routeBasePath: 'blog',
        showReadingTime: true,
        blogSidebarCount: 'ALL',
        blogSidebarTitle: '所有文章',
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
        processBlogPosts: async ({blogPosts}) =>
          blogPosts.map((blogPost) => ({
            ...blogPost,
            metadata: {
              ...blogPost.metadata,
              wordCount: countContentWords(blogPost.content),
            },
          })),
      },
    ],
    // 小说专区 - 独立的 docs 实例
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'literature',
        path: 'literature',
        routeBasePath: 'literature',
        sidebarPath: './config/sidebars/literature.js',
      },
    ],
    // 隐藏文档专区 - 独立的 docs 实例，不在导航栏显示
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'book',
        path: 'book',
        routeBasePath: 'book',
        sidebarPath: './config/sidebars/book.js',
      },
    ],
    // 重定向配置：访问 /book 自动跳转到 /book/intro
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/book',
            to: '/book/intro',
          },
          {
            from: '/book/category/中医基础理论',
            to: '/book/category/basic-theory-of-tcm',
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '皇家太医院',
        
        logo: {
          alt: 'My Site Logo',
          src: 'img/pic_logo_1333.png',
        },
        
        items: [
          {to: '/docs/intro', label: '文档', position: 'left'},
          {to: '/blog', label: '博客', position: 'left'},
          {to: '/literature/intro', label: '文学', position: 'left'},
          {to: '/book/intro', label: '图书', position: 'left'},
          {href: 'https://wiki.wetcm.org.cn', label: '百科', position: 'left'},
          // {to: '/docs/university/ntu-interview', label: '大学资料', position: 'left'},
          // {to: '/time', label: '时间校对', position: 'left'},
          // {to: '/links', label: '友情链接', position: 'left'},
          // {to: '/blog/archive', label: '归档', position: 'left'},
          // {to: '/blog/tags', label: '标签', position: 'left'},
        ],
      },
      footer: {},
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
    // 这是twemoji的客户端模块配置
      clientModules: [
    './src/clientModules/twemoji.ts',
  ],
};

export default config;
