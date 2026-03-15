import path from "node:path";
import { afbudsrejserAdapter } from "../sources/afbudsrejser/index";
import { travelmarketAdapter } from "../sources/travelmarket/index";
import { tuiAdapter } from "../sources/tui/index";
import type { SearchContext } from "../sources/base/types";
import { LatestDataSchema, SearchRunSchema, type HistoryData, type LatestData, type SearchRun } from "../src/lib/types/deals";
import { normalizeDeal } from "../src/lib/utils/normalize";
import { readJsonFile, repoPath, writeJsonFile } from "../src/lib/utils/storage";
import { sendTelegramSummary } from "../src/lib/utils/telegram";

const createRunId = () => new Date().toISOString().replace(/[:.]/g, "-");

const adapters = [afbudsrejserAdapter, travelmarketAdapter, tuiAdapter];

const dedupeDeals = (deals: LatestData["deals"]) => {
  const seen = new Set<string>();
  return deals.filter((deal) => {
    const key = [
      deal.source,
      deal.provider ?? "",
      deal.hotelName ?? "",
      deal.destination ?? "",
      deal.departureDate ?? "",
      deal.totalPrice ?? "",
      deal.nights ?? "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const main = async () => {
  const startedAt = new Date().toISOString();
  const runId = createRunId();
  const screenshotsDir = repoPath("public", "screenshots");

  const context: SearchContext = {
    runId,
    startedAt,
    screenshotsDir,
    preferences: {
      departureAirport: "Billund (BLL)",
      travelers: 2,
      nights: 7,
      months: [6, 7],
      budgetTarget: 7000,
    },
  };

  const sourceStatuses: LatestData["sourceStatuses"] = [];
  const deals: LatestData["deals"] = [];
  const notes: string[] = [];

  for (const adapter of adapters) {
    const result = await adapter.search(context);
    const normalizedDeals = result.deals.map(normalizeDeal).filter((deal) => deal !== null);

    sourceStatuses.push({
      source: result.source,
      status: result.status,
      notes: result.notes,
      resultCount: normalizedDeals.length,
    });

    notes.push(...result.notes.map((note) => `${result.source}: ${note}`));
    deals.push(...normalizedDeals);
  }

  const uniqueDeals = dedupeDeals(deals);
  uniqueDeals.sort(
    (a, b) => b.score - a.score || (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER)
  );

  const finishedAt = new Date().toISOString();
  const runStatus: SearchRun["status"] =
    uniqueDeals.length === 0
      ? "failed"
      : sourceStatuses.some((status) => status.status !== "ok")
        ? "partial"
        : "success";

  const run = SearchRunSchema.parse({
    id: runId,
    startedAt,
    finishedAt,
    sourceCount: adapters.length,
    resultCount: uniqueDeals.length,
    status: runStatus,
    notes,
  });

  const latest = LatestDataSchema.parse({
    generatedAt: finishedAt,
    run,
    sourceStatuses,
    deals: uniqueDeals,
  });

  const historyPath = repoPath("data", "history.json");
  const existingHistory = await readJsonFile<HistoryData>(historyPath, {
    updatedAt: finishedAt,
    runs: [],
  });

  existingHistory.runs = [run, ...existingHistory.runs].slice(0, 30);
  existingHistory.updatedAt = finishedAt;

  await writeJsonFile(repoPath("data", "latest.json"), latest);
  await writeJsonFile(historyPath, existingHistory);

  const repository = process.env.GITHUB_REPOSITORY;
  const dashboardUrl = repository
    ? `https://${repository.split("/")[0].toLowerCase()}.github.io/${repository.split("/")[1]}/`
    : "Dashboard URL available after GitHub Pages deploy.";

  try {
    await sendTelegramSummary(uniqueDeals, dashboardUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telegram notification failed.";
    latest.run.notes.push(`telegram: ${message}`);
    await writeJsonFile(repoPath("data", "latest.json"), latest);
  }

  console.log(
    JSON.stringify(
      {
        runId,
        resultCount: uniqueDeals.length,
        status: run.status,
        dataPath: path.relative(process.cwd(), repoPath("data", "latest.json")),
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
