import Link from "next/link";
import { Sparkles, Gamepad2, Music } from "lucide-react";
import { auth } from "@/lib/auth";
import { HeroSection } from "@/components/home/HeroSection";
import { GameTypeGrid } from "@/components/home/GameTypeGrid";
import { StatsBanner } from "@/components/home/StatsBanner";
import { GAME_TYPE_LIST } from "@/lib/game-types";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    // Marketing landing for signed-out visitors.
    return (
      <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full text-sm font-semibold text-primary mb-6 shadow-soft">
            <Sparkles className="w-4 h-4" /> Making hymn learning fun!
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
            HymnPlay
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Build a library of songs and turn them into games for Sunday school,
            family devotions, or personal study.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft"
            >
              <Gamepad2 className="w-5 h-5" /> Get started
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card font-bold shadow-soft"
            >
              <Music className="w-5 h-5" /> Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Personalized home for signed-in users.
  // Real counts are wired in tasks 22 (songs) and 34 (games + recent).
  return (
    <>
      <HeroSection />
      <GameTypeGrid />
      <StatsBanner
        songsAdded={0}
        gamesCreated={0}
        gamesPlayed={0}
        gameTypes={GAME_TYPE_LIST.length}
      />
    </>
  );
}
