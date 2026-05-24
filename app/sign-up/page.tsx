import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-soft">
        <Link href="/" className="text-sm text-primary font-semibold hover:underline">
          ← Back home
        </Link>
        <h1 className="text-3xl font-extrabold mt-4 mb-2">Create your account</h1>
        <p className="text-muted-foreground mb-6">
          Build a library of songs and games.
        </p>
        <SignUpForm />
      </div>
    </main>
  );
}
