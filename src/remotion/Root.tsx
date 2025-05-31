
import { Composition, staticFile } from 'remotion';
import { MyVideoComposition, myVideoSchema, CompositionProps } from './MyVideo';

// Register your compositions here
export const RemotionRoot: React.FC = () => {
  // Calculate a more dynamic default duration based on default props
  const defaultImageUris = [
    'https://placehold.co/1080x1920.png?text=VividVerse+Default+1',
    'https://placehold.co/1080x1920.png?text=VividVerse+Default+2',
    'https://placehold.co/1080x1920.png?text=VividVerse+Default+3',
  ];
  const defaultImageDuration = 90; // 3 seconds at 30 FPS
  const defaultScriptSentences = "Welcome to VividVerse! Create stunning AI videos. Let's get started!".match(/[^.!?]+[.!?]+/g) || [];
  const defaultNumSlides = Math.max(defaultImageUris.length, defaultScriptSentences.length, 1);
  const defaultCompositionDuration = defaultNumSlides * defaultImageDuration + 30; // Add a little buffer

  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={defaultCompositionDuration} // More dynamic duration
        fps={30}
        width={1080}
        height={1920} // Portrait format
        schema={myVideoSchema}
        defaultProps={{
          script: 'Welcome to VividVerse! Create stunning AI videos. Let us help you make your story shine!',
          imageUris: defaultImageUris,
          imageDurationInFrames: defaultImageDuration,
          audioUri: undefined, // No default audio
          musicUri: staticFile('placeholder-music.mp3'), // Assuming you add this to public/
          captions: 'Start creating amazing videos today!', // Still here but MyVideo uses script for text
          primaryColor: myVideoSchema.shape.primaryColor.parse('#673AB7'),
          secondaryColor: myVideoSchema.shape.secondaryColor.parse('#FFFFFF'),
          fontFamily: 'Poppins, Inter, sans-serif',
        } satisfies CompositionProps}
      />
      {/* Add more compositions here if needed */}
    </>
  );
};

    