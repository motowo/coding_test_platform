/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    // Type checking is performed separately in CI/CD pipeline
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint is run separately in CI/CD pipeline
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      // Add production domains here
    ],
  },
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig