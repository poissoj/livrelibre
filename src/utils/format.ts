// This will use the browser default locale
const LOCALE = undefined;

const priceFormatter = Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
});
export const formatPrice = (price: number) =>
  priceFormatter.format(price).replace(/\s/g, " "); // non-breaking space

const percentFormatter = Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
});
export const formatPercent = (n: number) =>
  percentFormatter.format(n).replace(/\s/g, " ");

export const formatTVA = (tva: string | undefined) =>
  !tva || tva === "Inconnu" ? tva : formatPercent(Number(tva) / 100);

const numberFormatter = Intl.NumberFormat(LOCALE, { style: "decimal" });
export const formatNumber = (n: number) => numberFormatter.format(n);
