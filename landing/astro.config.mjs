// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
// https://astro.build/config
export default defineConfig({
  site: 'https://pabrik-startup.vercel.app',
  integrations: [
    starlight({
      title: 'Pabrik Startup Docs',
      description: 'Dokumentasi Pabrik Startup - From Idea to MVP',
      logo: {
        light: './public/layout/logo-light.svg',
        dark: './public/layout/logo-dark.svg',
        alt: 'Pabrik Startup',
        replacesTitle: true,
      },
      favicon: '/favicon/favicon.svg', 
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: 'docs' },
            { label: 'Installation', slug: 'installation' },
            { label: 'Core Concepts', slug: 'core-concepts' },
          ],
        },
        {
          label: 'Features',
          items: [
            { label: 'AI Prompts', slug: 'ai-prompts' },
            { label: 'File Systems', slug: 'file-systems' },
            { label: 'CRM & CSV', slug: 'crm-csv' },
          ],
        },
      ],
      customCss: ['./src/styles/global.css'],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
      },
    }),
    mdx(),
    sitemap(),
    react(),
  ],

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400', '500', '600', '700'],
    },
    {
      provider: fontProviders.google(),
      name: 'Azeret Mono',
      cssVariable: '--font-azeret-mono',
      weights: ['400', '500', '600', '700'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: 'all',
    },
    preview: {
      allowedHosts: 'all',
    },
  },
});
