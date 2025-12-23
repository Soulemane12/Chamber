/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use VERCEL_URL as the site URL in production
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'chamber-alpha.vercel.app',
  },
  images: {
    qualities: [75, 85],
  },
  turbopack: {
    // Force Turbopack to use this directory as the workspace root to silence multiple lockfile warnings
    root: __dirname,
  },
};

export default nextConfig;
