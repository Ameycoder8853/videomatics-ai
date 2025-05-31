
import { Composition, staticFile } from 'remotion';
import { MyVideoComposition, myVideoSchema, CompositionProps } from './MyVideo';

// Register your compositions here
export const RemotionRoot: React.FC = () => {
  // Get default values from the schema itself
  const defaultPropsFromSchema = myVideoSchema.parse(undefined);

  // Calculate a more dynamic default duration based on default props from schema
  const defaultNumSlides = defaultPropsFromSchema.imageUris.length;
  const defaultImageDuration = defaultPropsFromSchema.imageDurationInFrames;
  const defaultCompositionDuration = defaultNumSlides * defaultImageDuration;

  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={defaultCompositionDuration} // Dynamic default duration
        fps={30}
        width={1080}
        height={1920} // Portrait format
        schema={myVideoSchema}
        defaultProps={{
          ...defaultPropsFromSchema, // Spread all defaults from schema
          // Override specific defaults if needed, e.g. for files that need staticFile
          musicUri: staticFile('placeholder-music.mp3'), // Assuming you add this to public/
          // audioUri: staticFile('placeholder-audio.mp3'), // Only if you want default audio
        } satisfies CompositionProps}
      />
      {/* Add more compositions here if needed */}
    </>
  );
};
