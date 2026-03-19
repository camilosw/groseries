import { useState, useRef, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  title?: string;
  onOrderClick?: () => void;
}

export function Header({ title = 'Grocery List', onOrderClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleOrderClick() {
    setMenuOpen(false);
    onOrderClick?.();
  }

  return (
    <header className="app-header">
      <span className="app-header__icon">🛒</span>
      <div className="app-header__title">{title}</div>
      {onOrderClick && (
        <div className="app-header__menu" ref={menuRef}>
          <button
            className="app-header__menu-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="app-header__dropdown">
              <button className="app-header__dropdown-item" onClick={handleOrderClick}>
                Order
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
