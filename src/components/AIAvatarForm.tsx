
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


const avatarFormSchema = z.object({
  script: z.string().min(20, { message: 'Script must be at least 20 characters.' }).max(2000, { message: 'Script cannot exceed 2000 characters.' }),
  avatarId: z.string().default('aadhya_public-en-IN'),
});

export type AIAvatarFormValues = z.infer<typeof avatarFormSchema>;

interface AIAvatarFormProps {
  onSubmit: SubmitHandler<AIAvatarFormValues>;
  isLoading: boolean;
}

const availableAvatars = [
    { id: 'aadhya_public-en-IN', name: 'Aadhya', image: 'https://picsum.photos/seed/aadhya-new/400/400' },
    { id: 'veer_public-en-IN', name: 'Veer', image: 'https://picsum.photos/seed/veer-new/400/400' },
]

export function AIAvatarForm({ onSubmit, isLoading }: AIAvatarFormProps) {
  const form = useForm<AIAvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      script: 'Welcome to Videomatics AI! Here, you can transform your ideas into stunning videos with our cutting-edge artificial intelligence technology. Get started today and bring your vision to life.',
      avatarId: 'aadhya_public-en-IN',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explanatory Script</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the text you want the avatar to speak..."
                  className="resize-y min-h-[150px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The AI avatar will narrate this text in the video.
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
