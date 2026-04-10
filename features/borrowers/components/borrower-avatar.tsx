import { cn } from "@/core/lib/utils";

type BorrowerAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
};

export function BorrowerAvatar({ name, image, className }: BorrowerAvatarProps) {
  if (image) {
    return (
      <div
        aria-label={name ?? "Borrower avatar"}
        className={cn("h-12 w-12 rounded-full bg-cover bg-center", className)}
        role="img"
        style={{ backgroundImage: `url(${image})` }}
      />
    );
  }

  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 font-medium text-white",
        className,
      )}
    >
      {initials || "B"}
    </div>
  );
}
