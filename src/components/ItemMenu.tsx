import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ItemMenu.css';

interface ItemMenuProps {
  itemName: string;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onDelete: () => void;
  onRestore?: () => void;
}

export function ItemMenu({ itemName, quantity, onQuantityChange, onDelete, onRestore }: ItemMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [inputValue, setInputValue] = useState(String(quantity));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpen) setInputValue(String(quantity));
  }, [menuOpen, quantity]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleTrigger() {
    if (!menuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen((v) => !v);
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete();
  }

  function handleRestore() {
    setMenuOpen(false);
    onRestore?.();
  }

  function handleDecrement() {
    const next = Math.max(1, quantity - 1);
    onQuantityChange(next);
    setInputValue(String(next));
  }

  function handleIncrement() {
    const next = quantity + 1;
    onQuantityChange(next);
    setInputValue(String(next));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleInputBlur() {
    const parsed = parseInt(inputValue, 10);
    const clamped = isNaN(parsed) ? 1 : Math.max(1, parsed);
    onQuantityChange(clamped);
    setInputValue(String(clamped));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="item-menu__trigger"
        aria-label={`Menu for ${itemName}`}
        onClick={handleTrigger}
      >
        ⋮
      </button>
      {menuOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="item-menu__dropdown"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            <div className="item-menu__quantity">
              <button
                className="item-menu__qty-btn"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                className="item-menu__qty-input"
                type="number"
                min={1}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                aria-label="Quantity"
              />
              <button
                className="item-menu__qty-btn"
                onClick={handleIncrement}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {onRestore && (
              <button className="item-menu__option" onClick={handleRestore}>
                Restore to Purchased
              </button>
            )}
            <button
              className="item-menu__option item-menu__option--danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
