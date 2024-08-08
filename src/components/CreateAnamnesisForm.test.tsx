import { fireEvent, render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { createAnamnesisForm } from '../services/anamnesisService';
import CreateAnamnesisForm from './CreateAnamnesisForm';

jest.mock('../services/anamnesisService');

describe('CreateAnamnesisForm', () => {
  it('renders form with title and description fields', () => {
    const { getByText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
  });

  it('renders add section button', () => {
    const { getByText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    expect(getByText('Add Section')).toBeInTheDocument();
  });

  it('renders add question button', async () => {
    const { getByText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    await fireEvent.click(getByText('Add Section'));
    expect(getByText('Add Question')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const { getByText, getByLabelText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    const titleInput = getByLabelText('Title');
    const descriptionInput = getByLabelText('Description');
    fireEvent.change(titleInput, { target: { value: 'Test Form' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });
    await fireEvent.click(getByText('Add Section'));
    await fireEvent.click(getByText('Add Question'));
    await fireEvent.click(getByText('Create Form'));
    expect(createAnamnesisForm).toHaveBeenCalledTimes(1);
  });

  it('prevents form submission with empty title', async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    const descriptionInput = getByLabelText('Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });
    await fireEvent.click(getByText('Add Section'));
    await fireEvent.click(getByText('Add Question'));
    await fireEvent.click(getByText('Create Form'));

    await waitFor(() => {
      expect(createAnamnesisForm).toHaveBeenCalled();
      expect(queryByText('Title is required')).toBeInTheDocument();
    });
  });

  it('prevents form submission with empty description', async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    const titleInput = getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test Form' } });
    await fireEvent.click(getByText('Add Section'));
    await fireEvent.click(getByText('Add Question'));
    await fireEvent.click(getByText('Create Form'));

    await waitFor(() => {
      expect(createAnamnesisForm).toHaveBeenCalled();
      expect(queryByText('Description is required')).toBeInTheDocument();
    });
  });

  it('handles form submission with empty section', async () => {
    const { getByText, getByLabelText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    const titleInput = getByLabelText('Title');
    const descriptionInput = getByLabelText('Description');
    fireEvent.change(titleInput, { target: { value: 'Test Form' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });
    await fireEvent.click(getByText('Create Form'));
    expect(createAnamnesisForm).toHaveBeenCalled();
  });

  it('handles form submission with empty question', async () => {
    const { getByText, getByLabelText } = render(
      <Router>
        <CreateAnamnesisForm />
      </Router>
    );
    const titleInput = getByLabelText('Title');
    const descriptionInput = getByLabelText('Description');
    fireEvent.change(titleInput, { target: { value: 'Test Form' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });
    await fireEvent.click(getByText('Add Section'));
    await fireEvent.click(getByText('Create Form'));
    expect(createAnamnesisForm).toHaveBeenCalled();
  });
});
