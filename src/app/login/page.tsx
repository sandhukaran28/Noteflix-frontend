"use client";
import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(u, p);
      router.push("/");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Sign in"
          subtitle="Enter demo credentials configured on the server"
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <Input
              label="Username"
              value={u}
              onChange={(e) => setU(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
