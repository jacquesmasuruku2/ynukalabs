import { useState, useRef, useEffect } from 'react';
import './EmojiPicker.css';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const EMOJIS = ['👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '😍'];

const EmojiPicker = ({ onSelect, onClose, position }: EmojiPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="emoji-picker"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="emoji-picker-grid">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="emoji-picker-item"
            onClick={() => onSelect(emoji)}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
