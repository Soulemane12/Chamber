/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use VERCEL_URL as the site URL in production
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'chamber-alpha.vercel.app',
    // Add all possible Vercel domains for the app
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'chamber-alpha.vercel.app',
  },
  // Allow Supabase authentication redirects from these domains
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  // Add custom headers for security and redirects
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
