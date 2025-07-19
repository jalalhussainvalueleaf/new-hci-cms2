/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable static export for production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    // Add remote patterns if needed for production
    remotePatterns: process.env.NODE_ENV === 'production' ? [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames in production
      },
    ] : undefined,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Add any other configurations you might need
};

// Conditionally add configuration based on environment
if (process.env.NODE_ENV === 'development') {
  // Development-specific configurations
  nextConfig.experimental = {
    serverActions: true, // If you're using Server Actions
  };
}

module.exports = nextConfig;
