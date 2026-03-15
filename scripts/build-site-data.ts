import { copyFile } from "node:fs/promises";
import { type LatestData, type ReportData } from "../src/lib/types/deals";
import { buildSiteData } from "../src/lib/utils/siteData";
import { readJsonFile, repoPath, writeJsonFile } from "../src/lib/utils/storage";

const fallbackLatest: LatestData = {
  generatedAt: new Date(0).toISOString(),
  run: {
    id: "initial",
    startedAt: new Date(0).toISOString(),
    finishedAt: new Date(0).toISOString(),
    sourceCount: 0,
    resultCount: 0,
    status: "failed",
    notes: ["No search run has been completed yet."],
  },
  sourceStatuses: [],
  deals: [],
};

const fallbackReport: ReportData = {
  generatedAt: new Date(0).toISOString(),
  markdownPath: "data/latest-report.md",
  groups: [],
};

const main = async () => {
  const latest = await readJsonFile(repoPath("data", "latest.json"), fallbackLatest);
  const report = await readJsonFile(repoPath("data", "latest-report.json"), fallbackReport);
  const history = await readJsonFile(repoPath("data", "history.json"), {
    updatedAt: latest.generatedAt,
    runs: [latest.run],
  });

  const siteData = buildSiteData(latest, report);

  await writeJsonFile(repoPath("public", "data", "latest.json"), latest);
  await writeJsonFile(repoPath("public", "data", "history.json"), history);
  await writeJsonFile(repoPath("public", "data", "latest-report.json"), report);
  await writeJsonFile(repoPath("public", "data", "site-data.json"), siteData);
  await copyFile(repoPath("data", "latest-report.md"), repoPath("public", "data", "latest-report.md")).catch(() => undefined);

  console.log("Public data refreshed.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
