
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const avatarFormSchema = z.object({
  script: z.string().min(20, { message: 'Script must be at least 20 characters.' }).max(2000, { message: 'Script cannot exceed 2000 characters.' }),
  avatarId: z.string().default('josh_lite-en-US'),
});

export type AIAvatarFormValues = z.infer<typeof avatarFormSchema>;

interface AIAvatarFormProps {
  onSubmit: SubmitHandler<AIAvatarFormValues>;
  isLoading: boolean;
}

const availableAvatars = [
    { id: 'josh_lite-en-US', name: 'Josh (Casual)' },
    // In the future, more avatars can be added here
    // { id: 'anna_lite-en-US', name: 'Anna (Professional)' },
]

export function AIAvatarForm({ onSubmit, isLoading }: AIAvatarFormProps) {
  const form = useForm<AIAvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      script: 'Welcome to Videomatics AI! Here, you can transform your ideas into stunning videos with our cutting-edge artificial intelligence technology. Get started today and bring your vision to life.',
      avatarId: 'josh_lite-en-US',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatarId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Avatar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI avatar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableAvatars.map((avatar) => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <FormDescription>More avatars coming soon!</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar Script</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the text you want the avatar to speak..."
                  className="resize-y min-h-[150px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The AI will speak this text in the video.
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
          {isLoading ? 'Generating Avatar Video...' : 'Generate Avatar Video'}
        </Button>
      </form>
    </Form>
  );
}
