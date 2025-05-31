
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2, Palette, Type, ClockIcon, Music } from 'lucide-react';
import { myVideoSchema } from '@/remotion/MyVideo'; 
import { staticFile } from 'remotion';

const videoFormSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters long.' }).max(200, { message: 'Topic must be at most 200 characters long.' }),
  style: z.string().optional(),
  duration: z.string().optional(), 
  primaryColor: myVideoSchema.shape.primaryColor.optional(),
  secondaryColor: myVideoSchema.shape.secondaryColor.optional(),
  fontFamily: myVideoSchema.shape.fontFamily.optional(),
  imageDurationInFrames: myVideoSchema.shape.imageDurationInFrames.optional(), // This is now a HINT for script generation
  musicUri: z.string().optional(), // For background music selection
});

export type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoFormProps {
  onSubmit: SubmitHandler<VideoFormValues>;
  isLoading: boolean;
  defaultValues?: Partial<VideoFormValues>;
}

const videoStyles = [
  { value: 'educational', label: 'Educational' },
  { value: 'funny', label: 'Funny' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'gaming', label: 'Gaming Highlights' },
  { value: 'tutorial', label: 'Tutorial/How-To' },
];

const videoDurations = [
  { value: 'short', label: 'Short (AI aims for ~3-5 scenes)' },
  { value: 'medium', label: 'Medium (AI aims for ~5-8 scenes)' },
  { value: 'long', label: 'Long (AI aims for ~8-15 scenes)' },
];

const fontFamilies = [
    { value: 'Poppins, Inter, sans-serif', label: 'Poppins (Modern)' },
    { value: 'Roboto, sans-serif', label: 'Roboto (Classic)' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat (Stylish)' },
    { value: 'Lato, sans-serif', label: 'Lato (Friendly)' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans (Readable)' },
];

// This now serves as a hint for the AI script generator
const imageDurationHints = [
    { value: 60, label: '2s/scene (Fast Pace Hint)' },
    { value: 90, label: '3s/scene (Medium Pace Hint)' },
    { value: 120, label: '4s/scene (Standard Pace Hint)' },
    { value: 150, label: '5s/scene (Slower Pace Hint)' },
];

const backgroundMusicOptions = [
    { value: staticFile('placeholder-music.mp3'), label: 'Default Relaxing Tune' },
    { value: staticFile('upbeat-music.mp3'), label: 'Upbeat Energetic Track (Add this file to public/)' }, // Example
    { value: '', label: 'No Background Music' },
];


export function VideoForm({ onSubmit, isLoading, defaultValues }: VideoFormProps) {
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { 
      topic: defaultValues?.topic || '',
      style: defaultValues?.style || '',
      duration: defaultValues?.duration || 'long', // Default to long
      primaryColor: defaultValues?.primaryColor || myVideoSchema.shape.primaryColor.parse(undefined),
      secondaryColor: defaultValues?.secondaryColor || myVideoSchema.shape.secondaryColor.parse(undefined),
      fontFamily: defaultValues?.fontFamily || myVideoSchema.shape.fontFamily.parse(undefined),
      imageDurationInFrames: defaultValues?.imageDurationInFrames || myVideoSchema.shape.imageDurationInFrames.parse(undefined),
      musicUri: defaultValues?.musicUri ?? staticFile('placeholder-music.mp3'),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Topic</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'The future of renewable energy' or 'A quick guide to making sourdough bread'"
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Main subject of your video.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Style (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a video style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {videoStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desired Video Length (AI Guided)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select desired length category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {videoDurations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageDurationInFrames"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />Scene Duration Hint for AI</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={String(field.value)}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hint for AI text conciseness" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {imageDurationHints.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Guides AI on text length per scene. Final timing based on audio.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="musicUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Music className="mr-2 h-4 w-4 text-muted-foreground"/>Background Music</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select background music" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {backgroundMusicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Ensure custom music files are in your `public/` folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground"/>Primary Color (Background)</FormLabel>
              <FormControl>
                <Input type="color" {...field} disabled={isLoading} className="h-10 p-1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground"/>Secondary Color (Text)</FormLabel>
              <FormControl>
                <Input type="color" {...field} disabled={isLoading} className="h-10 p-1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fontFamily"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Type className="mr-2 h-4 w-4 text-muted-foreground"/>Font Family</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating Video Assets...' : 'Generate Video Content'}
        </Button>
      </form>
    </Form>
  );
}
