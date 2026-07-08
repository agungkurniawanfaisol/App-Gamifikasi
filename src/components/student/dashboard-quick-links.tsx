import { cn } from "@/lib/utils";

export function DashboardQuickLinks({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
