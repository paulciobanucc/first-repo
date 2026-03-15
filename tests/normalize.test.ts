import { describe, expect, it } from "vitest";
import { normalizeDeal } from "../src/lib/utils/normalize";

describe("normalizeDeal", () => {
  it("normalizes raw source data and computes return date", () => {
    const normalized = normalizeDeal({
      source: "travelmarket.dk",
      sourceUrl: "https://example.com/deal",
      hotelName: "Blue Bay",
      destination: "Rhodes",
      country: "Gr\u00E6kenland",
      departureAirport: "BLL",
      departureDate: "21. juni 2026",
      nights: 7,
      travelers: 2,
      totalPrice: "6999 kr",
      packageType: "flight_hotel",
      foundAt: "2026-03-07T00:00:00.000Z",
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.country).toBe("Greece");
    expect(normalized?.departureAirport).toBe("Billund (BLL)");
    expect(normalized?.returnDate).toBe("2026-06-28");
    expect(normalized?.score).toBeGreaterThan(0);
  });

  it("drops deals outside the target months", () => {
    const normalized = normalizeDeal({
      source: "travelmarket.dk",
      sourceUrl: "https://example.com/deal",
      hotelName: "Late Summer Resort",
      departureAirport: "Billund (BLL)",
      departureDate: "2026-08-02",
      nights: 7,
      travelers: 2,
      totalPrice: 7200,
      packageType: "flight_hotel",
    });

    expect(normalized).toBeNull();
  });
});
