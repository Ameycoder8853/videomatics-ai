// All configuration options for Remotion are defined in this file.

import { Config } from '@remotion/cli/config';
import { enableTailwind } from "@remotion/tailwind";

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Config.setChromiumMultiProcessOnLinux(true); // Uncomment if facing issues on Linux

// This template processes the Tailwind configuration file if it exists.
// And enables Tailwind for Remotion.
Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});


// Allow calls to the GenAI & Google Cloud APIs.
Config.setBypassCorsWarning(true);
Config.setPrivacy('public');
Config.setEntryPoint('src/remotion/Root.tsx'); // Entry point for Remotion compositions

// Optional: If you have a specific browser executable path for rendering
// Config.setBrowserExecutable('/path/to/your/chrome');

// Optional: For server-side rendering with Lambda, configure regions, memory, etc.
// Config.setRegions(['us-east-1']);
// Config.setMemorySizeInMb(2048);
// Config.setDiskSizeInMb(2048);
// Config.setTimeoutInSeconds(240);
// Config.setPixelFormat('yuv420p');
// Config.setConcurrencyPerLambda(1);
