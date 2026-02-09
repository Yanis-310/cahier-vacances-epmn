"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartButton() {
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
      className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
    >
      {loading ? "Préparation..." : "Démarrer une évaluation"}
    </button>
  );
}
