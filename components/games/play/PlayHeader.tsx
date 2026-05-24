import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface PlayHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  /** Override the default exit color for the brand match per game type. */
  accentColorClass?: string;
}

export function PlayHeader({
  title,
  subtitle,
  badge,
  accentColorClass = "text-primary",
}: PlayHeaderProps) {
  return (
    <header className="bg-card border-b-2 border-border px-4 py-3 flex items-center justify-between gap-3">
      <Link
        href="/games"
        className={`inline-flex items-center gap-1.5 font-semibold ${accentColorClass}`}
      >
        <ArrowLeft className="w-4 h-4" /> Exit
      </Link>
      <div className="text-center min-w-0">
        <h1 className={`text-base sm:text-lg font-extrabold truncate ${accentColorClass}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <div className="min-w-0">{badge}</div>
    </header>
  );
}
