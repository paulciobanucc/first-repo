import type { NormalizeDealInput } from "../../src/lib/types/deals";

export type SearchPreferences = {
  departureAirport: string;
  travelers: number;
  nights: number;
  months: number[];
  budgetTarget: number;
};

export type SearchContext = {
  runId: string;
  startedAt: string;
  screenshotsDir: string;
  preferences: SearchPreferences;
};

export type SourceRunResult = {
  source: string;
  status: "ok" | "partial" | "failed";
  notes: string[];
  deals: NormalizeDealInput[];
};

export interface SourceAdapter {
  source: string;
  search(context: SearchContext): Promise<SourceRunResult>;
}

