
'use client';

import { Player, PlayerRef } from '@remotion/player';
import { ComponentPropsWithoutRef, RefAttributes, useEffect, useState } from 'react';
import { MyVideoComposition, CompositionProps } from '@/remotion/MyVideo';

interface RemotionPlayerProps extends Omit<ComponentPropsWithoutRef<typeof Player>, 'component' | 'compositionWidth' | 'compositionHeight' | 'fps' | 'durationInFrames'> {
  compositionId: string; // ID of the composition to play
  inputProps: CompositionProps; // Props for the composition
}

export const RemotionPlayer: React.FC<RemotionPlayerProps & RefAttributes<PlayerRef>> = ({
  compositionId,
  inputProps,
  ...playerProps
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // This is essential for Remotion to find your components.
    // It is also required for the Remotion Studio to work.
    // We do it in a useEffect to avoid server-side execution and module loading issues.
    import('../remotion/Root').then(() => {
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return null; // Or a loading spinner
  }
  
  // This example assumes a single composition 'MyVideo' is generally used.
  const compositionWidth = 1080;
  const compositionHeight = 1920;
  const fps = 30;
  // This default duration is for the studio, the actual duration is passed in playerProps from the page.
  const durationInFrames = 300; 

  return (
    <Player
      component={MyVideoComposition} // This should be the component itself, not the ID.
      inputProps={inputProps} // Pass props directly
      durationInFrames={durationInFrames}
      compositionWidth={compositionWidth}
      compositionHeight={compositionHeight}
      fps={fps}
      controls
      loop
      {...playerProps} // Spread other player props like style, className, poster etc.
    />
  );
};
