import { ReportDataSchema, type LatestData } from "../src/lib/types/deals";
import { buildReportGroups, renderMarkdownReport } from "../src/lib/utils/report";
import { readJsonFile, repoPath, writeJsonFile, writeTextFile } from "../src/lib/utils/storage";

const main = async () => {
  const latest = await readJsonFile<LatestData>(repoPath("data", "latest.json"), {
    generatedAt: new Date(0).toISOString(),
    run: {
      id: "initial",
      startedAt: new Date(0).toISOString(),
      finishedAt: new Date(0).toISOString(),
      sourceCount: 0,
      resultCount: 0,
      status: "failed",
      notes: [],
    },
    sourceStatuses: [],
    deals: [],
  });

  const groups = buildReportGroups(latest.deals);
  const markdownPath = "data/latest-report.md";
  const markdown = renderMarkdownReport(latest.deals, groups, latest.generatedAt);

  await writeTextFile(repoPath(markdownPath), markdown);

  const report = ReportDataSchema.parse({
    generatedAt: latest.generatedAt,
    markdownPath,
    groups,
  });

  await writeJsonFile(repoPath("data", "latest-report.json"), report);
  console.log(`Report written to ${markdownPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

