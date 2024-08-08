import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router-dom';
import AnamnesisFormDetail from './AnamnesisFormDetail';
import { fetchAnamnesisForm, updateAnamnesisForm } from '../services/anamnesisService';

jest.mock('../services/anamnesisService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const mockForm = {
  id: '1',
  title: 'Test Form',
  description: 'Test Description',
  sections: [
    {
      id: 's1',
      title: 'Section 1',
      questions: [
        { id: 'q1', text: 'Question 1', type: 'short_text', answer: '' },
        { id: 'q2', text: 'Question 2', type: 'long_text', answer: '' },
        { id: 'q3', text: 'Question 3', type: 'multiple_choice', options: ['Option 1', 'Option 2'], answer: '' },
        { id: 'q4', text: 'Question 4', type: 'date_time', answer: '' },
      ],
    },
  ],
};

describe('AnamnesisFormDetail', () => {
  
  beforeEach(() => {
    (fetchAnamnesisForm as jest.Mock).mockClear();
    (updateAnamnesisForm as jest.Mock).mockClear();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  it('renders the form details correctly', async () => {
    (fetchAnamnesisForm as jest.Mock).mockResolvedValue(mockForm);

    render(<AnamnesisFormDetail />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (fetchAnamnesisForm as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<AnamnesisFormDetail />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (fetchAnamnesisForm as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(<AnamnesisFormDetail />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('shows no form found when form is null', async () => {
    (fetchAnamnesisForm as jest.Mock).mockResolvedValue(null);

    render(<AnamnesisFormDetail />);

    await waitFor(() => {
      expect(screen.getByText('No form found')).toBeInTheDocument();
    });
  });
});