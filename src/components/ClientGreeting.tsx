"use client";

export default function ClientGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon apres-midi" : "Bonsoir";

  return (
    <p className="text-foreground/40 text-sm font-medium tracking-widest uppercase mb-4">
      {greeting}
    </p>
  );
}