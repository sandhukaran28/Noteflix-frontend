"use client";
import NewJobCard from "@/features/jobs/NewJobCard";
import JobsTable from "@/features/jobs/JobsTable";
import { Button } from "@/components/ui/Button";
import UploadCard from "../assests/UploadCard";
import AssetsTable from "../assests/AssetsTable";

export default function Dashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-zinc-950/70 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold">NoteFlix Studio</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 grid gap-4">
        <div className="grid md:grid-cols-3 gap-4">
          <UploadCard token={token} />
          <NewJobCard token={token} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <AssetsTable token={token} />
          <JobsTable token={token} />
        </div>
      </main>
    </div>
  );
}
