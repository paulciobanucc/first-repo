import path from "node:path";
import type { Page } from "playwright";
import type { NormalizeDealInput } from "../../src/lib/types/deals";
import { createBrowser } from "../base/browser";
import type { SearchContext, SourceAdapter, SourceRunResult } from "../base/types";

const SOURCE = "afbudsrejser.dk";
const BASE_URL = "https://www.afbudsrejser.dk";

const getSummerWindow = () => {
  const now = new Date();
  const targetYear = now.getUTCMonth() + 1 <= 7 ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
  return {
    departureStart: `${targetYear}-06-01`,
    latestReturn: `${targetYear}-08-07`,
  };
};

const buildSearchUrl = () => {
  const summerWindow = getSummerWindow();
  const params = new URLSearchParams({
    orig: "BLL",
    edepdate: summerWindow.departureStart,
    lretdate: summerWindow.latestReturn,
    duration: "7-7",
    age: "42-42",
    category: "sunbath",
    sort: "price",
    rating: "!flightonly",
  });

  return `${BASE_URL}/charter?${params.toString()}`;
};

type RawAfbudsCard = {
  hotelName: string | null;
  destination: string | null;
  country: string | null;
  departureDate: string | null;
  nights: number | null;
  totalPrice: string | null;
  imageUrl: string | null;
  provider: string | null;
  sourceUrl: string | null;
};

const readCard = async (page: Page, index: number): Promise<RawAfbudsCard | null> => {
  const section = page.locator("section.charter-result").nth(index);
  if ((await section.count()) === 0) {
    return null;
  }

  return section.evaluate((node) => {
    const titleNode = node.querySelector("h2 a.js-title-link");
    const destinationNodes = node.querySelectorAll(".destination-name a");
    const destinationLinks: string[] = [];
    for (let index = 0; index < destinationNodes.length; index += 1) {
      const text = (destinationNodes[index]?.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) {
        destinationLinks.push(text);
      }
    }

    const offerDetailsText = (node.querySelector(".offer-details")?.textContent ?? "").replace(/\s+/g, " ").trim();
    const departureDateText = (node.querySelector(".js-origin-date")?.textContent ?? "").replace(/\s+/g, " ").trim();
    const totalPriceText = (node.querySelector(".js-total-price")?.textContent ?? "").replace(/\s+/g, " ").trim();
    const deepLink = node.querySelector("a.charter-button-cta")?.getAttribute("href");
    const titleLink = node.querySelector("a.js-title-link")?.getAttribute("href");
    const carouselLink = node.querySelector("a.rg-carousel");
    const imageFromAttr = carouselLink?.getAttribute("content") ?? carouselLink?.getAttribute("data-images")?.split("#")[0] ?? null;
    const nightsText = offerDetailsText.match(/N[\u00E6a]tter:\s*(\d+)/i)?.[1] ?? null;
    const providerAlt = node.querySelector("img.js-supplier-logo")?.getAttribute("alt") ?? "";

    return {
      hotelName: (titleNode?.textContent ?? "").replace(/\s+/g, " ").trim() || null,
      destination: destinationLinks[0] ?? null,
      country: destinationLinks[destinationLinks.length - 1] ?? null,
      departureDate: departureDateText || null,
      nights: nightsText ? Number(nightsText) : null,
      totalPrice: totalPriceText || null,
      imageUrl: imageFromAttr,
      provider: providerAlt.replace(/^Logo:\s*/i, "") || null,
      sourceUrl: deepLink ?? titleLink ?? null,
    };
  });
};

const captureSectionScreenshot = async (page: Page, index: number, runId: string) => {
  const section = page.locator("section.charter-result").nth(index);
  if ((await section.count()) === 0) {
    return null;
  }

  const fileName = `afbudsrejser-${runId}-${index + 1}.png`;
  const targetPath = path.join(process.cwd(), "public", "screenshots", fileName);
  await section.screenshot({ path: targetPath }).catch(() => undefined);
  return `/screenshots/${fileName}`;
};

const toAbsoluteUrl = (value: string | null) => {
  if (!value) {
    return null;
  }

  return new URL(value, BASE_URL).href;
};

export const afbudsrejserAdapter: SourceAdapter = {
  source: SOURCE,
  async search(context: SearchContext): Promise<SourceRunResult> {
    const browser = await createBrowser();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
    });

    const searchUrl = buildSearchUrl();

    try {
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForSelector("section.charter-result", { timeout: 20000 });
      await page.waitForTimeout(2500);

      const sectionCount = await page.locator("section.charter-result").count();
      const limit = Math.min(sectionCount, 18);
      const deals: NormalizeDealInput[] = [];

      for (let index = 0; index < limit; index += 1) {
        const card = await readCard(page, index);
        if (!card || !card.sourceUrl) {
          continue;
        }

        const screenshotPath = await captureSectionScreenshot(page, index, context.runId);
        deals.push({
          source: SOURCE,
          provider: card.provider,
          sourceUrl: toAbsoluteUrl(card.sourceUrl) ?? searchUrl,
          hotelName: card.hotelName,
          destination: card.destination,
          country: card.country,
          departureAirport: context.preferences.departureAirport,
          departureDate: card.departureDate,
          nights: card.nights ?? context.preferences.nights,
          travelers: context.preferences.travelers,
          totalPrice: card.totalPrice,
          currency: "DKK",
          hotelImageUrl: toAbsoluteUrl(card.imageUrl),
          screenshotPath,
          packageType: "flight_hotel",
          foundAt: new Date().toISOString(),
          rawExtract: {
            searchUrl,
          },
        });
      }

      return {
        source: SOURCE,
        status: deals.length > 0 ? "ok" : "partial",
        notes: [`Loaded ${searchUrl}`, `Extracted ${deals.length} candidate result cards.`],
        deals,
      };
    } catch (error) {
      return {
        source: SOURCE,
        status: "failed",
        notes: [error instanceof Error ? error.message : "Unknown Afbudsrejser failure."],
        deals: [],
      };
    } finally {
      await page.close().catch(() => undefined);
      await browser.close().catch(() => undefined);
    }
  },
};
