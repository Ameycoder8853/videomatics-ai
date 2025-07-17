
'use client';

import type { VideoDocument } from '@/firebase/firestore';
import { Info, Image as ImageIcon, PaletteIcon, TypeIcon as FontIcon, ClockIcon, MusicIcon } from 'lucide-react';

interface VideoConfigurationProps {
  video: VideoDocument;
}

export function VideoConfiguration({ video }: VideoConfigurationProps) {
  return (
    <>
      <h3 className="font-semibold text-lg sm:text-xl font-headline flex items-center"><Info className="mr-2 h-5 w-5 text-accent"/>Video Configuration</h3>
      
      <dl className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground flex items-center"><ClockIcon className="mr-1.5 h-4 w-4"/>Total Duration:</dt>
          <dd>{(video.totalDurationInFrames / 30).toFixed(1)}s</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground flex items-center"><ClockIcon className="mr-1.5 h-4 w-4"/>Duration/Scene:</dt>
          <dd>{(video.imageDurationInFrames / 30).toFixed(1)}s</dd>
        </div>
         <div className="flex justify-between">
          <dt className="text-muted-foreground flex items-center"><ImageIcon className="mr-1.5 h-4 w-4"/>Scenes/Images:</dt>
          <dd>{video.scriptDetails?.scenes?.length || video.imageUris?.length || 0}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-muted-foreground flex items-center"><PaletteIcon className="mr-1.5 h-4 w-4"/>Primary Color:</dt>
          <dd><div className="w-4 h-4 rounded border" style={{backgroundColor: video.primaryColor}}></div></dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-muted-foreground flex items-center"><PaletteIcon className="mr-1.5 h-4 w-4" style={{opacity:0.6}}/>Secondary Color:</dt>
          <dd><div className="w-4 h-4 rounded border" style={{backgroundColor: video.secondaryColor}}></div></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground flex items-center"><FontIcon className="mr-1.5 h-4 w-4"/>Font Family:</dt>
          <dd className="truncate max-w-[100px] sm:max-w-[150px]">{video.fontFamily.split(',')[0]}</dd>
        </div>
        {video.musicUri && video.musicUri !== 'NO_MUSIC_SELECTED' && (
          <div className="flex justify-between">
              <dt className="text-muted-foreground flex items-center"><MusicIcon className="mr-1.5 h-4 w-4"/>Music:</dt>
              <dd className="truncate max-w-[100px] sm:max-w-[150px]">{video.musicUri.substring(video.musicUri.lastIndexOf('/') + 1)}</dd>
          </div>
        )}
      </dl>

      {video.imageUris && video.imageUris.length > 0 && (
           <div className="mt-3 sm:mt-4">
              <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-accent"/>Generated Images</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 sm:max-h-60 overflow-y-auto">
                  {video.imageUris.map((imgUrl, index) => (
                      <div key={index} className="relative aspect-[9/16] rounded-md overflow-hidden shadow">
                          <img src={imgUrl} alt={`Scene ${index + 1}`} className="absolute inset-0 w-full h-full object-cover"/>
                      </div>
                  ))}
              </div>
          </div>
      )}
      
      {video.audioUri && (
          <div className="mt-3 sm:mt-4">
              <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline">Voiceover</h4>
              <audio controls src={video.audioUri} className="w-full">Your browser does not support audio.</audio>
          </div>
      )}
      {video.captions && (
          <div className="mt-3 sm:mt-4">
              <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline">Transcript</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap p-2 border rounded-md max-h-32 sm:max-h-40 overflow-y-auto">{video.captions}</p>
          </div>
      )}
    </>
  );
}
