export interface StatsBannerProps {
  songsAdded: number;
  gamesCreated: number;
  gamesPlayed: number;
  gameTypes: number;
}

export function StatsBanner({
  songsAdded,
  gamesCreated,
  gamesPlayed,
  gameTypes,
}: StatsBannerProps) {
  const stats = [
    { label: "Songs Added", value: songsAdded },
    { label: "Games Created", value: gamesCreated },
    { label: "Games Played", value: gamesPlayed },
    { label: "Game Types", value: gameTypes },
  ];

  return (
    <section className="px-4 pb-12 sm:pb-16">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-10 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-game-blue), var(--color-game-coral))",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl sm:text-5xl font-extrabold mb-1">
                  {s.value}
                </div>
                <div className="opacity-90 text-sm font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
