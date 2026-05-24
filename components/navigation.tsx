import Link from "next/link";
import { Music, BookOpen, Gamepad2, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export async function Navigation() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-card border-b-4 border-primary/20 sticky top-0 z-50 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl"
            style={{
              background: "linear-gradient(135deg, var(--color-game-blue), var(--color-game-coral))",
            }}
          >
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground leading-tight">HymnPlay</h1>
            <p className="text-xs text-muted-foreground leading-tight">Learn songs through games</p>
          </div>
        </Link>

        {user ? (
          <nav className="flex items-center gap-2">
            <Link
              href="/songs"
              className="hidden sm:flex px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-semibold items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Songs
            </Link>
            <Link
              href="/games"
              className="hidden sm:flex px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-semibold items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              Games
            </Link>
            <span className="hidden md:inline-block text-sm text-muted-foreground px-2">
              {user.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                title="Sign out"
                className="p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-semibold"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-soft"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
