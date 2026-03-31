import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ItemMenu.css';

interface ItemMenuProps {
  itemName: string;
  onDelete: () => void;
}

export function ItemMenu({ itemName, onDelete }: ItemMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
