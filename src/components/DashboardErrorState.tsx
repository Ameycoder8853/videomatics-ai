
'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardErrorStateProps {
  error: Error | any;
}

export function DashboardErrorState({ error }: DashboardErrorStateProps) {
  return (
    <Card className="text-center py-10 sm:py-12 bg-destructive/10 border-destructive/30">
      <CardHeader>
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <CardTitle className="text-xl sm:text-2xl text-destructive-foreground">Failed to Load Videos</CardTitle>
        <CardDescription className="text-destructive-foreground/80">
          {error?.message || "There was an issue fetching your videos. Please try again later."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
