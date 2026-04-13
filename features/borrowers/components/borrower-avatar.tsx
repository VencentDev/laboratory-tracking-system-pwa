import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type BorrowerAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
};

export function BorrowerAvatar({ name, image, className }: BorrowerAvatarProps) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar
      aria-label={name ?? "Borrower avatar"}
      className={cn("h-12 w-12", className)}
    >
      <AvatarImage alt={name ?? "Borrower avatar"} src={image ?? undefined} />
      <AvatarFallback className="font-medium">{initials || "B"}</AvatarFallback>
    </Avatar>
  );
}
