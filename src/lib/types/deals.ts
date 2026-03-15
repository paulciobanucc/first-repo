import { z } from "zod";

export const DealSchema = z.object({
  id: z.string(),
  source: z.string(),
  provider: z.string().nullable().optional(),
  sourceUrl: z.string().url(),
  hotelName: z.string().nullable(),
  destination: z.string().nullable(),
  country: z.string().nullable(),
  departureAirport: z.string().nullable(),
  departureDate: z.string().nullable(),
  returnDate: z.string().nullable(),
  nights: z.number().int().positive().nullable(),
  travelers: z.number().int().positive().nullable(),
  totalPrice: z.number().int().positive().nullable(),
  currency: z.string().default("DKK"),
  hotelImageUrl: z.string().url().nullable(),
  screenshotPath: z.string().nullable(),
  score: z.number(),
  reasons: z.array(z.string()),
  interestingNote: z.string(),
  foundAt: z.string(),
  isGreece: z.boolean(),
  rawExtract: z.record(z.string(), z.unknown()).optional(),
  completeness: z.number().min(0).max(1),
  packageType: z.enum(["flight_hotel", "unknown"]).default("unknown"),
});

export const SearchRunSchema = z.object({
  id: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  sourceCount: z.number().int().nonnegative(),
  resultCount: z.number().int().nonnegative(),
  status: z.enum(["success", "partial", "failed"]),
  notes: z.array(z.string()),
});

export const SourceStatusSchema = z.object({
  source: z.string(),
  status: z.enum(["ok", "partial", "failed"]),
  notes: z.array(z.string()),
  resultCount: z.number().int().nonnegative(),
});

export const LatestDataSchema = z.object({
  generatedAt: z.string(),
  run: SearchRunSchema,
  sourceStatuses: z.array(SourceStatusSchema),
  deals: z.array(DealSchema),
});

export const HistoryDataSchema = z.object({
  updatedAt: z.string(),
  runs: z.array(SearchRunSchema),
});

export const DealGroupSchema = z.object({
  title: z.string(),
  description: z.string(),
  dealIds: z.array(z.string()),
});

export const ReportDataSchema = z.object({
  generatedAt: z.string(),
  markdownPath: z.string(),
  groups: z.array(DealGroupSchema),
});

export const SiteDataSchema = z.object({
  generatedAt: z.string(),
  run: SearchRunSchema,
  sourceStatuses: z.array(SourceStatusSchema),
  deals: z.array(DealSchema),
  report: ReportDataSchema,
  filters: z.object({
    countries: z.array(z.string()),
    sources: z.array(z.string()),
    maxKnownPrice: z.number().int().nonnegative(),
  }),
});

export type Deal = z.infer<typeof DealSchema>;
export type SearchRun = z.infer<typeof SearchRunSchema>;
export type SourceStatus = z.infer<typeof SourceStatusSchema>;
export type LatestData = z.infer<typeof LatestDataSchema>;
export type HistoryData = z.infer<typeof HistoryDataSchema>;
export type ReportData = z.infer<typeof ReportDataSchema>;
export type SiteData = z.infer<typeof SiteDataSchema>;

export type NormalizeDealInput = Partial<
  Omit<Deal, "id" | "score" | "reasons" | "interestingNote" | "completeness" | "isGreece">
> & {
  source: string;
  sourceUrl: string;
};
