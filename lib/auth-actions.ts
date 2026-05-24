"use server";

import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/validation/auth";
import { createUser, getUserByEmail } from "@/lib/data/users";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function signUpAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return { ok: false, error: "Email already in use" };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await createUser({ email: parsed.data.email, passwordHash });

  // Sign the user in immediately. signIn() throws a redirect internally;
  // letting it propagate is the expected pattern.
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/",
  });

  // Unreachable — signIn redirects.
  return { ok: true };
}

export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (err) {
    // Auth.js v5 surfaces credential failures as a CredentialsSignin error.
    // Re-throw redirects so Next.js handles them; map auth errors to UI text.
    if (err instanceof Error && err.name === "CredentialsSignin") {
      return { ok: false, error: "Invalid email or password" };
    }
    throw err;
  }

  return { ok: true };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
  // Unreachable, but appeases TS.
  redirect("/");
}
