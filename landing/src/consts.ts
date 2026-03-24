// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Pabrik Startup - From Idea to MVP';
export const SITE_DESCRIPTION =
  'Platform untuk membangun startup dari ide hingga MVP. Validasi ide, bangun produk, dan luncurkan startup Anda dengan cepat.';

export const SITE_METADATA = {
  title: {
    default: SITE_TITLE,
    template: '%s | Pabrik Startup',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Startup',
    'MVP',
    'Ide Bisnis',
    'Validasi Ide',
    'Product Development',
    'Entrepreneurship',
    'Astro',
    'React',
    'TypeScript',
    'TailwindCSS',
  ],
  authors: [{ name: 'pabrikstartup.id' }],
  creator: 'pabrikstartup.id',
  publisher: 'pabrikstartup.id',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Pabrik Startup',
    images: [
      {
        url: '/images/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Pabrik Startup - From Idea to MVP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/images/og-image.jpeg'],
    creator: '@pabrikstartup',
  },
};
