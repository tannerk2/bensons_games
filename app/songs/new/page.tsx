import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { SongEditorForm } from "@/components/songs/SongEditorForm";

export default function NewSongPage() {
  return (
    <PageLayout size="md">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Song Library
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Add New Song</h1>
      <SongEditorForm />
    </PageLayout>
  );
}
