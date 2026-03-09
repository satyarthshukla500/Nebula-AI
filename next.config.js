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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nebula-ai-uploads.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nebula-ai-uploads.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Enable compression
  compress: true,
  // Webpack configuration to handle Node.js built-ins
  webpack: (config, { isServer }) => {
    // Exclude Node.js built-in modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
