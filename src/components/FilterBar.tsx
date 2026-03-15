import type { ChangeEvent } from "react";

export type DealFilters = {
  maxPrice: number;
  country: string;
  source: string;
  greeceFirst: boolean;
  sortBy: "score" | "price";
};

type FilterBarProps = {
  filters: DealFilters;
  countries: string[];
  sources: string[];
  maxKnownPrice: number;
  onChange: (next: DealFilters) => void;
};

export const FilterBar = ({ filters, countries, sources, maxKnownPrice, onChange }: FilterBarProps) => {
  const update =
    <K extends keyof DealFilters>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target;
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
      onChange({
        ...filters,
        [key]: key === "maxPrice" ? Number(value) : value,
      } as DealFilters);
    };

  return (
    <section className="rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-deal backdrop-blur md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Filters</h2>
          <p className="text-sm text-ink/70">Tune the dashboard for your budget and preferred source.</p>
        </div>
        <p className="rounded-full bg-pine px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">MVP</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Max price</span>
          <input
            className="w-full rounded-2xl border border-pine/20 bg-sand/30 px-4 py-3 text-sm outline-none transition focus:border-coral"
            type="range"
            min={4000}
            max={Math.max(maxKnownPrice, 9000)}
            step={250}
            value={filters.maxPrice}
            onChange={update("maxPrice")}
          />
          <p className="text-sm text-ink/70">{filters.maxPrice.toLocaleString("en-GB")} DKK</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Country</span>
          <select
            className="w-full rounded-2xl border border-pine/20 bg-sand/30 px-4 py-3 text-sm outline-none transition focus:border-coral"
            value={filters.country}
            onChange={update("country")}
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Source</span>
          <select
            className="w-full rounded-2xl border border-pine/20 bg-sand/30 px-4 py-3 text-sm outline-none transition focus:border-coral"
            value={filters.source}
            onChange={update("source")}
          >
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Sort</span>
          <select
            className="w-full rounded-2xl border border-pine/20 bg-sand/30 px-4 py-3 text-sm outline-none transition focus:border-coral"
            value={filters.sortBy}
            onChange={update("sortBy")}
          >
            <option value="score">Best score</option>
            <option value="price">Lowest price</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-pine/20 bg-sand/30 px-4 py-3 text-sm text-ink">
          <input type="checkbox" checked={filters.greeceFirst} onChange={update("greeceFirst")} />
          Greece first
        </label>
      </div>
    </section>
  );
};

