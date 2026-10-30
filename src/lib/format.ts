// priceLakh: 100 lakh = 1 crore
export function formatPrice(lakh: number) {
  return lakh >= 100 ? `₹${(lakh / 100).toFixed(2)} Cr` : `₹${lakh} L`;
}

export function formatArea(sqft: number) {
  return `${sqft.toLocaleString("en-IN")} sq ft`;
}
