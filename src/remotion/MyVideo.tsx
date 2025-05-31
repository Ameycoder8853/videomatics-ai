
import { Composition, AbsoluteFill, Sequence, Audio, staticFile, Img, useVideoConfig, useCurrentFrame, spring, interpolate, Easing } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// Helper to split script into sentences
const splitScriptIntoSentences = (script: string): string[] => {
  if (!script) return [];
  // Basic split by period, question mark, exclamation mark. Can be improved.
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
};

// Define the schema for the props
export const myVideoSchema = z.object({
  script: z.string().default('Default script. This is a placeholder sentence. And another one for the slideshow!'),
  imageUris: z.array(z.string()).default([staticFile('images/placeholder-image.png')]),
  audioUri: z.string().optional(),
  musicUri: z.string().optional(),
  captions: z.string().optional().default('Placeholder captions if script is not used directly.'), // May deprecate if script is always used for text
  primaryColor: zColor().default(zColor().parse('#673AB7')),
  secondaryColor: zColor().default(zColor().parse('#FFFFFF')),
  fontFamily: z.string().default('Poppins, Inter, sans-serif'),
  imageDurationInFrames: z.number().default(90), // Default to 3 seconds per image at 30 FPS
});

export type CompositionProps = z.infer<typeof myVideoSchema>;

// A component for displaying a single piece of animated text
const AnimatedText: React.FC<{ text: string, color: string, fontFamily: string, animDurationInFrames: number }> = ({ text, color, fontFamily, animDurationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { stiffness: 50, damping: 200 },
    durationInFrames: fps * 0.5, // Fade in for 0.5s
  });

  const translateY = interpolate(
    frame,
    [0, fps * 0.5, animDurationInFrames - fps * 0.5, animDurationInFrames],
    [50, 0, 0, -50], // Slide in from bottom, slide out to top
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        fontFamily,
        fontSize: '60px', // Adjusted for potentially longer text
        fontWeight: 'bold',
        color,
        textAlign: 'center',
        padding: '30px',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: '15px',
        width: '90%',
        position: 'absolute',
        bottom: '15%', // Position text lower
        left: '5%',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const MyVideoComposition: React.FC<CompositionProps> = ({
  script,
  imageUris,
  audioUri,
  musicUri,
  // captions, // Using script for dynamic text now
  primaryColor,
  secondaryColor,
  fontFamily,
  imageDurationInFrames,
}) => {
  const { fps, width, height } = useVideoConfig();
  const sentences = splitScriptIntoSentences(script);

  // Ensure there's at least one image URI and one sentence for safety
  const safeImageUris = imageUris.length > 0 ? imageUris : [staticFile('images/placeholder-image.png')];
  const safeSentences = sentences.length > 0 ? sentences : ['Your amazing video content!'];

  // Calculate total duration based on images/sentences
  // Each image/sentence pair gets imageDurationInFrames
  const totalDurationForSlideshow = Math.max(safeImageUris.length, safeSentences.length) * imageDurationInFrames;


  return (
    <AbsoluteFill style={{ backgroundColor: primaryColor.toString() }}>
      {/* Background Music */}
      {musicUri && <Audio src={musicUri.startsWith('/') ? staticFile(musicUri.substring(1)) : musicUri} volume={0.25} loop />}
      
      {/* Voiceover */}
      {audioUri && <Audio src={audioUri.startsWith('/') ? staticFile(audioUri.substring(1)) : audioUri} />}

      {/* Slideshow of Images and Text */}
      {safeImageUris.map((imageSrc, index) => {
        const sentenceForThisSlide = safeSentences[index % safeSentences.length]; // Cycle through sentences if fewer than images
        const sequenceStartFrame = index * imageDurationInFrames;

        return (
          <Sequence key={`slide-${index}`} from={sequenceStartFrame} durationInFrames={imageDurationInFrames}>
            <AbsoluteFill>
              <Img
                src={imageSrc.startsWith('/') ? staticFile(imageSrc.substring(1)) : imageSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                data-ai-hint="slideshow image" 
              />
            </AbsoluteFill>
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatedText
                text={sentenceForThisSlide}
                color={secondaryColor.toString()}
                fontFamily={fontFamily}
                animDurationInFrames={imageDurationInFrames - fps * 0.5} // Allow time for exit animation
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

    