
import { Composition, AbsoluteFill, Sequence, Audio, staticFile, Img, useVideoConfig, useCurrentFrame, spring, interpolate, Easing } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// Helper to split script into sentences (fallback if structured script isn't used)
const splitScriptIntoSentences = (script: string): string[] => {
  if (!script) return [];
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
};

export const myVideoSchema = z.object({
  title: z.string().default('My Awesome Video'),
  sceneTexts: z.array(z.string()).default(['Welcome to this amazing video!', 'Let us explore something cool.', 'And conclude with a flourish!']),
  imageUris: z.array(z.string()).default([
    staticFile('images/placeholder-image1.png'),
    staticFile('images/placeholder-image2.png'),
    staticFile('images/placeholder-image3.png'),
  ]),
  audioUri: z.string().optional(), // For main voiceover
  musicUri: z.string().optional(), // For background music
  captions: z.string().optional().default('Placeholder captions for the whole video.'), // Overall captions
  primaryColor: zColor().default('#1F2937'), // Dark grey-blue
  secondaryColor: zColor().default('#F9FAFB'), // Very light grey / off-white
  fontFamily: z.string().default('Poppins, Inter, sans-serif'),
  imageDurationInFrames: z.number().int().min(30).default(120), // 4 seconds at 30 FPS
});

export type CompositionProps = z.infer<typeof myVideoSchema>;

const AnimatedText: React.FC<{ text: string, color: string, fontFamily: string, animDurationInFrames: number }> = ({ text, color, fontFamily, animDurationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 20, mass: 0.8 },
    durationInFrames: fps * 0.6,
  });

  const translateY = interpolate(
    frame,
    [0, fps * 0.6, animDurationInFrames - fps * 0.8, animDurationInFrames],
    [50, 0, 0, -50],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)}
  );

  return (
    <div
      style={{
        fontFamily,
        fontSize: '48px', // Slightly smaller for potentially longer scene texts
        fontWeight: '600',
        color,
        textAlign: 'center',
        padding: '25px 35px',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '800px', // Adjusted max width
        position: 'absolute',
        bottom: '12%', // Adjusted position
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
      }}
    >
      {text}
    </div>
  );
};

export const MyVideoComposition: React.FC<CompositionProps> = ({
  // title, // Title not directly used in composition visuals currently, but good for metadata
  sceneTexts,
  imageUris,
  audioUri,
  musicUri,
  // captions, // Captions prop is for overall accessibility, sceneTexts drive visuals
  primaryColor,
  secondaryColor,
  fontFamily,
  imageDurationInFrames,
}) => {
  const { fps } = useVideoConfig();

  // Ensure we always have some defaults if props are empty, though schema should handle this.
  const safeImageUris = imageUris && imageUris.length > 0 ? imageUris : [staticFile('images/placeholder-image1.png')];
  const safeSceneTexts = sceneTexts && sceneTexts.length > 0 ? sceneTexts : ['Your video content.'];

  // Log resolved audio URIs for debugging
  if (typeof window !== 'undefined') { // Only log in browser environment
    console.log('MyVideoComposition Props:');
    console.log('  audioUri (prop):', audioUri);
    console.log('  musicUri (prop):', musicUri);
    const resolvedAudio = audioUri && (audioUri.startsWith('/') ? staticFile(audioUri.substring(1)) : audioUri);
    const resolvedMusic = musicUri && (musicUri.startsWith('/') ? staticFile(musicUri.substring(1)) : musicUri);
    console.log('  Resolved Audio URI for <Audio>:', resolvedAudio);
    console.log('  Resolved Music URI for <Audio>:', resolvedMusic);
  }


  return (
    <AbsoluteFill style={{ backgroundColor: primaryColor.toString() }}>
      {/* Background Music: Ensure file exists in public/ */}
      {musicUri && <Audio src={musicUri.startsWith('/') ? staticFile(musicUri.substring(1)) : musicUri} volume={0.1} loop />}

      {/* Voiceover: Ensure file exists in public/ */}
      {audioUri && <Audio src={audioUri.startsWith('/') ? staticFile(audioUri.substring(1)) : audioUri} volume={0.9} />}

      {safeImageUris.map((imageSrc, index) => {
        const textForThisSlide = safeSceneTexts[index % safeSceneTexts.length]; // Cycle through scene texts
        const sequenceStartFrame = index * imageDurationInFrames;

        const imageScale = spring({
          frame: useCurrentFrame() - sequenceStartFrame,
          fps,
          from: 1.05, // Start slightly zoomed in
          to: 1.15,
          durationInFrames: imageDurationInFrames,
          config: { stiffness: 30, damping: 20 }
        });
        const imageTranslateX = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [index % 2 === 0 ? -10 : 10, index % 2 === 0 ? 5 : -5], // Subtle pan
          {easing: Easing.linear}
        );
         const imageTranslateY = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [index % 3 === 0 ? -5 : 5, index % 3 === 0 ? 2 : -2], // Subtle pan
          {easing: Easing.linear}
        );
        const imageOpacity = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, fps * 0.5, imageDurationInFrames - fps * 0.5, imageDurationInFrames],
          [0, 1, 1, 0], // Fade in and out
          { easing: Easing.inOut(Easing.ease) }
        );


        return (
          <Sequence key={`slide-${index}`} from={sequenceStartFrame} durationInFrames={imageDurationInFrames}>
            <AbsoluteFill style={{ overflow: 'hidden', opacity: imageOpacity }}>
              <Img
                src={imageSrc.startsWith('/') ? staticFile(imageSrc.substring(1)) : imageSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${imageScale}) translateX(${imageTranslateX}px) translateY(${imageTranslateY}px)`,
                }}
                data-ai-hint={safeSceneTexts[index % safeSceneTexts.length]?.substring(0,30) || "slideshow image"}
              />
              <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)' }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatedText
                text={textForThisSlide}
                color={secondaryColor.toString()}
                fontFamily={fontFamily}
                animDurationInFrames={imageDurationInFrames - fps * 0.3} // Animation duration within the slide
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
