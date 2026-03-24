import { useEffect, useRef } from 'react';
import { version } from '../../package.json';
import './AboutModal.css';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="about-overlay" onClick={handleOverlayClick}>
      <div className="about-card" ref={cardRef}>
        <button className="about-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="about-title">Grocery List</h2>
        <p className="about-version">v{version}</p>
        <a
          className="about-link"
          href="https://github.com/camilosw/groceries"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/camilosw/groceries
        </a>
      </div>
    </div>
  );
}
