import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/user-profile";

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  variant = "default",
  className,
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "header";
  className?: string;
}) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-9 text-sm",
    lg: "size-20 text-xl",
    xl: "size-24 text-2xl sm:size-28",
  };

  const ringClasses =
    variant === "header"
      ? "ring-2 ring-violet-500/25 ring-offset-2 ring-offset-background"
      : "ring-2 ring-border";

  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full",
          ringClasses,
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={
            size === "xl"
              ? "112px"
              : size === "lg"
                ? "80px"
                : size === "md"
                  ? "36px"
                  : "32px"
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/10 font-semibold text-violet-700 dark:text-violet-300",
        ringClasses,
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
