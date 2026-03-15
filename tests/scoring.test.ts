import { describe, expect, it } from "vitest";
import { scoreDeal } from "../src/lib/scoring/dealScoring";
import type { Deal } from "../src/lib/types/deals";

const baseDeal: Deal = {
  id: "deal-1",
  source: "travelmarket.dk",
  sourceUrl: "https://example.com/deal",
  hotelName: "Akti Coast",
  destination: "Kos",
  country: "Greece",
  departureAirport: "Billund (BLL)",
  departureDate: "2026-06-21",
  returnDate: "2026-06-28",
  nights: 7,
  travelers: 2,
  totalPrice: 6999,
  currency: "DKK",
  hotelImageUrl: "https://example.com/hotel.jpg",
  screenshotPath: "/screenshots/test.png",
  score: 0,
  reasons: [],
  interestingNote: "",
  foundAt: "2026-03-07T00:00:00.000Z",
  isGreece: true,
  completeness: 0.9,
  packageType: "flight_hotel",
};

describe("scoreDeal", () => {
  it("rewards in-budget Greece deals with strong completeness", () => {
    const scored = scoreDeal(baseDeal);
    expect(scored.hardFilterFailures).toHaveLength(0);
    expect(scored.score).toBeGreaterThan(90);
    expect(scored.interestingNote).toContain("under budget");
  });

  it("penalizes expensive and incomplete deals", () => {
    const scored = scoreDeal({
      ...baseDeal,
      totalPrice: 9800,
      hotelImageUrl: null,
      screenshotPath: null,
      completeness: 0.5,
      isGreece: false,
      country: "Spain",
    });

    expect(scored.score).toBeLessThan(60);
    expect(scored.reasons.some((reason) => reason.includes("Far above"))).toBe(true);
  });
});

