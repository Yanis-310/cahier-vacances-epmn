"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import Toast from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      const message = "Email ou mot de passe incorrect.";
      setError(message);
      setToastMessage(message);
    } else {
      router.push("/exercises");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ backgroundColor: "#FCF4E8" }}>
      <Toast
        message={toastMessage}
        variant="error"
        onClose={() => setToastMessage(null)}
      />



      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md relative z-10" style={{ border: "1.5px solid #F2C073" }}>
        <img
          src="/icons/solar/fleur 1.png"
          alt=""
          className="absolute object-contain pointer-events-none z-20"
          style={{ top: "-40px", right: "-40px", width: "100px", height: "100px" }}
        />
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: "#F2C073" }}>
            EPMN
          </Link>
          <h1 className="text-xl font-semibold mt-4">Se connecter</h1>
          <p className="text-foreground/70 mt-1">
            Accédez à votre cahier de vacances
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          {error && (
            <FeedbackMessage
              id="login-feedback"
              message={error}
              variant="error"
            />
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!error}
              aria-describedby={error ? "login-feedback" : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: "#F2C07360" }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={!!error}
              aria-describedby={error ? "login-feedback" : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: "#F2C07360" }}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: "#F2C073" }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: "#F2C073" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/70 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="hover:underline" style={{ color: "#F2C073" }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
