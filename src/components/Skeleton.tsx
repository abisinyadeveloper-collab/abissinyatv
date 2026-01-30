import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("skeleton-pulse", className)} />
);

export const VideoCardSkeleton = () => (
  <div className="video-card">
    <Skeleton className="aspect-video w-full" />
    <div className="p-3">
      <div className="flex gap-3">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

export const VideoCardHorizontalSkeleton = () => (
  <div className="flex gap-3 p-2">
    <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
    <Skeleton className="w-full h-full" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);
