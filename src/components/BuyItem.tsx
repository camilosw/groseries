import type { GroceryItem } from '../types';
import { useGroceries } from '../store/grocery-context';
import { InlineEdit } from './InlineEdit';
import { ItemMenu } from './ItemMenu';

interface BuyItemProps {
  item: GroceryItem;
}

export function BuyItem({ item }: BuyItemProps) {
  const { dispatch } = useGroceries();

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
      {item.quantity > 1 && (
        <span className="buy-item__quantity">x{item.quantity}</span>
      )}
      <ItemMenu
        itemName={item.name}
        quantity={item.quantity}
        onQuantityChange={(q) => dispatch({ type: 'SET_QUANTITY', id: item.id, quantity: q })}
        onRestore={() => dispatch({ type: 'REMOVE_FROM_BUY', id: item.id })}
        onDelete={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
      />
    </div>
  );
}
