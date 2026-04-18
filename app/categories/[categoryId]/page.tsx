import { Suspense } from "react";
import CategoryPeopleClient from "../CategoryPeopleClient";

type StaticCategory = {
  id?: string;
};

const FALLBACK_CATEGORY_IDS = [
  "ce83b2a6-1973-4e9b-a539-cddb4dd2ebd6",
  "7bfe0e54-8df0-4f95-a4a7-ed34c30ccc59",
  "1b1ee0e1-481a-49f9-bcea-c0d2333c77f8",
  "d1583dc0-1c6b-4084-86ef-0fa9cce5f47c",
  "e38163d9-257e-49ea-8dab-0c0dff7ceec2",
];

const mapCategoryParams = (ids: string[]) =>
  ids
    .map((id) => id.trim())
    .filter((id) => Boolean(id))
    .map((categoryId) => ({ categoryId }));

export async function generateStaticParams() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return mapCategoryParams(FALLBACK_CATEGORY_IDS);

  try {
    const response = await fetch(`${apiBaseUrl}/Category`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });

    if (!response.ok) return mapCategoryParams(FALLBACK_CATEGORY_IDS);

    const data = (await response.json()) as StaticCategory[];
    if (!Array.isArray(data)) return mapCategoryParams(FALLBACK_CATEGORY_IDS);

    const params = data
      .map((item) => item.id?.trim())
      .filter((id): id is string => Boolean(id))
      .map((categoryId) => ({ categoryId }));

    return params.length > 0
      ? params
      : mapCategoryParams(FALLBACK_CATEGORY_IDS);
  } catch {
    return mapCategoryParams(FALLBACK_CATEGORY_IDS);
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
