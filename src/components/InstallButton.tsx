"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(!!standalone);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(ios);

    // Android / Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Already installed — hide
  if (isStandalone) return null;

  // Android — native prompt available
  if (deferredPrompt) {
    const handleInstall = async () => {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    };

    return (
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary-pale/50 transition-colors cursor-pointer"
      >
        <DownloadIcon />
        Installer
      </button>
    );
  }

  // iOS — show guide
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary-pale/50 transition-colors cursor-pointer"
        >
          <DownloadIcon />
          Installer
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-10 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Installer l&apos;application
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-foreground/40 hover:text-foreground/70 text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <ol className="space-y-3 text-sm text-foreground/70">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                    1
                  </span>
                  <span>
                    Appuyez sur le bouton{" "}
                    <strong className="text-foreground">Partager</strong>{" "}
                    <svg
                      className="inline w-4 h-4 text-primary -mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4"
                      />
                    </svg>{" "}
                    en bas de Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                    2
                  </span>
                  <span>
                    Faites défiler et appuyez sur{" "}
                    <strong className="text-foreground">
                      Sur l&apos;écran d&apos;accueil
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                    3
                  </span>
                  <span>
                    Appuyez sur{" "}
                    <strong className="text-foreground">Ajouter</strong>
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}
      </>
    );
  }

  // Not iOS, no prompt yet — hide
  return null;
}

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
      />
    </svg>
  );
}
