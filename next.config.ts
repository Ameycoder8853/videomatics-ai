import type {NextConfig} from 'next';
import { CachingStrategy } from '@remotion/next/dist/webpack-override';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Often needed for complex Remotion setups with Next.js
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add other image hostnames if needed
    ],
  },
  // Recommended for Remotion:
  // Set up a Remotion request handler
  // Remotion Webpack
  webpack: (config, { isServer }) => {
    // Add a rule to handle .mp4 files for Remotion if not already handled
     config.module.rules.push({
      test: /\.mp4$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'static/media/', // Output path for media files
            publicPath: '/_next/static/media/', // Public path for media files
          },
        },
      ],
    });
    
    // Remotion: Allows HMR to work inside node_modules for Remotion packages
    config.watchOptions = {
      ignored: ['**/node_modules/**'],
    };

    // Remotion: Prevent errors from breaking the build
    // This is a common workaround for issues with certain Remotion dependencies or features in Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // common issue
        path: false, // common issue
        crypto: false, // common issue
        // 'process': require.resolve('process/browser'), // If process is needed
      };
    }
    
    // Make sure a WebAssembly module can be used.
    //This is needed for FFMPEG, which Remotion uses under the hood.
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    
    return config;
  },
  // Optional: Serve static files from public directory correctly for Remotion assets
  // (Next.js does this by default, but ensure no conflicting configs)
};

// If you have @remotion/next installed, you could wrap with `withRemotion`
// import {withRemotion} from '@remotion/next';
// export default withRemotion(nextConfig, {
//   publicDir: 'public', // Default public directory
//   // Optional: Caching strategy for Remotion assets
//   // cachingStrategy: CachingStrategy.FS // Example: File system caching
// });

export default nextConfig;
