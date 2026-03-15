import { describe, expect, it } from "vitest";
import type { SourceAdapter } from "../../sources/base/types";
import { normalizeDeal } from "../../src/lib/utils/normalize";

const workingAdapter: SourceAdapter = {
  source: "mock-good",
  async search() {
    return {
      source: "mock-good",
      status: "ok",
      notes: ["Mock adapter returned a valid June deal."],
      deals: [
        {
          source: "mock-good",
          sourceUrl: "https://example.com/mock",
          hotelName: "Mock Hotel",
          destination: "Kos",
          country: "Greece",
          departureAirport: "Billund (BLL)",
          departureDate: "2026-06-10",
          nights: 7,
          travelers: 2,
          totalPrice: 6800,
          packageType: "flight_hotel",
        },
      ],
    };
  },
};

const failingAdapter: SourceAdapter = {
  source: "mock-bad",
  async search() {
    return {
      source: "mock-bad",
      status: "failed",
      notes: ["Intentional failure."],
      deals: [],
    };
  },
};

describe("mock adapter integration", () => {
  it("keeps working deals even when another source fails", async () => {
    const results = await Promise.all([
      workingAdapter.search({
        runId: "test",
        startedAt: "2026-03-07T00:00:00.000Z",
        screenshotsDir: "public/screenshots",
        preferences: {
          departureAirport: "Billund (BLL)",
          travelers: 2,
          nights: 7,
          months: [6, 7],
          budgetTarget: 7000,
        },
      }),
      failingAdapter.search({
        runId: "test",
        startedAt: "2026-03-07T00:00:00.000Z",
        screenshotsDir: "public/screenshots",
        preferences: {
          departureAirport: "Billund (BLL)",
          travelers: 2,
          nights: 7,
          months: [6, 7],
          budgetTarget: 7000,
        },
      }),
    ]);

    const deals = results.flatMap((result) => result.deals.map(normalizeDeal).filter((deal) => deal !== null));

    expect(results[1].status).toBe("failed");
    expect(deals).toHaveLength(1);
    expect(deals[0]?.hotelName).toBe("Mock Hotel");
  });
});

