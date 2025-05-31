
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
  script: z.string().default('Default script. This is a placeholder sentence. And another one for the slideshow! Even more text for a third slide.'),
  imageUris: z.array(z.string()).default([
    staticFile('images/placeholder-image1.png'),
    staticFile('images/placeholder-image2.png'),
    staticFile('images/placeholder-image3.png'),
  ]),
  audioUri: z.string().optional(),
  musicUri: z.string().optional(),
  captions: z.string().optional().default('Placeholder captions.'),
  primaryColor: zColor().default(zColor().parse('#111827')), // Darker background
  secondaryColor: zColor().default(zColor().parse('#F3F4F6')), // Light text
  fontFamily: z.string().default('Poppins, Inter, sans-serif'),
  imageDurationInFrames: z.number().int().min(30).default(120), // Default to 4 seconds per image at 30 FPS
});

export type CompositionProps = z.infer<typeof myVideoSchema>;

// A component for displaying a single piece of animated text
const AnimatedText: React.FC<{ text: string, color: string, fontFamily: string, animDurationInFrames: number }> = ({ text, color, fontFamily, animDurationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { stiffness: 80, damping: 30 },
    durationInFrames: fps * 0.7, // Fade in for 0.7s
  });

  const translateY = interpolate(
    frame,
    [0, fps * 0.7, animDurationInFrames - fps * 0.7, animDurationInFrames],
    [40, 0, 0, -40], // Slide in from bottom, slide out to top
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.1, 0.25, 1)}
  );

  return (
    <div
      style={{
        fontFamily,
        fontSize: '52px',
        fontWeight: '600',
        color,
        textAlign: 'center',
        padding: '20px 30px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '900px',
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
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
  primaryColor,
  secondaryColor,
  fontFamily,
  imageDurationInFrames,
}) => {
  const { fps } = useVideoConfig();
  const sentences = splitScriptIntoSentences(script);

  const safeImageUris = imageUris && imageUris.length > 0 ? imageUris : [staticFile('images/placeholder-image1.png')];
  const safeSentences = sentences.length > 0 ? sentences : ['Your amazing video content starts now!'];

  // Calculate total duration based on images/sentences for the composition itself
  // This ensures the composition is long enough for all its content.
  const compositionTotalDuration = safeImageUris.length * imageDurationInFrames;


  return (
    <AbsoluteFill style={{ backgroundColor: primaryColor.toString() }}>
      {/* Background Music */}
      {musicUri && <Audio src={musicUri.startsWith('/') ? staticFile(musicUri.substring(1)) : musicUri} volume={0.15} loop />}

      {/* Voiceover */}
      {audioUri && <Audio src={audioUri.startsWith('/') ? staticFile(audioUri.substring(1)) : audioUri} volume={0.8} />}

      {/* Slideshow of Images and Text */}
      {safeImageUris.map((imageSrc, index) => {
        const sentenceForThisSlide = safeSentences[index % safeSentences.length]; // Cycle through sentences
        const sequenceStartFrame = index * imageDurationInFrames;

        // Image animation: Ken Burns effect (slow zoom and pan)
        const imageScale = spring({
          frame: useCurrentFrame() - sequenceStartFrame,
          fps,
          from: 1,
          to: 1.1, // Zoom in slightly
          durationInFrames: imageDurationInFrames,
        });
        const imageTranslateX = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [0, (index % 2 === 0 ? -20 : 20)], // Pan left or right
          {easing: Easing.inOut(Easing.ease)}
        );
         const imageTranslateY = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [0, (index % 3 === 0 ? -10 : 10)], // Pan up or down slightly
          {easing: Easing.inOut(Easing.ease)}
        );


        return (
          <Sequence key={`slide-${index}`} from={sequenceStartFrame} durationInFrames={imageDurationInFrames}>
            <AbsoluteFill style={{ overflow: 'hidden' }}>
              <Img
                src={imageSrc.startsWith('/') ? staticFile(imageSrc.substring(1)) : imageSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${imageScale}) translateX(${imageTranslateX}px) translateY(${imageTranslateY}px)`,
                }}
                data-ai-hint={sentences[index % sentences.length] || "slideshow image"}
              />
               {/* Optional: Subtle vignette or overlay */}
              <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)' }} />
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
