import { Suspense } from "react";
import DetailPersonClient from "./DetailPersonClient";

function DetailPersonFallback() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      </div>
    </main>
  );
}

export default function DetailPersonPage() {
  return (
    <Suspense fallback={<DetailPersonFallback />}>
      <DetailPersonClient />
    </Suspense>
  );
}
