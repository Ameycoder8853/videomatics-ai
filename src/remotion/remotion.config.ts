// @ts-nocheck
/**
 * This file is used to configure Remotion's CLI.
 *
 * You can customize various aspects of Remotion's behavior by uncommenting and
 * modifying the following options.
 *
 * If you change this file, you need to restart the Remotion development server.
 */
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * The browser-side bundle can be configured here.
 */
Config.setBundler('webpack', {
  // Add custom webpack configuration here
});

/**
 * This is the main configuration object for Remotion.
 */
Config.setProjectName('videomatics-ai');

/**
 * Customize the browser that is used to render the videos.
 */
Config.setBrowserExecutable(
  // You can set a custom browser executable path here.
  // By default, Remotion will download a private version of Chromium.
);

/**
 * Customize the output format of the videos.
 */
Config.setOverwrite(true);

/**
 * Add a Webpack plugin to enable Tailwind CSS.
 */
Config.setTailwind(enableTailwind());
