
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const VideoDetailSkeleton = () => (
  <div className="space-y-6 sm:space-y-8">
    <Skeleton className="h-6 w-48" />
    <Card className="shadow-lg">
      <CardHeader className="border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-grow space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-28" />
            <Skeleton className="h-9 w-full sm:w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 p-4 sm:p-6">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Skeleton className="aspect-[9/16] w-full max-w-[280px] mx-auto rounded-lg" />
          <div>
            <Skeleton className="h-7 w-40 mb-3" />
            <div className="space-y-3 max-h-96 overflow-hidden p-3 bg-muted/30 rounded-md border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border rounded-md bg-background shadow-sm space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-7 w-48 mb-3" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="aspect-[9/16] rounded-md" />
              <Skeleton className="aspect-[9/16] rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
