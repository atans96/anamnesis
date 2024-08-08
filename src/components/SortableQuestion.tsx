import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useRef, useState } from 'react';

import type { Question } from '../types/anamnesis';

interface Props {
  question: Question;
  onQuestionChange: (field: keyof Question, value: string) => void;
  onRemove: () => void;
  isReadOnly: boolean;
}

const SortableQuestion: React.FC<Props> = ({
  question,
  onQuestionChange,
  onRemove,
  isReadOnly,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const [localChoices, setLocalChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const choiceInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (question.type === 'multiple_choice') {
      try {
        const parsedChoices = JSON.parse(question.answer);
        setLocalChoices(parsedChoices.choices || []);
        setSelectedChoice(parsedChoices.selected || '');
      } catch {
        setLocalChoices([]);
        setSelectedChoice('');
      }
    }
  }, [question.type, question.answer]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateMultipleChoiceAnswer = (
    choicesArray: string[],
    selected: string
  ) => {
    onQuestionChange(
      'answer',
      JSON.stringify({ choices: choicesArray, selected })
    );
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...localChoices];
    newChoices[index] = value;
    setLocalChoices(newChoices);
    updateMultipleChoiceAnswer(newChoices, selectedChoice);
  };

  const handleChoiceSelection = (value: string) => {
    setSelectedChoice(value);
    updateMultipleChoiceAnswer(localChoices, value);
  };

  const addChoice = () => {
    const newChoices = [...localChoices, ''];
    setLocalChoices(newChoices);
    updateMultipleChoiceAnswer(newChoices, selectedChoice);
  };

  const removeChoice = (index: number) => {
    const newChoices = localChoices.filter((_, i) => i !== index);
    const newSelected =
      selectedChoice === localChoices[index] ? '' : selectedChoice;
    setLocalChoices(newChoices);
    setSelectedChoice(newSelected);
    updateMultipleChoiceAnswer(newChoices, newSelected);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) {
      return ''; // Return empty string if dateString is empty
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return ''; // Return empty string if date is invalid
    }
    return date.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) {
      return 'No date selected';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={question.answer}
            onChange={(e) => onQuestionChange('answer', e.target.value)}
            className="w-full rounded border p-1"
            placeholder="Short answer"
            disabled={isReadOnly}
            onKeyDown={handleKeyDown}
          />
        );
      case 'long_text':
        return (
          <textarea
            value={question.answer}
            onChange={(e) => onQuestionChange('answer', e.target.value)}
            className="w-full rounded border p-1"
            placeholder="Long answer"
            rows={3}
            onKeyDown={handleKeyDown}
            disabled={isReadOnly}
          />
        );
      case 'multiple_choice':
        return (
          <div>
            {localChoices.map((choice, index) => (
              // eslint-disable-next-line
              <div key={`${index}`} className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedChoice === choice}
                  onChange={() => handleChoiceSelection(choice)}
                  disabled={isReadOnly}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={choice}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  className="mr-2 w-full rounded border p-1"
                  placeholder={`Choice ${index + 1}`}
                  disabled={isReadOnly}
                  ref={(el) => {
                    choiceInputRefs.current[index] = el;
                  }}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="rounded bg-red-500 px-2 py-1 text-sm text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!isReadOnly && (
              <button
                type="button"
                onClick={addChoice}
                className="rounded bg-green-500 px-2 py-1 text-sm text-white"
              >
                Add Choice
              </button>
            )}
          </div>
        );
      case 'date_time':
        return isReadOnly ? (
          <p>{formatDateForDisplay(question.answer)}</p>
        ) : (
          <input
            type="datetime-local"
            value={formatDateForInput(question.answer)}
            onChange={(e) => onQuestionChange('answer', e.target.value)}
            className="w-full rounded border p-1"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 rounded border p-2"
    >
      {isReadOnly ? (
        <p className="mb-2 font-bold">{question.text}</p>
      ) : (
        <input
          type="text"
          value={question.text}
          onKeyDown={handleKeyDown}
          onChange={(e) => onQuestionChange('text', e.target.value)}
          className="mb-2 w-full rounded border p-1"
          placeholder="Question"
        />
      )}
      {!isReadOnly && (
        <select
          value={question.type}
          onChange={(e) => onQuestionChange('type', e.target.value)}
          className="mb-2 w-full rounded border p-1"
        >
          <option value="short_text">Short Text</option>
          <option value="long_text">Long Text</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="date_time">Date Time</option>
        </select>
      )}
      {renderQuestionInput()}
      {!isReadOnly && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 rounded bg-red-500 p-1 text-sm text-white"
        >
          Remove Question
        </button>
      )}
    </div>
  );
};

export default SortableQuestion;
