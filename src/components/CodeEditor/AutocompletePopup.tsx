/**
 * Компонент всплывающего окна автодополнения кода (IntelliSense Popup)
 * Навигация клавишами вверх/вниз, выбор по Enter / Tab.
 */

import React, { useEffect, useRef } from 'react';
import type { AutocompleteItem } from '../../types/ide';

interface AutocompletePopupProps {
  items: AutocompleteItem[];
  selectedIndex: number;
  onSelectItem: (item: AutocompleteItem) => void;
  position: { top: number; left: number };
}

export const AutocompletePopup: React.FC<AutocompletePopupProps> = ({
  items,
  selectedIndex,
  onSelectItem,
  position
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Прокрутка к выбранному элементу
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (items.length === 0) return null;

  return (
    <div 
      className="autocomplete-popup"
      ref={containerRef}
      style={{
        top: `${position.top + 24}px`,
        left: `${Math.min(position.left, 500)}px`
      }}
    >
      {items.map((item, index) => (
        <div 
          key={index}
          className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelectItem(item)}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            {item.documentation && (
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.documentation}</span>
            )}
          </div>
          <span className="autocomplete-kind">{item.kind}</span>
        </div>
      ))}
    </div>
  );
};
