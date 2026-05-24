import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import { users, songs } from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

const SEED_EMAIL = "test@hymnplay.local";
const SEED_PASSWORD = "test1234";

const SAMPLE_SONGS = [
  {
    title: "Amazing Grace",
    verses: [
      {
        title: "Verse 1",
        lines: [
          "Amazing grace, how sweet the sound,",
          "That saved a wretch like me!",
          "I once was lost, but now am found,",
          "Was blind, but now I see.",
        ],
      },
      {
        title: "Verse 2",
        lines: [
          "'Twas grace that taught my heart to fear,",
          "And grace my fears relieved.",
          "How precious did that grace appear",
          "The hour I first believed.",
        ],
      },
    ],
  },
  {
    title: "Holy, Holy, Holy",
    verses: [
      {
        title: "Verse 1",
        lines: [
          "Holy, holy, holy! Lord God Almighty!",
          "Early in the morning our song shall rise to Thee.",
          "Holy, holy, holy! Merciful and mighty,",
          "God in three persons, blessed Trinity!",
        ],
      },
    ],
  },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  let user = (await db.select().from(users).where(eq(users.email, SEED_EMAIL)))[0];

  if (!user) {
    const passwordHash = await hash(SEED_PASSWORD, 12);
    [user] = await db
      .insert(users)
      .values({ email: SEED_EMAIL, passwordHash })
      .returning();
    console.log(`Seeded user ${SEED_EMAIL} (id=${user.id}, password=${SEED_PASSWORD})`);
  } else {
    console.log(`User ${SEED_EMAIL} already exists (id=${user.id})`);
  }

  const existingTitles = new Set(
    (await db.select({ title: songs.title }).from(songs).where(eq(songs.userId, user.id))).map(
      (r) => r.title
    )
  );

  let inserted = 0;
  for (const song of SAMPLE_SONGS) {
    if (existingTitles.has(song.title)) continue;
    await db.insert(songs).values({
      userId: user.id,
      title: song.title,
      verses: song.verses,
    });
    inserted++;
  }
  console.log(`Inserted ${inserted} sample song(s).`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
