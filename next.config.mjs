/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable image optimization for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['manga-art-basics-club.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manga-art-basics-club.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable compression
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Simplified experimental features to prevent errors
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Minimal webpack configuration to prevent errors
  webpack: (config, { dev, isServer }) => {
    // Disable all optimizations that might cause issues
    if (!dev && !isServer) {
      // Use default chunk splitting only
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
      
      // Disable minification temporarily to isolate the issue
      config.optimization.minimize = false;
    }
    
    // Reduce bundle size warnings
    config.performance = {
      hints: false,
      maxEntrypointSize: 1024000,
      maxAssetSize: 1024000,
    };
    
    // Add error handling for module loading
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        "fs": false,
        "path": false,
        "crypto": false,
      },
    };
    
    return config;
  },
  // Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/tutorials',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/competitions',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/about',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=7200, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/homework',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
}

export default nextConfig
