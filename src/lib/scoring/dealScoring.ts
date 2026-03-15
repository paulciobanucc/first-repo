import type { Deal } from "../types/deals";
import { isJuneOrJuly } from "../utils/date";

export type ScoredDeal = {
  score: number;
  reasons: string[];
  interestingNote: string;
  hardFilterFailures: string[];
};

const scorePrice = (deal: Deal, reasons: string[]) => {
  if (deal.totalPrice === null) {
    reasons.push("Missing total price reduces confidence.");
    return -16;
  }

  if (deal.totalPrice <= 7000) {
    reasons.push("Within the 7000 DKK target.");
    return 28;
  }

  if (deal.totalPrice <= 8000) {
    reasons.push("Slightly above budget but still close.");
    return 16;
  }

  if (deal.totalPrice <= 9000) {
    reasons.push("Above budget but still potentially workable.");
    return 6;
  }

  reasons.push("Far above the preferred budget.");
  return -18;
};

const buildInterestingNote = (deal: Deal, reasons: string[]) => {
  if (deal.totalPrice !== null && deal.totalPrice <= 7000 && deal.isGreece) {
    return "Strong fit: under budget and in Greece.";
  }

  if (deal.totalPrice !== null && deal.totalPrice <= 8000 && deal.completeness >= 0.8) {
    return "Good value: close to budget with complete package details.";
  }

  if (deal.completeness < 0.6 || deal.totalPrice === null) {
    return "Promising but incomplete: some key details still need checking.";
  }

  return reasons[0] ?? "Worth a look based on the current filters.";
};

export const scoreDeal = (deal: Deal): ScoredDeal => {
  const hardFilterFailures: string[] = [];
  const reasons: string[] = [];
  let score = 50;

  if (deal.departureAirport && !/billund|bll/i.test(deal.departureAirport)) {
    hardFilterFailures.push("Departure airport is not Billund.");
  }

  if (deal.travelers !== null && deal.travelers !== 2) {
    hardFilterFailures.push("Traveler count does not match 2 adults.");
  }

  if (deal.nights !== null && deal.nights !== 7) {
    hardFilterFailures.push("Trip length does not match 7 nights.");
  }

  if (deal.packageType !== "unknown" && deal.packageType !== "flight_hotel") {
    hardFilterFailures.push("Package type is not flight plus accommodation.");
  }

  if (!isJuneOrJuly(deal.departureDate)) {
    hardFilterFailures.push("Departure date is outside June or July.");
  }

  score += scorePrice(deal, reasons);

  if (deal.isGreece) {
    score += 7;
    reasons.push("Greece gets a small ranking boost.");
  }

  if (deal.completeness >= 0.85) {
    score += 12;
    reasons.push("Complete data makes this easier to compare.");
  } else if (deal.completeness >= 0.65) {
    score += 6;
    reasons.push("Most key fields are available.");
  } else {
    score -= 12;
    reasons.push("Several important fields are missing.");
  }

  if (deal.hotelImageUrl || deal.screenshotPath) {
    score += 4;
    reasons.push("Visual context is available.");
  }

  if (deal.departureDate && deal.returnDate) {
    score += 6;
    reasons.push("Departure and return dates are clearly extracted.");
  } else {
    score -= 4;
    reasons.push("Date extraction is incomplete.");
  }

  if (hardFilterFailures.length > 0) {
    score -= 100;
  }

  return {
    score,
    reasons,
    interestingNote: buildInterestingNote(deal, reasons),
    hardFilterFailures,
  };
};

