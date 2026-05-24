import Link from "next/link";
import { Sparkles, Gamepad2, Music } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-primary/10 to-background py-12 px-4 sm:py-16">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full text-sm font-semibold text-primary mb-6 shadow-soft">
          <Sparkles className="w-4 h-4" />
          Making hymn learning fun!
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Learn your favorite songs<br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--color-game-blue), var(--color-game-coral))",
            }}
          >
            through play
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
          Create custom games from any hymn or song. Perfect for Sunday school,
          family devotions, or personal study.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/games/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft hover:brightness-105 transition"
          >
            <Gamepad2 className="w-5 h-5" />
            Create a Game
          </Link>
          <Link
            href="/songs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card text-foreground font-bold shadow-soft hover:bg-muted transition"
          >
            <Music className="w-5 h-5" />
            Browse Songs
          </Link>
        </div>
      </div>
    </section>
  );
}
