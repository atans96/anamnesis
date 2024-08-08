import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import type { Section } from '../types/anamnesis';

interface Props {
  section: Section;
  onTitleChange?: (newTitle: string) => void;
  onRemove?: () => void;
  children: React.ReactNode;
  isReadOnly?: boolean;
}

const SortableSection: React.FC<Props> = ({
  section,
  onTitleChange,
  onRemove,
  children,
  isReadOnly = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-4 rounded border p-2"
    >
      {isReadOnly ? (
        <h2 className="mb-2 text-xl font-bold">{section.title}</h2>
      ) : (
        <input
          type="text"
          value={section.title}
          placeholder="Add Your Title Section"
          onChange={(e) => onTitleChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-2 w-full p-1 font-bold"
        />
      )}
      {children}
      {!isReadOnly && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 rounded bg-red-500 p-1 text-sm text-white"
        >
          Remove Section
        </button>
      )}
    </div>
  );
};

export default SortableSection;
