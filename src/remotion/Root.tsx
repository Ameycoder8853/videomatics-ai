
import { Composition, staticFile } from 'remotion';
import { MyVideoComposition, myVideoSchema, CompositionProps } from './MyVideo';

// Register your compositions here
export const RemotionRoot: React.FC = () => {
  const defaultPropsFromSchema = myVideoSchema.parse(undefined);

  // Calculate default duration based on the number of default images/scenes and their duration
  const defaultNumScenes = defaultPropsFromSchema.sceneTexts.length; // Or imageUris.length
  const defaultImageDuration = defaultPropsFromSchema.imageDurationInFrames;
  const defaultCompositionDuration = defaultNumScenes * defaultImageDuration;

  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={defaultCompositionDuration} // Dynamic default based on default scenes
        fps={30}
        width={1080}
        height={1920} // Portrait format
        schema={myVideoSchema}
        defaultProps={{
          ...defaultPropsFromSchema,
          // Explicitly set any file paths that need staticFile if they are part of defaults
           audioUri: staticFile('placeholder-audio.mp3'), // Ensure this is in public/
           musicUri: staticFile('placeholder-music.mp3'), // Ensure this is in public/
           // imageUris are already defaulted with staticFile in the schema
        } satisfies CompositionProps}
      />
    </>
  );
};
