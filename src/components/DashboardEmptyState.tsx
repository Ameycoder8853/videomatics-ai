
'use client';

import Link from 'next/link';
import { Film, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardEmptyState() {
  return (
    <Card className="text-center py-10 sm:py-12">
      <CardHeader>
        <Film className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
        <CardTitle className="text-xl sm:text-2xl font-headline">No Videos Yet</CardTitle>
        <CardDescription className="text-sm sm:text-base">Start creating your first AI video masterpiece!</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/generate" passHref>
          <Button size="lg" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
            Generate Your First Video
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
