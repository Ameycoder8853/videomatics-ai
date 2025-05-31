
import { Composition, staticFile } from 'remotion';
import { MyVideoComposition, myVideoSchema, CompositionProps } from './MyVideo';

// Register your compositions here
export const RemotionRoot: React.FC = () => {
  const defaultPropsFromSchema = myVideoSchema.parse(undefined);

  // This default duration is primarily for the Remotion Studio.
  // The actual rendered video length will be dynamically determined in handleClientSideRender.
  // Set a generous default to accommodate potentially long videos in the Studio.
  // e.g., 20 scenes * 5 seconds/scene (150 frames) = 3000 frames (100 seconds).
  const defaultCompositionDuration = 3000; 

  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={defaultCompositionDuration} 
        fps={30}
        width={1080}
        height={1920} // Portrait format
        schema={myVideoSchema}
        defaultProps={{
          ...defaultPropsFromSchema,
           musicUri: staticFile('placeholder-music.mp3'), // Ensure this is in public/
           // audioUri is now dynamically generated and passed as a prop.
           // imageUris are defaulted by the schema if not provided.
        } satisfies CompositionProps}
      />
    </>
  );
};
