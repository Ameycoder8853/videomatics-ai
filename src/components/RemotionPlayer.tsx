
'use client';

import { Player, PlayerRef } from '@remotion/player';
import { ComponentPropsWithoutRef, RefAttributes, useEffect, useState, Suspense, lazy } from 'react';
import { MyVideoComposition, CompositionProps } from '@/remotion/MyVideo';
import { Skeleton } from './ui/skeleton';

// Use React.lazy to dynamically import the Player component.
// This is a more robust way to handle code-splitting with Next.js and Webpack.
const LazyPlayer = lazy(() =>
  import('../remotion/Root').then(() => {
    // The dynamic import of Root registers the compositions.
    // We can then return the Player component in a default export format.
    return { default: Player };
  })
);

interface RemotionPlayerProps extends Omit<ComponentPropsWithoutRef<typeof Player>, 'component' | 'compositionWidth' | 'compositionHeight' | 'fps' | 'durationInFrames'> {
  compositionId: string; // ID of the composition to play
  inputProps: CompositionProps; // Props for the composition
}

export const RemotionPlayer: React.FC<RemotionPlayerProps & RefAttributes<PlayerRef>> = ({
  compositionId,
  inputProps,
  ...playerProps
}) => {
  const compositionWidth = 1080;
  const compositionHeight = 1920;
  const fps = 30;
  // This default duration is for the studio, the actual duration is passed in playerProps from the page.
  const durationInFrames = 300; 

  return (
    <Suspense fallback={<Skeleton className="w-full h-full" />}>
      <LazyPlayer
        component={MyVideoComposition} // This should be the component itself
        inputProps={inputProps} // Pass props directly
        durationInFrames={durationInFrames}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        fps={fps}
        controls
        loop
        {...playerProps} // Spread other player props like style, className, poster etc.
      />
    </Suspense>
  );
};
