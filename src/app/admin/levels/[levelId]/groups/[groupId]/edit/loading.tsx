import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEditGroupPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <Skeleton className="h-11 w-full sm:w-44" />
      <div className="space-y-4">
        <div className="flex w-full gap-2">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-28" />
        </div>
        <div className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      </div>
    </div>
  );
}
