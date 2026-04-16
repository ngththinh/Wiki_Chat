import { Suspense } from "react";
import CategoryPeopleClient from "../CategoryPeopleClient";

type StaticCategory = {
  id?: string;
};

export async function generateStaticParams() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return [];

  try {
    const response = await fetch(`${apiBaseUrl}/Category`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = (await response.json()) as StaticCategory[];
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => item.id?.trim())
      .filter((id): id is string => Boolean(id))
      .map((categoryId) => ({ categoryId }));
  } catch {
    return [];
  }
}

function CategoryPeopleFallback() {
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

export default function CategoryPeopleByIdPage() {
  return (
    <Suspense fallback={<CategoryPeopleFallback />}>
      <CategoryPeopleClient />
    </Suspense>
  );
}
