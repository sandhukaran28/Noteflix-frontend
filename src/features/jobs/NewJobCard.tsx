"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function NewJobCard({ token }: { token: string }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [assetId, setAssetId] = useState("");
  const [profile, setProfile] = useState("balanced");
  const [enrichTopic, setEnrichTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const loadAssets = async () => {
    try {
      const res: any = await api(`/assets?limit=50&sort=createdAt:desc`, {
        token,
      });
      setAssets(res.items || []);
      if (!assetId && res.items?.length) setAssetId(res.items[0].id);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    loadAssets();
  }, [token]);
  useEffect(() => {
    const onRef = () => loadAssets();
    window.addEventListener("assets:refresh", onRef);
    return () => window.removeEventListener("assets:refresh", onRef);
  }, []);

  const createJob = async () => {
    if (!assetId) return;
    setBusy(true);
    setNote("");
    try {
      await api("/jobs", {
        method: "POST",
        token,
        body: { assetId, profile, enrichTopic: enrichTopic || undefined },
      });
      setNote("Job queued");
      window.dispatchEvent(new CustomEvent("jobs:refresh"));
    } catch (e: any) {
      setNote(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Create Job"
        subtitle="Kick off the CPU‑heavy video pipeline"
      />
      <CardBody className="grid gap-3">
        <Select
          label="Asset"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.filename}
            </option>
          ))}
        </Select>
        <Select
          label="Encode profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        >
          <option value="balanced">balanced</option>
          <option value="heavy">heavy</option>
          <option value="insane">insane</option>
        </Select>
        <Input
          label="Wikipedia enrich topic (optional)"
          placeholder="e.g., Machine learning"
          value={enrichTopic}
          onChange={(e) => setEnrichTopic(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button onClick={createJob} disabled={busy || !assetId}>
            {busy ? "Queuing…" : "Queue job"}
          </Button>
          {note && <span className="text-sm text-gray-600">{note}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
