/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'nebula-ai-uploads.s3.amazonaws.com',
      'nebula-ai-uploads.s3.us-east-1.amazonaws.com'
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Enable compression
  compress: true,
}

module.exports = nextConfig
