
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, UserPlus } from 'lucide-react';
import type { UseFormReturn, SubmitHandler } from 'react-hook-form';

interface AuthFormProps {
  formType: 'login' | 'signup';
  form: UseFormReturn<any>;
  onSubmit: SubmitHandler<any>;
  isLoading: boolean;
}

export function AuthForm({ formType, form, onSubmit, isLoading }: AuthFormProps) {
  const isLogin = formType === 'login';

  const config = {
    login: {
      title: 'Welcome Back!',
      description: 'Log in to your Videomatics AI account to continue creating.',
      buttonIcon: <LogIn className="mr-2 h-5 w-5" />,
      buttonText: 'Log In',
      footerText: "Don't have an account?",
      footerLink: '/signup',
      footerLinkText: 'Sign Up',
    },
    signup: {
      title: 'Create Your Account',
      description: 'Join Videomatics AI and start creating amazing AI videos today!',
      buttonIcon: <UserPlus className="mr-2 h-5 w-5" />,
      buttonText: 'Sign Up',
      footerText: 'Already have an account?',
      footerLink: '/login',
      footerLinkText: 'Log In',
    },
  };

  const currentConfig = config[formType];

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">{currentConfig.title}</CardTitle>
        <CardDescription>{currentConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isLogin && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
              ) : (
                <>
                  {currentConfig.buttonIcon} {currentConfig.buttonText}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm">
        <p className="text-muted-foreground">
          {currentConfig.footerText}{' '}
          <Link href={currentConfig.footerLink} className="font-medium text-primary hover:underline">
            {currentConfig.footerLinkText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
