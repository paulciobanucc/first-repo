export const formatPrice = (price: number | null, currency = "DKK") => {
  if (!price) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

export const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

