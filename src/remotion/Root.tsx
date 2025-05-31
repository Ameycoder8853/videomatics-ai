import { Composition } from 'remotion';
import { MyVideoComposition, myVideoSchema, CompositionProps } from './MyVideo';

// Register your compositions here
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={300} // 10 seconds at 30 FPS
        fps={30}
        width={1080}
        height={1920} // Portrait format
        schema={myVideoSchema}
        defaultProps={{
          script: 'Welcome to VividVerse! AI-powered video creation.',
          imageUri: 'https://placehold.co/1080x1920.png', // Default placeholder
          audioUri: undefined, // No default audio
          captions: 'Start creating amazing videos today!',
          // Default colors and font will be taken from MyVideo schema defaults
        } satisfies CompositionProps} // Ensure defaultProps match the schema
      />
      {/* Add more compositions here if needed */}
    </>
  );
};
