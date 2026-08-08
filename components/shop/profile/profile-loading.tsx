import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileTabId } from "./profile-formatters";

export function ProfileAddressesLoadingFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="min-h-36 rounded-md border border-hairline/45 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-3 h-3 w-full max-w-72" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ProfileTabLoading({ tab }: { tab: ProfileTabId }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-10 md:px-16 md:py-16">
        <section className="flex flex-col gap-6 text-left">
          <div className="flex items-end justify-between border-b border-hairline pb-4">
            <Skeleton className="h-8 w-44 md:h-9 md:w-56" />
            <Skeleton className="h-3 w-20" />
          </div>
          {tab === "orders" ? (
            <ProfileOrdersLoading />
          ) : tab === "favourites" ? (
            <ProfileFavouritesLoading />
          ) : (
            <ProfileOverviewLoading />
          )}
        </section>
      </main>
    </div>
  );
}

export function ProfileOverviewLoading() {
  return (
    <div className="mt-2 flex flex-col gap-12 text-left md:flex-row md:gap-40 lg:gap-56" aria-hidden="true">
      <aside className="w-full flex-shrink-0 space-y-2 md:w-52">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </aside>
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-hairline pt-8">
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfileOrdersLoading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between gap-6 rounded-sm border border-hairline/60 bg-surface-card/30 p-6 md:flex-row"
        >
          <div className="flex min-w-0 gap-4">
            <Skeleton className="size-20 flex-shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="h-3 w-56 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3 border-t border-hairline/40 pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileFavouritesLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-full overflow-hidden rounded-md border border-transparent bg-white">
          <div className="relative aspect-square">
            <Skeleton className="absolute inset-0 size-full rounded-none" />
            <Skeleton className="absolute right-4 top-4 size-8 rounded-full bg-white/80" />
          </div>
          <div className="flex flex-col items-start px-4 pb-6 pt-5">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-5 h-10 w-full rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
