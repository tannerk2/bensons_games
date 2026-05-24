"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GAME_TYPE_LIST } from "@/lib/game-types";

export function GameTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("type") ?? "";

  const setType = (next: string) => {
    const search = new URLSearchParams(params.toString());
    if (next) search.set("type", next);
    else search.delete("type");
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      value={current}
      onChange={(e) => setType(e.target.value)}
      className="px-3 py-2 rounded-xl border-2 border-border bg-card font-semibold text-sm"
    >
      <option value="">All types</option>
      {GAME_TYPE_LIST.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}
