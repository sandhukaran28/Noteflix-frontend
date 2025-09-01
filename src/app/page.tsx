"use client";
import Dashboard from "@/features/dashboard/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) return null;
  return <Dashboard token={token} onLogout={logout} />;
}
