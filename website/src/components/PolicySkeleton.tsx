import React from "react";

export const PolicySkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse space-y-8 py-6">
      {/* Top Hero Pill & Title Skeleton */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 md:p-10 backdrop-blur-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 rounded-full bg-muted" />
            <div className="h-6 w-32 rounded-full bg-muted/80" />
          </div>
          <div className="h-9 w-48 rounded-full bg-muted/70" />
        </div>

        <div className="space-y-3">
          <div className="h-10 w-3/4 max-w-xl rounded-xl bg-muted" />
          <div className="h-4 w-full max-w-2xl rounded-md bg-muted/70" />
          <div className="h-4 w-4/5 max-w-xl rounded-md bg-muted/60" />
        </div>

        {/* Dual Persona Switcher Bar Skeleton */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="h-11 w-44 rounded-2xl bg-muted" />
          <div className="h-11 w-44 rounded-2xl bg-muted/80" />
        </div>
      </div>

      {/* Policy Category Tabs Skeleton */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
        <div className="h-11 w-44 rounded-xl bg-muted shrink-0" />
        <div className="h-11 w-48 rounded-xl bg-muted/80 shrink-0" />
        <div className="h-11 w-40 rounded-xl bg-muted/70 shrink-0" />
      </div>

      {/* Main Content Layout with Sidebar & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Policy Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search bar skeleton */}
          <div className="h-12 w-full rounded-2xl bg-muted/70" />

          {/* Section 1 Skeleton */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="h-7 w-2/3 max-w-md rounded-lg bg-muted" />
                <div className="h-6 w-24 rounded-full bg-muted/80" />
              </div>
              <div className="h-4 w-4/5 rounded bg-muted/70" />
              <div className="space-y-2 pt-2">
                <div className="h-3.5 w-full rounded bg-muted/60" />
                <div className="h-3.5 w-11/12 rounded bg-muted/60" />
                <div className="h-3.5 w-4/5 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Quick Navigation & Help Desk Skeleton */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-full rounded-lg bg-muted/60" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted/70" />
            <div className="h-10 w-full rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicySkeleton;
