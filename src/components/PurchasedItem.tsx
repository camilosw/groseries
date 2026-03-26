import { purchaseInterval } from '../utils/frequency';
import type { GroceryItem } from '../types';
import { useGroceries } from '../store/grocery-context';
import { InlineEdit } from './InlineEdit';

interface PurchasedItemProps {
  item: GroceryItem;
}

export function PurchasedItem({ item }: PurchasedItemProps) {
  const { dispatch } = useGroceries();
  const interval = purchaseInterval(item.purchaseHistory);

  return (
    <div className="purchased-item">
      <input
        type="checkbox"
        className="purchased-item__checkbox"
        checked={true}
        onChange={() => dispatch({ type: 'UNCHECK_ITEM', id: item.id })}
        aria-label={`Mark ${item.name} as not purchased`}
      />
      <InlineEdit
        value={item.name}
        className="purchased-item__name"
        inputClassName="purchased-item__name-input"
        onSave={(newName) => {
          if (newName && newName !== item.name) {
            dispatch({ type: 'RENAME_ITEM', id: item.id, name: newName });
          }
        }}
        ariaLabel={`Edit name of ${item.name}`}
      />
      {interval !== null && (
        <span className="purchased-item__badge">{Math.round(interval)}d</span>
      )}
      <button
        className="purchased-item__delete"
        onClick={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
        aria-label={`Delete ${item.name}`}
      >
        ×
      </button>
    </div>
  );
}
