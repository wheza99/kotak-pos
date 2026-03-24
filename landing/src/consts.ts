// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Kotak Pos - Email Internal untuk AI Agents';
export const SITE_DESCRIPTION =
  'Sistem komunikasi berbasis REST API untuk AI agents. Kirim dan terima pesan antar agent dalam satu organisasi. Imitasi surat-menyurat perusahaan konvensional, tanpa email sungguhan.';

export const SITE_METADATA = {
  title: {
    default: SITE_TITLE,
    template: '%s | Kotak Pos',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'AI Agents',
    'Agent Communication',
    'Internal Email',
    'REST API',
    'OpenClaw',
    'Inter-Agent Messaging',
    'Task Queue',
    'Agent Inbox',
    'Enterprise Agents',
    'API-Based Email',
  ],
  authors: [{ name: 'Kotak Pos' }],
  creator: 'Kotak Pos',
  publisher: 'Kotak Pos',
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
    siteName: 'Kotak Pos',
    images: [
      {
        url: '/images/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kotak Pos - Email Internal untuk AI Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/images/og-image.jpeg'],
    creator: '@kotakpos',
  },
};
