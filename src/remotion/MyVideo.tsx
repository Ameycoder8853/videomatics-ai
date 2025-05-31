import { Composition, AbsoluteFill, Sequence, Audio, staticFile, Img, useVideoConfig, useCurrentFrame } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// Define the schema for the props
export const myVideoSchema = z.object({
  script: z.string().default('Default script text. This is a placeholder.'),
  imageUri: z.string().default(staticFile('images/placeholder-image.png')), // Default to a local placeholder
  audioUri: z.string().optional(),
  captions: z.string().optional().default('Placeholder captions.'),
  primaryColor: zColor().default(zColor().parse('#673AB7')), // Deep Purple
  secondaryColor: zColor().default(zColor().parse('#FFFFFF')), // White
  fontFamily: z.string().default('Poppins, Inter, sans-serif'),
});

export type CompositionProps = z.infer<typeof myVideoSchema>;

const Title: React.FC<{ text: string, color: string, fontFamily: string }> = ({ text, color, fontFamily }) => {
  return (
    <div
      style={{
        fontFamily,
        fontSize: '72px',
        fontWeight: 'bold',
        color,
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '10px',
      }}
    >
      {text}
    </div>
  );
};

const CaptionsDisplay: React.FC<{ text: string, color: string, fontFamily: string }> = ({ text, color, fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Simple animation for captions: appear word by word (very basic)
  const words = text.split(' ');
  const wordsToShow = Math.floor(frame / (fps / 2)); // Show a new word every 0.5 seconds approx.
  
  return (
    <div
      style={{
        fontFamily,
        fontSize: '48px',
        color,
        textAlign: 'center',
        position: 'absolute',
        bottom: '10%',
        width: '90%',
        left: '5%',
        padding: '15px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
      }}
    >
      {words.slice(0, wordsToShow).join(' ')}
    </div>
  );
};


export const MyVideoComposition: React.FC<CompositionProps> = ({
  script,
  imageUri,
  audioUri,
  captions,
  primaryColor,
  secondaryColor,
  fontFamily,
}) => {
  const { fps, width, height } = useVideoConfig();
  const durationInFrames = fps * 10; // Default 10 second video

  return (
    <AbsoluteFill style={{ backgroundColor: primaryColor.toString() }}>
      {imageUri && (
        <Img
          src={imageUri.startsWith('/') ? staticFile(imageUri.substring(1)) : imageUri} // Handle local vs remote URLs
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          data-ai-hint="video background" // Generic hint
        />
      )}
      
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sequence from={0} durationInFrames={durationInFrames}>
          <Title text={script.substring(0, 50) + (script.length > 50 ? "..." : "")} color={secondaryColor.toString()} fontFamily={fontFamily} />
        </Sequence>
      </AbsoluteFill>

      {captions && (
        <Sequence from={fps * 1} durationInFrames={durationInFrames - fps * 1}>
           <CaptionsDisplay text={captions} color={secondaryColor.toString()} fontFamily={fontFamily} />
        </Sequence>
      )}

      {audioUri && <Audio src={audioUri.startsWith('/') ? staticFile(audioUri.substring(1)) : audioUri} />}
    </AbsoluteFill>
  );
};
