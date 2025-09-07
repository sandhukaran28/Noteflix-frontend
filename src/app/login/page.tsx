"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "confirm";

export default function AuthPage() {
  const { login, register, confirm, resendCode, ready, token } = useAuth();
  const router = useRouter();

  // ---- state hooks ----
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const title = useMemo(() => {
    switch (mode) {
      case "register": return "Create account";
      case "confirm":  return "Confirm your email";
      default:         return "Sign in";
    }
  }, [mode]);

  const subtitle = useMemo(() => {
    switch (mode) {
      case "register": return "Sign up with your email & password";
      case "confirm":  return "Enter the verification code sent to your email";
      default:         return "Enter your credentials";
    }
  }, [mode]);

  useEffect(() => {
    if (ready && token) {
      router.replace("/");
    }
  }, [ready, token, router]);

  const clearAlerts = () => {
    setErr("");
    setMsg("");
  };

  const handleLogin = async () => {
    clearAlerts();
    setBusy(true);
    try {
      await login(email, password); // use email as username
      router.push("/");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to sign in");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    clearAlerts();
    setBusy(true);
    try {
      await register(email, password, email); // send email as both username & email attribute
      setMsg("Account created. Check your email for the confirmation code.");
      setMode("confirm");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to sign up");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    clearAlerts();
    setBusy(true);
    try {
      await confirm(email, code); // confirm using email as username
      setMsg("Email confirmed. You can now sign in.");
      setMode("login");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to confirm code");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    clearAlerts();
    setBusy(true);
    try {
      await resendCode(email);
      setMsg("Verification code resent. Check your email.");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to resend code");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") return handleLogin();
    if (mode === "register") return handleRegister();
    if (mode === "confirm") return handleConfirm();
  };

  if (!ready || token) {
    return <div className="min-h-dvh grid place-items-center p-6 text-sm text-gray-600">Loading…</div>;
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader title={title} subtitle={subtitle} />
        <CardBody>
          <form onSubmit={onSubmit} className="grid gap-3">
            {/* Shared: email */}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Login/Register: password */}
            {(mode === "login" || mode === "register") && (
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            {/* Confirm-only: code */}
            {mode === "confirm" && (
              <Input
                label="Confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            )}

            {err && <p className="text-sm text-red-600">{err}</p>}
            {msg && <p className="text-sm text-green-700">{msg}</p>}

            <Button type="submit" disabled={busy}>
              {busy
                ? (mode === "login"
                    ? "Signing in…"
                    : mode === "register"
                    ? "Creating account…"
                    : "Confirming…")
                : (mode === "login"
                    ? "Sign in"
                    : mode === "register"
                    ? "Create account"
                    : "Confirm")}
            </Button>
          </form>

          {/* Footer actions */}
          <div className="mt-4 grid gap-2 text-sm">
            {mode !== "login" && (
              <button
                type="button"
                className="text-gray-600 hover:underline text-left"
                onClick={() => { clearAlerts(); setMode("login"); }}
                disabled={busy}
              >
                ← Back to Sign in
              </button>
            )}

            {mode === "login" && (
              <button
                type="button"
                className="text-gray-600 hover:underline text-left"
                onClick={() => { clearAlerts(); setMode("register"); }}
                disabled={busy}
              >
                Don’t have an account? Create one
              </button>
            )}

            {mode === "register" && (
              <button
                type="button"
                className="text-gray-600 hover:underline text-left"
                onClick={() => { clearAlerts(); setMode("confirm"); }}
                disabled={busy}
              >
                Already registered? Enter confirmation code
              </button>
            )}

            {mode === "confirm" && (
              <button
                type="button"
                className="text-gray-600 hover:underline text-left"
                onClick={handleResend}
                disabled={busy || !email}
                title={!email ? "Enter your email above first" : ""}
              >
                Resend code
              </button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
