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
 * This is the main configuration object for Remotion.
 */
Config.setProjectName('videomatics-ai');

/**
 * Customize the output format of the videos.
 */
Config.setOverwrite(true);

/**
 * Add a Webpack plugin to enable Tailwind CSS.
 */
Config.setTailwind(enableTailwind());
