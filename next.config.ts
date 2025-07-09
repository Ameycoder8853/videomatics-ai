
import type {NextConfig} from 'next';
// CachingStrategy might be useful if you customize withRemotion options,
// but it's not strictly necessary for basic setup.
// import { CachingStrategy } from '@remotion/next/dist/webpack-override';

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
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
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
    // This watchOptions might be handled by withRemotion, but keeping it shouldn't harm.
    // config.watchOptions = {
    //   ignored: ['**/node_modules/**'],
    // };

    // Remotion: Prevent errors from breaking the build
    // This is a common workaround for issues with certain Remotion dependencies or features in Next.js
    // withRemotion might also handle some of these.
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

export default nextConfig;
