import type { Deal } from "../lib/types/deals";
import { formatIsoDate } from "../lib/utils/date";
import { formatPrice } from "../lib/utils/format";

type DealCardProps = {
  deal: Deal;
};

export const DealCard = ({ deal }: DealCardProps) => {
  const image = deal.hotelImageUrl ?? deal.screenshotPath ?? `${import.meta.env.BASE_URL}screenshots/sample-deal-card.svg`;

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-deal transition hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden bg-pine/10">
        <img className="h-full w-full object-cover" src={image} alt={deal.hotelName ?? deal.destination ?? "Holiday deal"} />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-pine">
          Score {deal.score}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-pine/60">
            {deal.source}
            {deal.provider ? ` / ${deal.provider}` : ""}
          </p>
          <h3 className="font-display text-xl text-ink">{deal.hotelName ?? "Hotel name unavailable"}</h3>
          <p className="text-sm text-ink/70">
            {[deal.destination, deal.country].filter(Boolean).join(", ") || "Destination unavailable"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[22px] bg-mint/35 p-4 text-sm text-ink">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Dates</p>
            <p>{`${formatIsoDate(deal.departureDate)} to ${formatIsoDate(deal.returnDate)}`}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Trip</p>
            <p>{deal.nights ? `${deal.nights} nights` : "Nights unknown"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Travelers</p>
            <p>{deal.travelers ? `${deal.travelers} adults` : "Travelers unknown"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Price</p>
            <p>{formatPrice(deal.totalPrice, deal.currency)}</p>
          </div>
        </div>

        <p className="rounded-[20px] bg-sand/45 px-4 py-3 text-sm text-ink">{deal.interestingNote}</p>

        <div className="flex flex-wrap gap-2">
          {deal.reasons.slice(0, 3).map((reason) => (
            <span key={reason} className="rounded-full bg-pine/10 px-3 py-1 text-xs text-pine">
              {reason}
            </span>
          ))}
        </div>

        <a
          className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#f36e3d]"
          href={deal.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          View deal
        </a>
      </div>
    </article>
  );
};
