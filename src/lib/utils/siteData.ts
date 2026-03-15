import type { Deal, LatestData, ReportData, SiteData } from "../types/deals";

const uniqueSorted = (values: Array<string | null>) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));

export const buildSiteData = (latest: LatestData, report: ReportData): SiteData => {
  const maxKnownPrice = latest.deals.reduce((max, deal) => {
    if (deal.totalPrice === null) {
      return max;
    }

    return Math.max(max, deal.totalPrice);
  }, 0);

  return {
    generatedAt: latest.generatedAt,
    run: latest.run,
    sourceStatuses: latest.sourceStatuses,
    deals: latest.deals,
    report,
    filters: {
      countries: uniqueSorted(latest.deals.map((deal: Deal) => deal.country)),
      sources: uniqueSorted(latest.deals.map((deal: Deal) => deal.source)),
      maxKnownPrice,
    },
  };
};

