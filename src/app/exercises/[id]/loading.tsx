import Navbar from "@/components/Navbar";

export default function ExerciseLoading() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          {/* Back link */}
          <div className="h-4 w-36 bg-foreground/[0.06] rounded mb-6" />

          {/* Title */}
          <div className="mb-8">
            <div className="h-7 w-80 bg-foreground/[0.08] rounded" />
            <div className="h-4 w-full bg-foreground/[0.05] rounded mt-3" />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1 bg-foreground/[0.06] rounded-full" />
            <div className="h-3 w-8 bg-foreground/[0.06] rounded" />
          </div>

          {/* Question card */}
          <div className="bg-white rounded-xl p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-6 rounded-full bg-foreground/[0.08]" />
              <div className="h-3 w-28 bg-foreground/[0.06] rounded" />
            </div>
            <div className="h-5 w-full bg-foreground/[0.06] rounded mb-2" />
            <div className="h-5 w-3/4 bg-foreground/[0.05] rounded mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-foreground/[0.04] rounded-lg border border-foreground/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
