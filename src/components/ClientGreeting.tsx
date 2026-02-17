"use client";

import { useEffect, useState } from "react";

export default function ClientGreeting() {
  const [greeting, setGreeting] = useState("Bonjour");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir");
  }, []);

  return (
    <p className="text-foreground/40 text-sm font-medium tracking-widest uppercase mb-4">
      {greeting}
    </p>
  );
}
