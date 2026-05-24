import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "@/db/schema";

export async function getUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function getUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function createUser(input: { email: string; passwordHash: string; name?: string | null }) {
  const [row] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name ?? null,
    })
    .returning();
  return row;
}
