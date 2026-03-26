import { purchaseInterval } from '../utils/frequency';
import type { GroceryItem } from '../types';
import { useGroceries } from '../store/grocery-context';
import { InlineEdit } from './InlineEdit';

interface BuyItemProps {
  item: GroceryItem;
}

export function BuyItem({ item }: BuyItemProps) {
  const { dispatch } = useGroceries();
  const interval = purchaseInterval(item.purchaseHistory);

  return (
    <div className="buy-item">
      <input
        type="checkbox"
        className="buy-item__checkbox"
        checked={false}
        onChange={() => dispatch({ type: 'CHECK_ITEM', id: item.id })}
        aria-label={`Mark ${item.name} as purchased`}
      />
      <InlineEdit
        value={item.name}
        className="buy-item__name"
        inputClassName="buy-item__name-input"
        onSave={(newName) => {
          if (newName && newName !== item.name) {
            dispatch({ type: 'RENAME_ITEM', id: item.id, name: newName });
          }
        }}
        ariaLabel={`Edit name of ${item.name}`}
      />
      {interval !== null && (
        <span className="buy-item__badge">{Math.round(interval)}d</span>
      )}
      <button
        className="buy-item__delete"
        onClick={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
        aria-label={`Delete ${item.name}`}
      >
        ×
      </button>
    </div>
  );
}
