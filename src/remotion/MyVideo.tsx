
import { Composition, AbsoluteFill, Sequence, Audio, staticFile, Img, useVideoConfig, useCurrentFrame, spring, interpolate, Easing } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const myVideoSchema = z.object({
  title: z.string().default('My Awesome Video'),
  sceneTexts: z.array(z.string()).default(['Welcome to this amazing video!', 'Let us explore something cool.', 'And conclude with a flourish!']),
  imageUris: z.array(z.string()).default([
    staticFile('images/placeholder-image1.png'), 
    staticFile('images/placeholder-image2.png'),
    staticFile('images/placeholder-image3.png'),
  ]),
  audioUri: z.string().optional(), 
  musicUri: z.string().optional().default(staticFile('placeholder-music.mp3')),
  captions: z.string().optional().default('Placeholder captions for the whole video.'),
  primaryColor: zColor().default('#1F2937'), 
  secondaryColor: zColor().default('#F9FAFB'), 
  fontFamily: z.string().default('Poppins, Inter, sans-serif'),
  imageDurationInFrames: z.number().int().min(30).default(120), 
});

export type CompositionProps = z.infer<typeof myVideoSchema>;

/**
 * Safely resolves an asset path. If it's a full URL or already a Remotion static asset path,
 * it returns it as is. Otherwise, it treats it as a file in the /public directory.
 * This prevents `staticFile` from being called on a URL that is already a URL.
 * @param assetPath The path or URL to the asset.
 * @returns A resolved URL suitable for Remotion's <Img> or <Audio> components.
 */
const resolveAsset = (assetPath?: string): string | undefined => {
  if (!assetPath) {
    return undefined;
  }
  // Check if it's a full URL (http, https, data, blob) or a Remotion-processed asset path
  if (/^(https?|data|blob):/.test(assetPath) || assetPath.startsWith('/_next/static/')) {
    return assetPath;
  }
  // Assume it's a local file in the public directory that needs `staticFile`
  const path = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
  try {
    return staticFile(path);
  } catch (err) {
    return undefined;
  }
};


const AnimatedText: React.FC<{ text: string, color: string, fontFamily: string, sceneDurationInFrames: number }> = ({ text, color, fontFamily, sceneDurationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDuration = Math.min(fps * 0.8, sceneDurationInFrames * 0.2); 
  const fadeOutStart = sceneDurationInFrames - Math.min(fps * 0.8, sceneDurationInFrames * 0.2);

  const opacity = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, sceneDurationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const translateY = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, sceneDurationInFrames],
    [30, 0, 0, -30], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1) }
  );

  return (
    <div
      style={{
        fontFamily,
        fontSize: '48px',
        fontWeight: '600',
        color,
        textAlign: 'center',
        padding: '25px 35px',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '800px',
        position: 'absolute',
        left: '50%',
        bottom: '12%',
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
  sceneTexts,
  imageUris,
  audioUri,
  musicUri,
  primaryColor,
  secondaryColor,
  fontFamily,
  imageDurationInFrames, 
}) => {
  const { fps } = useVideoConfig();

  const safeImageUris = imageUris && imageUris.length > 0 ? imageUris : [staticFile('images/placeholder-image1.png')];
  const safeSceneTexts = sceneTexts && sceneTexts.length > 0 ? sceneTexts : ['Your video content.'];

  const numScenes = Math.max(safeImageUris.length, safeSceneTexts.length);
  const finalImageUris = Array.from({ length: numScenes }, (_, i) => safeImageUris[i] || safeImageUris[0] || staticFile('images/placeholder-image1.png'));
  const finalSceneTexts = Array.from({ length: numScenes }, (_, i) => safeSceneTexts[i] || safeSceneTexts[0] || ' ');

  const resolvedMusicUri = resolveAsset(musicUri);
  const resolvedAudioUri = resolveAsset(audioUri);
  const playMusic = resolvedMusicUri && musicUri !== 'NO_MUSIC_SELECTED';

  return (
    <AbsoluteFill style={{ backgroundColor: primaryColor.toString() }}>
      {playMusic && <Audio src={resolvedMusicUri} volume={0.1} loop />}
      {resolvedAudioUri && <Audio src={resolvedAudioUri} volume={0.9} />} 

      {finalImageUris.map((imageSrc, index) => {
        const textForThisSlide = finalSceneTexts[index];
        const sequenceStartFrame = index * imageDurationInFrames;
        
        const imageScale = spring({
          frame: useCurrentFrame() - sequenceStartFrame,
          fps,
          from: 1.05, 
          to: 1.15,
          durationInFrames: imageDurationInFrames,
          config: { stiffness: 30, damping: 20 }
        });
        const imageTranslateX = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [index % 2 === 0 ? -10 : 10, index % 2 === 0 ? 5 : -5], 
          {easing: Easing.linear}
        );
         const imageTranslateY = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, imageDurationInFrames],
          [index % 3 === 0 ? -5 : 5, index % 3 === 0 ? 2 : -2], 
          {easing: Easing.linear}
        );
        
        const imageOpacity = interpolate(
          useCurrentFrame() - sequenceStartFrame,
          [0, fps * 0.5, imageDurationInFrames - fps * 0.5, imageDurationInFrames],
          [0, 1, 1, 0], 
          { easing: Easing.inOut(Easing.ease), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const finalImageSrc = resolveAsset(imageSrc);
        if (!finalImageSrc) {
            return null; // Don't render a sequence if the image source is invalid
        }

        return (
          <Sequence key={`slide-${index}`} from={sequenceStartFrame} durationInFrames={imageDurationInFrames}>
            <AbsoluteFill style={{ overflow: 'hidden', opacity: imageOpacity }}>
              <Img
                src={finalImageSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${imageScale}) translateX(${imageTranslateX}px) translateY(${imageTranslateY}px)`,
                }}
                data-ai-hint={textForThisSlide?.substring(0,30) || "slideshow image"}
              />
              <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)' }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatedText
                text={textForThisSlide}
                color={secondaryColor.toString()}
                fontFamily={fontFamily}
                sceneDurationInFrames={imageDurationInFrames} 
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
