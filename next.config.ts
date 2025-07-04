/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use VERCEL_URL as the site URL in production
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'chamber-alpha.vercel.app',
  },
};

export default nextConfig;
