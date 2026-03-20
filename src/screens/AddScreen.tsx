import { useState, useRef, useEffect } from 'react';
import './AddScreen.css';
import { AddItemRow } from '../components/AddItemRow';
import { useGroceries } from '../store/grocery-context';

interface AddScreenProps {
  onClose: () => void;
}

export function AddScreen({ onClose }: AddScreenProps) {
  const { state, dispatch } = useGroceries();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();
  const lowerQuery = trimmed.toLowerCase();

  const allItems = state.items;

  const filtered = trimmed
    ? allItems.filter((item) => item.name.toLowerCase().includes(lowerQuery))
    : allItems;

  const exactMatch = allItems.find(
    (item) => item.name.toLowerCase() === lowerQuery,
  );
  const showNewRow = trimmed.length > 0 && !exactMatch;

  function handleAdd(id: string) {
    dispatch({ type: 'ADD_TO_BUY', id });
    setQuery('');
  }

  function handleCreate() {
    dispatch({ type: 'CREATE_AND_ADD', name: trimmed });
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !trimmed) return;
    if (showNewRow) {
      handleCreate();
    } else if (exactMatch && exactMatch.bought) {
      handleAdd(exactMatch.id);
    }
  }

  return (
    <div className="add-screen">
      <div className="add-screen__header">
        <button
          className="add-screen__back"
          onClick={onClose}
          aria-label="Back"
        >
          ←
        </button>
        <input
          ref={inputRef}
          className="add-screen__input"
          type="text"
          placeholder="Search or add item…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <ul className="add-screen__list">
        {filtered.map((item) => (
          <li key={item.id}>
            <AddItemRow
              name={item.name}
              inList={!item.bought}
              onAdd={() => handleAdd(item.id)}
              onRemove={() => {
                if (item.purchaseHistory.length === 0) {
                  dispatch({ type: 'DELETE_ITEM', id: item.id });
                } else {
                  dispatch({ type: 'REMOVE_FROM_BUY', id: item.id });
                }
              }}
            />
          </li>
        ))}
        {showNewRow && (
          <li>
            <AddItemRow
              name={trimmed}
              inList={false}
              isNew
              onAdd={handleCreate}
            />
          </li>
        )}
      </ul>
    </div>
  );
}
