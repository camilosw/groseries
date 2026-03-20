import { PurchasedItem } from './PurchasedItem';
import type { GroceryItem, PurchasedSortMode } from '../types';
import { useGroceries } from '../store/grocery-context';
import { frequencyScore } from '../utils/frequency';

interface PurchasedListProps {
  items: GroceryItem[];
}

function sortPurchased(
  items: GroceryItem[],
  mode: PurchasedSortMode,
): GroceryItem[] {
  const sorted = [...items];
  if (mode === 'alphabetical') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort(
      (a, b) =>
        frequencyScore(b.purchaseHistory) - frequencyScore(a.purchaseHistory),
    );
  }
  return sorted;
}

export function PurchasedList({ items }: PurchasedListProps) {
  const { state, dispatch } = useGroceries();
  const sorted = sortPurchased(items, state.sortMode);

  return (
    <div className="purchased-list">
      <div className="purchased-list__sort-bar">
        <button
          className={`purchased-list__sort-btn${state.sortMode === 'frequency' ? ' purchased-list__sort-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_SORT_MODE', mode: 'frequency' })}
        >
          Frequency
        </button>
        <button
          className={`purchased-list__sort-btn${state.sortMode === 'alphabetical' ? ' purchased-list__sort-btn--active' : ''}`}
          onClick={() =>
            dispatch({ type: 'SET_SORT_MODE', mode: 'alphabetical' })
          }
        >
          A–Z
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="purchased-list__empty">Nothing purchased yet!</div>
      ) : (
        sorted.map((item) => <PurchasedItem key={item.id} item={item} />)
      )}
    </div>
  );
}
