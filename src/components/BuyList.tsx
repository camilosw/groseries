import { BuyItem } from './BuyItem';
import type { GroceryItem } from '../types';

interface BuyListProps {
  items: GroceryItem[];
}

export function BuyList({ items }: BuyListProps) {
  const sorted = [...items].sort((a, b) => a.purchaseOrder - b.purchaseOrder);

  if (sorted.length === 0) {
    return <div className="buy-list__empty">Nothing to buy!</div>;
  }

  return (
    <div className="buy-list">
      {sorted.map((item) => (
        <BuyItem key={item.id} item={item} />
      ))}
    </div>
  );
}
