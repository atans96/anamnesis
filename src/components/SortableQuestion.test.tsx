import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';

import type { Question } from '../types/anamnesis';
import SortableQuestion from './SortableQuestion';

// Mock the useSortable hook
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
  }),
}));

describe('SortableQuestion', () => {
  const mockOnQuestionChange = jest.fn();
  const mockOnRemove = jest.fn();

  const baseProps = {
    onQuestionChange: mockOnQuestionChange,
    onRemove: mockOnRemove,
    isReadOnly: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders short text question correctly', () => {
    const question: Question = {
      id: '1',
      text: 'Short Text Question',
      type: 'short_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    expect(screen.getByPlaceholderText('Question')).toHaveValue(
      'Short Text Question'
    );
    expect(screen.getByPlaceholderText('Short answer')).toBeInTheDocument();
  });

  it('renders long text question correctly', () => {
    const question: Question = {
      id: '1',
      text: 'Long Text Question',
      type: 'long_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    expect(screen.getByPlaceholderText('Question')).toHaveValue(
      'Long Text Question'
    );
    expect(screen.getByPlaceholderText('Long answer')).toBeInTheDocument();
  });

  it('renders multiple choice question correctly', () => {
    const question: Question = {
      id: '1',
      text: 'Multiple Choice Question',
      type: 'multiple_choice',
      answer: JSON.stringify({
        choices: ['Option 1', 'Option 2'],
        selected: '',
      }),
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    expect(screen.getByPlaceholderText('Question')).toHaveValue(
      'Multiple Choice Question'
    );
    expect(screen.getByPlaceholderText('Choice 1')).toHaveValue('Option 1');
    expect(screen.getByPlaceholderText('Choice 2')).toHaveValue('Option 2');
    expect(screen.getByText('Add Choice')).toBeInTheDocument();
  });

  it('handles question text change', () => {
    const question: Question = {
      id: '1',
      text: 'Initial Question',
      type: 'short_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const input = screen.getByPlaceholderText('Question');
    fireEvent.change(input, { target: { value: 'Updated Question' } });

    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      'text',
      'Updated Question'
    );
  });

  it('handles question type change', () => {
    const question: Question = {
      id: '1',
      text: 'Question',
      type: 'short_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'long_text' } });

    expect(mockOnQuestionChange).toHaveBeenCalledWith('type', 'long_text');
  });

  it('handles answer change for short text', () => {
    const question: Question = {
      id: '1',
      text: 'Question',
      type: 'short_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const input = screen.getByPlaceholderText('Short answer');
    fireEvent.change(input, { target: { value: 'Short answer text' } });

    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      'answer',
      'Short answer text'
    );
  });

  it('handles multiple choice option addition', () => {
    const question: Question = {
      id: '1',
      text: 'Multiple Choice Question',
      type: 'multiple_choice',
      answer: JSON.stringify({ choices: ['Option 1'], selected: '' }),
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const addButton = screen.getByText('Add Choice');
    fireEvent.click(addButton);

    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      'answer',
      JSON.stringify({ choices: ['Option 1', ''], selected: '' })
    );
  });

  it('handles multiple choice option removal', () => {
    const question: Question = {
      id: '1',
      text: 'Multiple Choice Question',
      type: 'multiple_choice',
      answer: JSON.stringify({
        choices: ['Option 1', 'Option 2'],
        selected: '',
      }),
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      'answer',
      JSON.stringify({ choices: ['Option 2'], selected: '' })
    );
  });

  it('handles question removal', () => {
    const question: Question = {
      id: '1',
      text: 'Question',
      type: 'short_text',
      answer: '',
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    const removeButton = screen.getByText('Remove Question');
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('renders in read-only mode correctly', () => {
    const question: Question = {
      id: '1',
      text: 'Read-only Question',
      type: 'short_text',
      answer: 'Read-only Answer',
    };

    render(<SortableQuestion question={question} {...baseProps} isReadOnly />);

    expect(screen.getByText('Read-only Question')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Read-only Answer')).toBeDisabled();
    expect(screen.queryByText('Remove Question')).not.toBeInTheDocument();
  });
  it('renders multiple choice question correctly', () => {
    const question: Question = {
      id: '1',
      text: 'Multiple Choice Question',
      type: 'multiple_choice',
      answer: JSON.stringify({
        choices: ['Option 1', 'Option 2'],
        selected: '',
      }),
    };

    render(<SortableQuestion question={question} {...baseProps} />);

    expect(screen.getByPlaceholderText('Question')).toHaveValue(
      'Multiple Choice Question'
    );
    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Add Choice')).toBeInTheDocument();
  });
});
