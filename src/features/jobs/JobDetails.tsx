"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import {  api } from "@/lib/api";

export default function JobDetails({
  token,
  job,
  onClose,
}: {
  token: string;
  job: any;
  onClose: () => void;
}) {
  const [data, setData] = useState(job);
  const [logs, setLogs] = useState("");
  const [tab, setTab] = useState<"overview" | "logs" | "output">("overview");
  const videoRef = useRef<HTMLVideoElement>(null);

  const reload = async () => {
    try {
      setData((await api<any>(`/jobs/${job.id}`, { token })) as any);
    } catch {}
    try {
      setLogs((await api<string>(`/jobs/${job.id}/logs`, { token })) as string);
    } catch {}
  };
  useEffect(() => {
    reload();
    const id = setInterval(reload, 4000);
    return () => clearInterval(id);
  }, [job.id]);

  const outputUrl = useMemo(() => `/jobs/${job.id}/output`, [job.id]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader
          title={`Job ${job.id.slice(0, 8)}`}
          subtitle={<StatusPill status={data?.status || job.status} />}
          right={
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          }
        />
        <CardBody className="grid gap-3">
          <div className="flex gap-2">
            <Button
              variant={tab === "overview" ? "primary" : "ghost"}
              onClick={() => setTab("overview")}
            >
              Overview
            </Button>
            <Button
              variant={tab === "logs" ? "primary" : "ghost"}
              onClick={() => setTab("logs")}
            >
              Logs
            </Button>
            <Button
              variant={tab === "output" ? "primary" : "ghost"}
              onClick={() => setTab("output")}
            >
              Output
            </Button>
          </div>

          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="grid gap-1">
                <Row label="Profile" value={data?.profile} />
                <Row label="Asset" value={data?.assetName || data?.assetId} />
                <Row
                  label="Created"
                  value={new Date(
                    data?.createdAt || job.createdAt
                  ).toLocaleString()}
                />
                {data?.duration && (
                  <Row
                    label="Duration"
                    value={`${Math.round(data.duration)}s`}
                  />
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-2">
                  Polling every 4s. Use logs to debug failures.
                </p>
                <Button variant="outline" onClick={reload}>
                  Refresh now
                </Button>
              </div>
            </div>
          )}

          {tab === "logs" && (
            <pre className="bg-black text-green-300 p-3 rounded-xl overflow-auto max-h-[50vh] text-xs whitespace-pre-wrap">
              {logs || "No logs yet"}
            </pre>
          )}

          {tab === "output" && (
            <div className="grid gap-3">
              <video
                ref={videoRef}
                className="w-full rounded-xl border border-gray-200"
                controls
                src={outputUrl}
              />
              <div className="flex items-center gap-2">
                <a
                  className="underline text-sm"
                  href={outputUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2">{value}</div>
    </div>
  );
}
