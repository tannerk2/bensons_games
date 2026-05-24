import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex flex-1 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-extrabold mb-4">HymnPlay</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn songs through games.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/sign-up"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-xl bg-card font-bold shadow-soft"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-12">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-extrabold mb-2">
          Hello, {session.user.email}
        </h1>
        <p className="text-muted-foreground mb-8">
          The full home page lands in Phase 2.
        </p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-card font-bold shadow-soft"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
