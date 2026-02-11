"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartButton({
  variant = "primary",
}: {
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const res = await fetch("/api/evaluation", { method: "POST" });
    const data = await res.json();
    if (data.id) {
      router.push(`/evaluation/${data.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className={`px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer ${
        variant === "outline"
          ? "border border-foreground/15 text-foreground/60 hover:text-primary hover:border-primary/30 bg-white"
          : "bg-primary text-white hover:bg-primary-light"
      }`}
    >
      {loading ? "Préparation..." : "Nouvelle évaluation"}
    </button>
  );
}
