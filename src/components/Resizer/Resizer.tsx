/**
 * Компонент изменения размеров окон (Splitter / Resizer) a-la VS Code
 * Позволяет перетаскивать границы между панелями слева, справа, снизу и по центру.
 */

import React, { useState, useCallback } from 'react';

interface ResizerProps {
  direction: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
  title?: string;
}

export const Resizer: React.FC<ResizerProps> = ({ direction, onResize, title }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.classList.add('resizing');

    let lastX = e.clientX;
    let lastY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'vertical') {
        const delta = moveEvent.clientX - lastX;
        lastX = moveEvent.clientX;
        if (delta !== 0) onResize(delta);
      } else {
        // Для горизонтального разделителя (например, над консолью): движение вверх (уменьшение Y) увеличивает высоту
        const delta = lastY - moveEvent.clientY;
        lastY = moveEvent.clientY;
        if (delta !== 0) onResize(delta);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.classList.remove('resizing');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [direction, onResize]);

  return (
    <div
      className={`resizer ${direction} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      title={title || 'Потяните для изменения размера'}
      style={{
        width: direction === 'vertical' ? '4px' : '100%',
        height: direction === 'vertical' ? '100%' : '4px',
        cursor: direction === 'vertical' ? 'col-resize' : 'row-resize',
        background: isDragging ? '#6366f1' : 'transparent',
        transition: isDragging ? 'none' : 'background 0.15s ease',
        zIndex: 50,
        position: 'relative',
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        if (!isDragging) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
      }}
      onMouseLeave={(e) => {
        if (!isDragging) e.currentTarget.style.background = 'transparent';
      }}
    />
  );
};
