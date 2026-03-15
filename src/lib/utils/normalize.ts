import { scoreDeal } from "../scoring/dealScoring";
import { addNights, parseDanishDate } from "./date";
import { DealSchema, type Deal, type NormalizeDealInput } from "../types/deals";

type DealFieldsBeforeScoring = {
  id: string;
  source: string;
  provider?: string | null;
  sourceUrl: string;
  hotelName: string | null;
  destination: string | null;
  country: string | null;
  departureAirport: string | null;
  departureDate: string | null;
  returnDate: string | null;
  nights: number | null;
  travelers: number | null;
  totalPrice: number | null;
  currency: string;
  hotelImageUrl: string | null;
  screenshotPath: string | null;
  foundAt: string;
  rawExtract?: Record<string, unknown>;
  isGreece: boolean;
  packageType: "flight_hotel" | "unknown";
};

const normalizeText = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeAirport = (value: string | null | undefined) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (/billund|bll/i.test(normalized)) {
    return "Billund (BLL)";
  }

  return normalized;
};

const normalizeCountry = (value: string | null | undefined) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const countryMap: Array<[RegExp, string]> = [
    [/gr\u00E6kenland|greece/i, "Greece"],
    [/tyrkiet|turkey/i, "Turkey"],
    [/spanien|spain/i, "Spain"],
    [/albanien|albania/i, "Albania"],
    [/cypern|cyprus/i, "Cyprus"],
    [/bulgarien|bulgaria/i, "Bulgaria"],
    [/kroatien|croatia/i, "Croatia"],
    [/portugal/i, "Portugal"],
    [/egypten|egypt/i, "Egypt"],
    [/malta/i, "Malta"],
  ];

  for (const [pattern, label] of countryMap) {
    if (pattern.test(normalized)) {
      return label;
    }
  }

  return normalized;
};

const normalizePrice = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  if (!value) {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
};

const createStableId = (parts: Array<string | number | null>) => {
  const raw = parts.filter(Boolean).join("|");
  let hash = 0;
  for (const char of raw) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `deal-${hash.toString(16)}`;
};

export const computeCompleteness = (deal: DealFieldsBeforeScoring) => {
  const checks = [
    deal.hotelName,
    deal.destination,
    deal.country,
    deal.departureAirport,
    deal.departureDate,
    deal.returnDate,
    deal.nights,
    deal.travelers,
    deal.totalPrice,
    deal.hotelImageUrl ?? deal.screenshotPath,
  ];

  const presentCount = checks.filter((value) => value !== null && value !== undefined).length;
  return Number((presentCount / checks.length).toFixed(2));
};

export const normalizeDeal = (input: NormalizeDealInput): Deal | null => {
  const inputDepartureDate = normalizeText(input.departureDate);
  const departureDate =
    (inputDepartureDate && /^\d{4}-\d{2}-\d{2}$/.test(inputDepartureDate)
      ? inputDepartureDate
      : parseDanishDate(inputDepartureDate)) ??
    parseDanishDate((input.rawExtract?.departureText as string | undefined) ?? null);
  const nights = input.nights ?? null;
  const normalizedCountry = normalizeCountry(input.country);
  const destination = normalizeText(input.destination);
  const isGreece = /greece/i.test(normalizedCountry ?? "") || /greece|gr[\u00E6a]kenland/i.test(destination ?? "");

  const baseDeal = {
    id: createStableId([
      input.source,
      input.provider ?? null,
      input.hotelName ?? destination,
      departureDate,
      input.totalPrice ?? input.rawExtract?.totalPriceText,
      input.sourceUrl,
    ]),
    source: input.source,
    provider: input.provider ?? null,
    sourceUrl: input.sourceUrl,
    hotelName: normalizeText(input.hotelName),
    destination,
    country: normalizedCountry,
    departureAirport: normalizeAirport(input.departureAirport),
    departureDate,
    returnDate:
      normalizeText(input.returnDate) ??
      (departureDate && nights ? addNights(departureDate, nights) : null),
    nights,
    travelers: input.travelers ?? null,
    totalPrice: normalizePrice(input.totalPrice ?? (input.rawExtract?.totalPriceText as string | undefined)),
    currency: input.currency ?? "DKK",
    hotelImageUrl: normalizeText(input.hotelImageUrl),
    screenshotPath: normalizeText(input.screenshotPath),
    foundAt: normalizeText(input.foundAt) ?? new Date().toISOString(),
    rawExtract: input.rawExtract,
    isGreece,
    packageType: input.packageType ?? "unknown",
  };

  const completeness = computeCompleteness(baseDeal);
  const scored = scoreDeal({
    ...baseDeal,
    completeness,
    score: 0,
    reasons: [],
    interestingNote: "",
  });

  const parsed = DealSchema.safeParse({
    ...baseDeal,
    completeness,
    score: scored.score,
    reasons: scored.reasons,
    interestingNote: scored.interestingNote,
  });

  if (!parsed.success || scored.hardFilterFailures.length > 0) {
    return null;
  }

  return parsed.data;
};
