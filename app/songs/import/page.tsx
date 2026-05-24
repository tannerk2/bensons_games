import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { SheetMusicLearner } from "@/components/songs/SheetMusicLearner";

export default function ImportSongPage() {
  return (
    <PageLayout size="md">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Song Library
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
        Import Sheet Music
      </h1>
      <p className="text-muted-foreground mb-6">
        Upload a PDF or image of sheet music and we&apos;ll extract the lyrics
        for you.
      </p>
      <SheetMusicLearner />
    </PageLayout>
  );
}
