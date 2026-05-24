"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type ActionResult } from "@/lib/auth-actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    signUpAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-base"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-base"
        />
        <p className="text-xs text-muted-foreground mt-1">At least 8 characters.</p>
      </div>

      {state && !state.ok && (
        <p className="text-sm font-medium text-game-coral">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-soft disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
