import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as router from 'react-router-dom';

import {
  deleteAnamnesisForm,
  fetchAnamnesisFormList,
} from '../services/anamnesisService';
import AnamnesisFormList from './AnamnesisFormList';

jest.mock('../services/anamnesisService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockForms = [
  {
    id: '1',
    title: 'Form 1',
    description: 'Description 1',
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    title: 'Form 2',
    description: 'Description 2',
    createdAt: '2023-01-02',
  },
];

describe('AnamnesisFormList', () => {
  beforeEach(() => {
    (fetchAnamnesisFormList as jest.Mock).mockResolvedValue(mockForms);
  });

  it('renders the component and fetches forms', async () => {
    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    expect(screen.getByText('Anamnesis Forms')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search forms...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('allows searching for forms', async () => {
    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search forms...');
    fireEvent.change(searchInput, { target: { value: 'Form 1' } });

    await waitFor(() => {
      expect(fetchAnamnesisFormList).toHaveBeenCalledWith('Form 1');
    });
  });

  it('shows delete confirmation modal', async () => {
    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this form?')
    ).toBeInTheDocument();
  });

  it('deletes a form when confirmed', async () => {
    (deleteAnamnesisForm as jest.Mock).mockResolvedValue({});

    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByText('Delete', {
      selector: 'button.bg-red-500',
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteAnamnesisForm).toHaveBeenCalledWith('1');
    });
  });

  it('cancels form deletion', async () => {
    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('navigates to create form page', () => {
    const navigateMock = jest.fn();
    (router.useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    const addButton = screen.getByText('Add New Form');
    fireEvent.click(addButton);

    expect(navigateMock).toHaveBeenCalledWith('/form/create');
  });

  it('navigates to view form page', async () => {
    const navigateMock = jest.fn();
    (router.useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(navigateMock).toHaveBeenCalledWith('/form/1');
  });

  it('navigates to edit form page', async () => {
    const navigateMock = jest.fn();
    (router.useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(navigateMock).toHaveBeenCalledWith('/form/edit/1');
  });

  it('handles pagination', async () => {
    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('>');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Form 2')).toBeInTheDocument();
    });

    const prevPageButton = screen.getByText('<');
    fireEvent.click(prevPageButton);

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });
  });
  it('displays correct search results in the table', async () => {
    const searchResults = [
      {
        id: '1',
        title: 'Form 1',
        description: 'Description 1',
        createdAt: '2023-01-01',
      },
    ];

    (fetchAnamnesisFormList as jest.Mock).mockImplementation((searchTerm) => {
      if (searchTerm === 'Form 1') {
        return Promise.resolve(searchResults);
      }
      return Promise.resolve(mockForms);
    });

    render(
      <MemoryRouter>
        <AnamnesisFormList />
      </MemoryRouter>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search forms...');
    fireEvent.change(searchInput, { target: { value: 'Form 1' } });

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
      expect(screen.queryByText('Form 2')).not.toBeInTheDocument();
    });

    // Clear the search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('Form 1')).toBeInTheDocument();
      // Form 2 might not be visible due to pagination, so we'll check the results count instead
      expect(screen.getByText('Showing 1 of 2 results')).toBeInTheDocument();
    });

    // Navigate to next page
    const nextPageButton = screen.getByText('>');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Form 2')).toBeInTheDocument();
      expect(screen.queryByText('Form 1')).not.toBeInTheDocument();
    });
  });
});
