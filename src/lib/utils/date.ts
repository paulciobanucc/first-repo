const DANISH_MONTHS: Record<string, number> = {
  januar: 1,
  february: 2,
  februar: 2,
  marts: 3,
  march: 3,
  april: 4,
  maj: 5,
  may: 5,
  juni: 6,
  june: 6,
  juli: 7,
  july: 7,
  august: 8,
  september: 9,
  oktober: 10,
  october: 10,
  november: 11,
  december: 12,
};

const pad = (value: number) => value.toString().padStart(2, "0");

export const toIsoDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

export const addNights = (isoDate: string, nights: number) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + nights);
  return toIsoDate(date);
};

export const isJuneOrJuly = (isoDate: string | null | undefined) => {
  if (!isoDate) {
    return false;
  }

  const month = new Date(`${isoDate}T00:00:00Z`).getUTCMonth() + 1;
  return month === 6 || month === 7;
};

export const parseDanishDate = (input: string | null | undefined, fallbackYear?: number) => {
  if (!input) {
    return null;
  }

  const clean = input
    .trim()
    .toLowerCase()
    .replace(/,\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace("deb", "den");

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  const slashMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${pad(Number(month))}-${pad(Number(day))}`;
  }

  const textualMatch = clean.match(/(\d{1,2})\.?\s+([a-z\u00E6\u00F8\u00E5]+)(?:\s+(\d{4}))?/i);
  if (!textualMatch) {
    return null;
  }

  const day = Number(textualMatch[1]);
  const month = DANISH_MONTHS[textualMatch[2]];
  const year = Number(textualMatch[3] ?? fallbackYear ?? new Date().getUTCFullYear());
  if (!month || !day || !year) {
    return null;
  }

  return `${year}-${pad(month)}-${pad(day)}`;
};

export const formatIsoDate = (isoDate: string | null) => {
  if (!isoDate) {
    return "Date unavailable";
  }

  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};
