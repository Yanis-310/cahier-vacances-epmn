"use client";

import { useState, useEffect, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "epmn_install_dismissed";
const SHOWN_ONCE_KEY = "epmn_install_prompt_shown_once";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  });
  const [isPhone] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      ua
    );
  });
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  function showPromptOnce() {
    if (localStorage.getItem(SHOWN_ONCE_KEY)) return;
    localStorage.setItem(SHOWN_ONCE_KEY, "1");
    setShow(true);
  }

  useEffect(() => {
    // Only show on phones
    if (!isPhone) return;
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if already in a webview / TWA
    if ((navigator as unknown as { standalone?: boolean }).standalone) return;
    // Don't show if user already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Don't show if prompt was already shown once
    if (localStorage.getItem(SHOWN_ONCE_KEY)) return;

    if (isIOS) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => showPromptOnce(), 2000);
      return () => clearTimeout(t);
    }

    // Android / Chrome: capture beforeinstallprompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setTimeout(() => showPromptOnce(), 2000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [isIOS, isPhone]);

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstall() {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    deferredPromptRef.current = null;
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_300ms_ease-out]">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors text-foreground/40 cursor-pointer"
          aria-label="Fermer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 5L13 13M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4V20M16 20L10 14M16 20L22 14" stroke="#930137" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 24H26" stroke="#930137" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center text-foreground/90 mb-1">
          Installer l&apos;application
        </h2>
        <p className="text-sm text-foreground/50 text-center mb-5">
          Accédez au Cahier de Vacances directement depuis votre écran d&apos;accueil.
        </p>

        {isIOS ? (
          /* iOS instructions */
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-foreground/[0.03] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <span className="text-sm text-foreground/70">
                Appuyez sur{" "}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="inline -mt-0.5">
                  <path d="M9 2V12M9 2L5 6M9 2L13 6" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10V14.5A1.5 1.5 0 0 0 4.5 16H13.5A1.5 1.5 0 0 0 15 14.5V10" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {" "}
                <strong>Partager</strong> en bas de l&apos;écran
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-foreground/[0.03] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <span className="text-sm text-foreground/70">
                Puis <strong>&laquo; Sur l&apos;écran d&apos;accueil &raquo;</strong>
              </span>
            </div>
            <button
              onClick={dismiss}
              className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-foreground/50 hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        ) : (
          /* Android / Chrome: direct install */
          <div className="space-y-2">
            <button
              onClick={handleInstall}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Installer
            </button>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-foreground/50 hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
