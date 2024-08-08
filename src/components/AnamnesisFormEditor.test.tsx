import '@testing-library/jest-dom';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as router from 'react-router-dom';

import * as anamnesisService from '../services/anamnesisService';
import AnamnesisFormEditor from './AnamnesisFormEditor';

jest.mock('../services/anamnesisService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockForm = {
  id: '1',
  title: 'Test Form',
  description: 'Test Description',
  createdAt: '2023-01-01',
  sections: [
    {
      id: 's1',
      title: 'Section 1',
      questions: [
        { id: 'q1', text: 'Question 1', type: 'short_text', answer: '' },
      ],
    },
  ],
};

describe('AnamnesisFormEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (anamnesisService.fetchAnamnesisForm as jest.Mock).mockResolvedValue(
      mockForm
    );
    (anamnesisService.updateAnamnesisForm as jest.Mock).mockResolvedValue(
      mockForm
    );
  });

  it('renders the component and loads form data', async () => {
    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    expect(screen.getByText('Edit Anamnesis Form')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Test Form');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Test Description'
    );
    // Check for the presence of a question input instead of the section title
    expect(screen.getByDisplayValue('Question 1')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Title' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Updated Description' },
    });

    expect(screen.getByLabelText('Title')).toHaveValue('Updated Title');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Updated Description'
    );
  });

  it('adds a new section', async () => {
    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    const initialSectionCount = screen.getAllByText('Remove Section').length;
    fireEvent.click(screen.getByText('Add Section'));

    expect(screen.getAllByText('Remove Section')).toHaveLength(
      initialSectionCount + 1
    );
  });

  it('adds a new question', async () => {
    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    const initialQuestionCount = screen.getAllByText('Remove Question').length;
    fireEvent.click(screen.getByText('Add Question'));

    expect(screen.getAllByText('Remove Question')).toHaveLength(
      initialQuestionCount + 1
    );
  });

  it('removes a question', async () => {
    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    fireEvent.click(screen.getByText('Remove Question'));

    expect(screen.queryByDisplayValue('Question 1')).not.toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const navigateMock = jest.fn();
    (router.useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    fireEvent.click(screen.getByText('Update Form'));

    await waitFor(() => {
      expect(anamnesisService.updateAnamnesisForm).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('handles form submission error', async () => {
    (anamnesisService.updateAnamnesisForm as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    );

    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    fireEvent.click(screen.getByText('Update Form'));

    await waitFor(() => {
      expect(screen.getByText('Error: Update failed')).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    (anamnesisService.fetchAnamnesisForm as jest.Mock).mockRejectedValue(
      new Error('Fetch failed')
    );

    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Fetch failed')).toBeInTheDocument();
    });
  });
});
