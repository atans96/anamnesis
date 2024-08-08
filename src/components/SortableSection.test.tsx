import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';

import type { Section } from '../types/anamnesis';
import SortableSection from './SortableSection';

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

describe('SortableSection', () => {
  const mockOnTitleChange = jest.fn();
  const mockOnRemove = jest.fn();

  const baseProps = {
    section: {
      id: '1',
      title: 'Test Section',
      questions: [],
    } as Section,
    onTitleChange: mockOnTitleChange,
    onRemove: mockOnRemove,
    children: <div>Test Children</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title correctly', () => {
    render(<SortableSection {...baseProps} />);
    expect(screen.getByDisplayValue('Test Section')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<SortableSection {...baseProps} />);
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('renders remove button when not read-only', () => {
    render(<SortableSection {...baseProps} />);
    expect(screen.getByText('Remove Section')).toBeInTheDocument();
  });

  it('does not render remove button when read-only', () => {
    render(<SortableSection {...baseProps} isReadOnly />);
    expect(screen.queryByText('Remove Section')).not.toBeInTheDocument();
  });

  it('calls onTitleChange when title is edited', () => {
    render(<SortableSection {...baseProps} />);
    const titleInput = screen.getByDisplayValue('Test Section');
    fireEvent.change(titleInput, { target: { value: 'New Section Title' } });
    expect(mockOnTitleChange).toHaveBeenCalledWith('New Section Title');
  });

  it('calls onRemove when remove button is clicked', () => {
    render(<SortableSection {...baseProps} />);
    const removeButton = screen.getByText('Remove Section');
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('renders title as h2 when in read-only mode', () => {
    render(<SortableSection {...baseProps} isReadOnly />);
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test Section').tagName).toBe('H2');
  });

  it('renders title as input when not in read-only mode', () => {
    render(<SortableSection {...baseProps} />);
    const titleInput = screen.getByDisplayValue('Test Section');
    expect(titleInput.tagName).toBe('INPUT');
  });

  it('does not prevent other key propagation', () => {
    render(<SortableSection {...baseProps} />);
    const titleInput = screen.getByDisplayValue('Test Section');
    const mockStopPropagation = jest.fn();
    fireEvent.keyDown(titleInput, {
      key: 'Enter',
      stopPropagation: mockStopPropagation,
    });
    expect(mockStopPropagation).not.toHaveBeenCalled();
  });

  it('applies correct classes', () => {
    render(<SortableSection {...baseProps} />);
    const section = screen.getByText('Test Children').parentElement;
    expect(section).toHaveClass('mb-4', 'rounded', 'border', 'p-2');
  });

  it('applies placeholder to title input', () => {
    render(
      <SortableSection
        {...baseProps}
        section={{ ...baseProps.section, title: '' }}
      />
    );
    expect(
      screen.getByPlaceholderText('Add Your Title Section')
    ).toBeInTheDocument();
  });
});
