import type { AnamnesisForm } from '../types/anamnesis';
import {
  createAnamnesisForm,
  deleteAnamnesisForm,
  fetchAnamnesisForm,
  fetchAnamnesisFormList,
  simulateAsyncSearch,
  updateAnamnesisForm,
} from './anamnesisService';

describe('anamnesisService', () => {
  const newForm: Omit<AnamnesisForm, 'id' | 'createdAt'> = {
    title: 'New Form',
    description: 'A new test form',
    sections: [
      {
        id: 'new-1',
        title: 'New Section',
        questions: [
          {
            id: 'new-1-1',
            text: 'New Question',
            type: 'short_text',
            answer: '',
          },
        ],
      },
    ],
  };

  it('fetches all anamnesis forms', async () => {
    const forms = await fetchAnamnesisFormList();
    expect(forms).toHaveLength(2);
    expect(forms[0].title).toBe('General Health Assessment');
    expect(forms[1].title).toBe('Dental Examination');
  });

  it('fetches filtered anamnesis forms', async () => {
    const forms = await fetchAnamnesisFormList('dental');
    expect(forms).toHaveLength(1);
    expect(forms[0].title).toBe('Dental Examination');
  });

  it('fetches a single anamnesis form by ID', async () => {
    const form = await fetchAnamnesisForm('1');
    expect(form.title).toBe('General Health Assessment');
  });

  it('throws an error when fetching a non-existent form', async () => {
    await expect(fetchAnamnesisForm('999')).rejects.toThrow('Form not found');
  });

  it('creates a new anamnesis form', async () => {
    const createdForm = await createAnamnesisForm(newForm);
    expect(createdForm.id).toBe('3');
    expect(createdForm.title).toBe('New Form');
    expect(createdForm.createdAt).toBeDefined();
  });

  it('updates an existing anamnesis form', async () => {
    const formToUpdate = await fetchAnamnesisForm('1');
    formToUpdate.title = 'Updated Health Assessment';
    const updatedForm = await updateAnamnesisForm(formToUpdate);
    expect(updatedForm.title).toBe('Updated Health Assessment');
  });

  it('throws an error when updating a non-existent form', async () => {
    const nonExistentForm: AnamnesisForm = {
      id: '999',
      title: 'Non-existent Form',
      description: 'This form does not exist',
      createdAt: '2023-05-03T00:00:00Z',
      sections: [],
    };
    await expect(updateAnamnesisForm(nonExistentForm)).rejects.toThrow(
      'Form not found'
    );
  });

  it('deletes an anamnesis form', async () => {
    await deleteAnamnesisForm('2');
    const forms = await fetchAnamnesisFormList();
    expect(forms).toHaveLength(2); // 2 because we created one in the 'creates a new anamnesis form' test
    expect(forms.find((f) => f.id === '2')).toBeUndefined();
  });

  it('throws an error when deleting a non-existent form', async () => {
    await expect(deleteAnamnesisForm('999')).rejects.toThrow('Form not found');
  });

  it('simulates an asynchronous search', async () => {
    const results = await simulateAsyncSearch('health');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Updated Health Assessment');
  });
});
