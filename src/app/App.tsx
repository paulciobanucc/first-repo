import { useEffect, useMemo, useState } from "react";
import { DealCard } from "../components/DealCard";
import { EmptyState } from "../components/EmptyState";
import { FilterBar, type DealFilters } from "../components/FilterBar";
import { SectionBlock } from "../components/SectionBlock";
import { StatChip } from "../components/StatChip";
import type { Deal, SiteData } from "../lib/types/deals";
import { SiteDataSchema } from "../lib/types/deals";
import { formatPrice } from "../lib/utils/format";

const defaultFilters: DealFilters = {
  maxPrice: 9000,
  country: "",
  source: "",
  greeceFirst: false,
  sortBy: "score",
};

const sortDeals = (deals: Deal[], filters: DealFilters) => {
  const next = [...deals];
  next.sort((a, b) => {
    if (filters.greeceFirst && a.isGreece !== b.isGreece) {
      return a.isGreece ? -1 : 1;
    }

    if (filters.sortBy === "price") {
      return (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER);
    }

    return b.score - a.score;
  });

  return next;
};

export const App = () => {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DealFilters>(defaultFilters);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/site-data.json`);
        const json = await response.json();
        const parsed = SiteDataSchema.parse(json);
        setSiteData(parsed);
        setFilters((current) => ({
          ...current,
          maxPrice: parsed.filters.maxKnownPrice > 0 ? parsed.filters.maxKnownPrice : current.maxPrice,
        }));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load site data.");
      }
    };

    void load();
  }, []);

  const filteredDeals = useMemo(() => {
    if (!siteData) {
      return [];
    }

    return sortDeals(
      siteData.deals.filter((deal) => {
        if (deal.totalPrice !== null && deal.totalPrice > filters.maxPrice) {
          return false;
        }

        if (filters.country && deal.country !== filters.country) {
          return false;
        }

        if (filters.source && deal.source !== filters.source) {
          return false;
        }

        return true;
      }),
      filters
    );
  }, [filters, siteData]);

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 md:px-6">
        <EmptyState title="Dashboard load failed" body={error} />
      </main>
    );
  }

  if (!siteData) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 md:px-6">
        <EmptyState title="Loading deals" body="Fetching the latest generated dashboard data." />
      </main>
    );
  }

  const topDeal = filteredDeals[0];

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,127,81,0.28),_transparent_44%),radial-gradient(circle_at_top_right,_rgba(31,122,140,0.22),_transparent_36%),linear-gradient(180deg,_#fff9ef_0%,_#ecfff4_100%)]" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-56 w-56 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute left-[-5rem] top-64 h-56 w-56 rounded-full bg-ocean/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <header className="rounded-[32px] border border-white/50 bg-white/75 p-6 shadow-deal backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-pine/70">Holiday Hunter</p>
              <div className="space-y-2">
                <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
                  Cheap package holidays from Billund, ready for your phone.
                </h1>
                <p className="max-w-xl text-sm text-ink/70 md:text-base">
                  Static dashboard for June and July package deals, ranked with transparent rules and a small Greece bias.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatChip label="Generated" value={new Date(siteData.generatedAt).toLocaleString("en-GB")} />
              <StatChip label="Deals" value={String(siteData.deals.length)} />
              <StatChip label="Sources" value={String(siteData.run.sourceCount)} />
            </div>
          </div>
        </header>

        <FilterBar
          filters={filters}
          countries={siteData.filters.countries}
          sources={siteData.filters.sources}
          maxKnownPrice={siteData.filters.maxKnownPrice}
          onChange={setFilters}
        />

        <SectionBlock
          title="Snapshot"
          description="Transparent ranking for 2 adults, 7 nights, June or July, Billund departure, and package deals only."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-pine p-5 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Top deal</p>
              <h2 className="mt-3 font-display text-2xl">{topDeal?.hotelName ?? topDeal?.destination ?? "No match yet"}</h2>
              <p className="mt-2 text-sm text-white/80">{topDeal?.interestingNote ?? "Run a search to populate live deals."}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-pine/60">Known cheapest</p>
              <p className="mt-3 font-display text-2xl text-ink">
                {filteredDeals.length > 0
                  ? formatPrice(
                      filteredDeals
                        .filter((deal) => deal.totalPrice !== null)
                        .sort((a, b) => (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER))[0]
                        ?.totalPrice ?? null
                    )
                  : "Price unavailable"}
              </p>
            </div>
            <div className="rounded-[24px] bg-sand/75 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-pine/60">Run status</p>
              <p className="mt-3 font-display text-2xl text-ink">{siteData.run.status}</p>
              <p className="mt-2 text-sm text-ink/70">{siteData.sourceStatuses.filter((status) => status.status === "ok").length} sources returned normalized deals.</p>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Report buckets" description="Generated sections used for markdown and notification summaries.">
          <div className="grid gap-4 md:grid-cols-2">
            {siteData.report.groups.map((group) => (
              <div key={group.title} className="rounded-[24px] bg-mint/35 p-5">
                <h3 className="font-display text-lg text-ink">{group.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{group.description}</p>
                <p className="mt-3 text-sm text-pine">{group.dealIds.length} deal(s)</p>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Latest deals" description={`Showing ${filteredDeals.length} matching results after filters.`}>
          {filteredDeals.length === 0 ? (
            <EmptyState
              title="No deals match the current filters"
              body="Try increasing the max price or removing a country/source filter."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </SectionBlock>

        <SectionBlock title="Source health" description="Broken sources should degrade cleanly instead of blocking the site build.">
          <div className="grid gap-4 md:grid-cols-3">
            {siteData.sourceStatuses.map((status) => (
              <div key={status.source} className="rounded-[24px] border border-pine/10 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-pine/60">{status.source}</p>
                <p className="mt-3 font-display text-2xl text-ink">{status.status}</p>
                <p className="mt-2 text-sm text-ink/70">{status.resultCount} deals kept after normalization.</p>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  {status.notes.slice(0, 2).map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionBlock>
      </div>
    </main>
  );
};

