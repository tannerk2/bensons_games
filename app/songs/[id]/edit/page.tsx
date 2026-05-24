import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSong } from "@/lib/data/songs";
import { PageLayout } from "@/components/page-layout";
import { SongEditorForm } from "@/components/songs/SongEditorForm";

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const song = await getSong(userId, id);
  if (!song) notFound();

  return (
    <PageLayout size="md">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Song Library
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Edit Song</h1>
      <SongEditorForm song={song} />
    </PageLayout>
  );
}
