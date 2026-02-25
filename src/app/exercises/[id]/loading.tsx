import Navbar from "@/components/Navbar";

export default function ExerciseLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen relative" style={{ backgroundColor: "#FCF4E8" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
          <img
            src="/icons/solar/fleur 1.png"
            alt=""
            className="absolute object-contain pointer-events-none z-20"
            style={{ top: "-46px", right: "-34px", width: "130px", height: "130px" }}
          />

          <div className="exercise-solar animate-pulse">
            <div className="exercise-container">
          {/* Back link */}
              <div className="h-4 w-36 bg-foreground/[0.06] rounded mb-6" />

          {/* Title */}
              <div className="mb-8">
                <div className="h-8 w-72 bg-foreground/[0.08] rounded" />
                <div className="h-4 w-full bg-foreground/[0.05] rounded mt-3" />
              </div>

          {/* Progress bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-foreground/[0.06] rounded-full" />
                <div className="h-3 w-8 bg-foreground/[0.06] rounded" />
              </div>

          {/* Question card */}
              <div className="exercise-card">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-full bg-foreground/[0.08]" />
                  <div className="h-3 w-36 bg-foreground/[0.06] rounded" />
                </div>
                <div className="h-5 w-full bg-foreground/[0.06] rounded mb-2" />
                <div className="h-5 w-3/4 bg-foreground/[0.05] rounded mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-foreground/[0.04] rounded-lg border border-foreground/[0.06]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
