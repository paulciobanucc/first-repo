import type { SourceAdapter, SourceRunResult } from "../base/types";

const SOURCE = "travelmarket.dk";

export const travelmarketAdapter: SourceAdapter = {
  source: SOURCE,
  async search(): Promise<SourceRunResult> {
    return {
      source: SOURCE,
      status: "partial",
      notes: [
        "Public Travelmarket package endpoints linked from the homepage returned 404 responses during live verification.",
        "Keeping this source as a blocker note is safer than scraping stale search-engine snippets or bypassing anti-bot controls.",
      ],
      deals: [],
    };
  },
};
