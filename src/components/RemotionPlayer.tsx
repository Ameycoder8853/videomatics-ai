'use client';

import { Player, PlayerRef } from '@remotion/player';
import type { ComponentPropsWithoutRef, RefAttributes } from 'react';
import type { AwsAmplifyOutputs } from '@remotion/lambda-common'; // For potential Lambda integration later
import { MyVideoComposition, CompositionProps } from '@/remotion/MyVideo'; // Assuming MyVideo composition
import { staticFile } from 'remotion';

interface RemotionPlayerProps extends Omit<ComponentPropsWithoutRef<typeof Player>, 'component' | 'compositionWidth' | 'compositionHeight' | 'fps' | 'durationInFrames'> {
  compositionId: string; // ID of the composition to play
  inputProps: CompositionProps; // Props for the composition
}

// This is essential for Remotion to find your components.
// It is also required for the Remotion Studio to work.
// If you are using server-side rendering, you should not import this file on the server.
import('../remotion/Root');


export const RemotionPlayer: React.FC<RemotionPlayerProps & RefAttributes<PlayerRef>> = ({
  compositionId,
  inputProps,
  ...playerProps
}) => {
  
  // This example assumes a single composition 'MyVideo' is generally used,
  // but you can make this more dynamic if needed.
  // For this MVP, we hardcode dimensions and FPS based on what's typical for 'MyVideo'.
  const compositionWidth = 1080;
  const compositionHeight = 1920;
  const fps = 30;
  const durationInFrames = 300; // Default to 10 seconds

  // Resolve local static files correctly
  const resolvedInputProps = {
    ...inputProps,
    ...(inputProps.imageUri && inputProps.imageUri.startsWith('/') 
        ? { imageUri: staticFile(inputProps.imageUri.substring(1)) } 
        : {}),
    ...(inputProps.audioUri && inputProps.audioUri.startsWith('/') 
        ? { audioUri: staticFile(inputProps.audioUri.substring(1)) }
        : {}),
  };

  return (
    <Player
      component={MyVideoComposition} // This should be the component itself, not the ID.
      // Or, if you want to use compositionId, you need to pass compositions to Player.
      // For simplicity with one main composition, directly passing the component is easier.
      // compositionId={compositionId} // This prop is for @remotion/lambda or more complex setups with multiple comps.
      inputProps={resolvedInputProps}
      durationInFrames={durationInFrames}
      compositionWidth={compositionWidth}
      compositionHeight={compositionHeight}
      fps={fps}
      controls // Show default player controls
      loop
      {...playerProps} // Spread other player props like style, className etc.
    />
  );
};
