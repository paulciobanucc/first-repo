import { chromium } from "playwright";

export const createBrowser = async () =>
  chromium.launch({
    headless: true,
  });

