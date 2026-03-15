import type { Deal, ReportData } from "../types/deals";

type DealGroup = ReportData["groups"][number];

const topDeals = (deals: Deal[], predicate: (deal: Deal) => boolean, sorter: (a: Deal, b: Deal) => number) =>
  deals.filter(predicate).sort(sorter).slice(0, 5);

export const buildReportGroups = (deals: Deal[]): DealGroup[] => {
  const bestOverall = topDeals(deals, () => true, (a, b) => b.score - a.score);
  const cheapest = topDeals(
    deals,
    (deal) => deal.totalPrice !== null,
    (a, b) => (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER)
  );
  const bestGreece = topDeals(deals, (deal) => deal.isGreece, (a, b) => b.score - a.score);
  const slightlyAboveBudget = topDeals(
    deals,
    (deal) => deal.totalPrice !== null && deal.totalPrice > 7000 && deal.totalPrice <= 8500,
    (a, b) => b.score - a.score
  );

  return [
    {
      title: "Best overall",
      description: "Top score after budget, data quality, and Greece preference.",
      dealIds: bestOverall.map((deal) => deal.id),
    },
    {
      title: "Cheapest",
      description: "Lowest known total price among matching deals.",
      dealIds: cheapest.map((deal) => deal.id),
    },
    {
      title: "Best Greece options",
      description: "Greek packages get a small boost but still need good value.",
      dealIds: bestGreece.map((deal) => deal.id),
    },
    {
      title: "Slightly above budget but interesting",
      description: "Deals just above the 7000 DKK target that still score well.",
      dealIds: slightlyAboveBudget.map((deal) => deal.id),
    },
  ].filter((group) => group.dealIds.length > 0);
};

export const renderMarkdownReport = (deals: Deal[], reportGroups: DealGroup[], generatedAt: string) => {
  const lines = [`# Holiday Hunter report`, "", `Generated: ${generatedAt}`, ""];

  for (const group of reportGroups) {
    lines.push(`## ${group.title}`, "", group.description, "");

    for (const dealId of group.dealIds) {
      const deal = deals.find((entry) => entry.id === dealId);
      if (!deal) {
        continue;
      }

      lines.push(
        `- **${deal.hotelName ?? "Hotel name unavailable"}** | ${deal.destination ?? "Unknown destination"}, ${
          deal.country ?? "Unknown country"
        } | ${deal.totalPrice ?? "?"} ${deal.currency} | Score ${deal.score} | ${deal.interestingNote}`
      );
      lines.push(`  Source: ${deal.source}${deal.provider ? ` / ${deal.provider}` : ""} | ${deal.sourceUrl}`);
    }

    lines.push("");
  }

  if (deals.length === 0) {
    lines.push("No matching deals were extracted in the latest run.");
  }

  return lines.join("\n");
};
