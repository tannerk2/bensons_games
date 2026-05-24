import { config } from "dotenv";
import { hash } from "bcrypt";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const EMAIL = "test@hymnplay.local";
const PASSWORD = "test1234";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  const existing = await db.select().from(users).where(eq(users.email, EMAIL));
  if (existing.length > 0) {
    console.log(`User ${EMAIL} already exists (id=${existing[0].id})`);
  } else {
    const passwordHash = await hash(PASSWORD, 12);
    const [row] = await db
      .insert(users)
      .values({ email: EMAIL, passwordHash })
      .returning();
    console.log(`Created user ${EMAIL} (id=${row.id})`);
  }

  console.log(`Password: ${PASSWORD}`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
