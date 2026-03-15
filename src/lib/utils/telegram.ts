import type { Deal } from "../types/deals";

const TELEGRAM_BASE_URL = "https://api.telegram.org";

export const sendTelegramSummary = async (deals: Deal[], dashboardUrl: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { sent: false, reason: "Telegram secrets not configured." };
  }

  const topDeals = deals.slice(0, 3);
  const body = [
    "Holiday Hunter top deals",
    ...topDeals.map((deal, index) => {
      const price = deal.totalPrice ? `${deal.totalPrice} ${deal.currency}` : "price unclear";
      return `${index + 1}. ${deal.hotelName ?? deal.destination ?? "Unknown deal"} - ${price} - score ${deal.score}`;
    }),
    dashboardUrl,
  ].join("\n");

  const response = await fetch(`${TELEGRAM_BASE_URL}/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: body,
      disable_web_page_preview: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram request failed with status ${response.status}.`);
  }

  return { sent: true };
};
