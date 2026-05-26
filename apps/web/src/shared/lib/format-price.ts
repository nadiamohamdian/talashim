export function formatPrice(priceToman: number) {
  return new Intl.NumberFormat("fa-IR").format(priceToman);
}
