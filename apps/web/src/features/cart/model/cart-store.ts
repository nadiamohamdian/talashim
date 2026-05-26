"use client";

import { useMemo, useState } from "react";

const initialItems = [
  { id: "prod-ring-1", title: "انگشتر طلای رویال", quantity: 1, priceToman: 32750000 },
];

export function useCartStore() {
  const [items] = useState(initialItems);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.priceToman,
        0,
      ),
    [items],
  );

  return { items, total };
}
