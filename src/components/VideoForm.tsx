'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2 } from 'lucide-react';

const videoFormSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters long.' }).max(200, { message: 'Topic must be at most 200 characters long.' }),
  style: z.string().optional(),
  duration: z.string().optional(),
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
];

const videoDurations = [
  { value: 'short', label: 'Short (e.g., < 1 min)' },
  { value: 'medium', label: 'Medium (e.g., 1-3 mins)' },
  { value: 'long', label: 'Long (e.g., > 3 mins)' },
];

export function VideoForm({ onSubmit, isLoading, defaultValues }: VideoFormProps) {
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: defaultValues || {
      topic: '',
      style: '',
      duration: '',
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
                Clearly describe the main subject or theme of your video.
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
              <FormDescription>
                Choose a style that best fits your video's tone and purpose.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Duration (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a desired duration" />
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
              <FormDescription>
                Give an idea of how long you want the video to be.
              </FormDescription>
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
          {isLoading ? 'Generating...' : 'Generate Video Content'}
        </Button>
      </form>
    </Form>
  );
}
