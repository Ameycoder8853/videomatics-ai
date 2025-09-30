
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { staticFile } from 'remotion';

const avatarFormSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters.' }).max(200, { message: 'Topic cannot exceed 200 characters.' }),
  avatarId: z.string().default('aadhya_public-en-IN'),
  duration: z.string().optional(),
});

export type AIAvatarFormValues = z.infer<typeof avatarFormSchema>;

interface AIAvatarFormProps {
  onSubmit: SubmitHandler<AIAvatarFormValues>;
  isLoading: boolean;
}

const availableAvatars = [
    { id: 'aadhya_public-en-IN', name: 'Aadhya', image: staticFile('/avatars/female-avatar.png'), dataAiHint: 'female avatar' },
    { id: 'veer_public-en-IN', name: 'Veer', image: staticFile('/avatars/male-avatar.png'), dataAiHint: 'male avatar' },
];

const videoDurations = [
  { value: 'short', label: 'Short (~3-5 scenes)' },
  { value: 'medium', label: 'Medium (~5-8 scenes)' },
  { value: 'long', label: 'Long (~8-15 scenes)' },
];


export function AIAvatarForm({ onSubmit, isLoading }: AIAvatarFormProps) {
  const form = useForm<AIAvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      topic: 'A short, inspiring story about achieving a difficult goal.',
      avatarId: 'aadhya_public-en-IN',
      duration: 'short',
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
                  placeholder="e.g., 'The importance of cybersecurity for small businesses'"
                  className="resize-y min-h-[100px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The AI will generate a script based on this topic.
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
          name="avatarId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select Indian AI Avatar</FormLabel>
               <FormDescription>Choose an avatar for your video.</FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  disabled={isLoading}
                >
                  {availableAvatars.map((avatar) => (
                    <FormItem key={avatar.id} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={avatar.id} id={avatar.id} className="sr-only" />
                      </FormControl>
                      <Label
                        htmlFor={avatar.id}
                        className={cn(
                          "relative rounded-lg overflow-hidden cursor-pointer border-2 border-transparent transition-all hover:opacity-90",
                          "w-full aspect-[3/4]",
                           field.value === avatar.id && "border-primary ring-2 ring-primary"
                        )}
                      >
                         <Image
                            src={avatar.image}
                            alt={avatar.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            data-ai-hint={avatar.dataAiHint}
                         />
                         <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/50 text-white text-xs text-center truncate">
                            {avatar.name}
                         </div>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
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
          {isLoading ? 'Generating Avatar Video...' : 'Generate Avatar Video'}
        </Button>
      </form>
    </Form>
  );
}
