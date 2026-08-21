export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`shimmer rounded-md ${className}`}
      {...props}
    />
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center gap-4 p-5">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="px-5 pb-5 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="border-t border-gray-50 pt-4 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-50">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
