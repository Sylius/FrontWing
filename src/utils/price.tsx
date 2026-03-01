const formatPrice = (priceInCents?: number): string => {
  if (priceInCents === undefined) return "-";
  return (priceInCents / 100).toFixed(2);
};

export { formatPrice };
