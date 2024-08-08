import type { AnamnesisForm } from '../types/anamnesis';

// Mock data
export const mockForms: AnamnesisForm[] = [
  {
    id: '1',
    title: 'General Health Assessment',
    description: 'A comprehensive health assessment form',
    createdAt: '2023-05-01T00:00:00Z',
    sections: [
      {
        id: '1-1',
        title: 'Personal Information',
        questions: [
          {
            id: '1-1-1',
            text: 'Full Name',
            type: 'short_text',
            answer: 'John Doe',
          },
          {
            id: '1-1-2',
            text: 'Date of Birth',
            type: 'date_time',
            answer: '1985-03-15',
          },
        ],
      },
      {
        id: '1-2',
        title: 'Medical History',
        questions: [
          {
            id: '1-2-1',
            text: 'Do you have any chronic diseases?',
            type: 'multiple_choice',
            answer: JSON.stringify({
              choices: ['Yes', 'No'],
              selected: 'Yes',
            }),
          },
          {
            id: '1-2-2',
            text: 'If yes, please specify:',
            type: 'long_text',
            answer:
              'I have been diagnosed with type 2 diabetes and hypertension.',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Dental Examination',
    description: 'Dental health and history assessment',
    createdAt: '2023-05-02T00:00:00Z',
    sections: [
      {
        id: '2-1',
        title: 'Personal Information',
        questions: [
          {
            id: '2-1-1',
            text: 'Full Name',
            type: 'short_text',
            answer: 'Jane Smith',
          },
          {
            id: '2-1-2',
            text: 'Date of Birth',
            type: 'date_time',
            answer: '1990-07-22',
          },
        ],
      },
      {
        id: '2-2',
        title: 'Dental History',
        questions: [
          {
            id: '2-2-1',
            text: 'Last dental visit',
            type: 'date_time',
            answer: '2023-01-10',
          },
          {
            id: '2-2-2',
            text: 'Any current dental pain?',
            type: 'multiple_choice',
            answer: JSON.stringify({
              choices: ['Yes', 'No', 'Sometimes'],
              selected: 'No',
            }),
          },
          {
            id: '2-2-3',
            text: 'How often do you brush your teeth?',
            type: 'multiple_choice',
            answer: JSON.stringify({
              choices: ['Once a day', 'Twice a day', 'After every meal'],
              selected: 'Twice a day',
            }),
          },
        ],
      },
    ],
  },
];

// Helper function to simulate async behavior
const asyncResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 300);
  });
};

// Fetch all anamnesis forms
export const fetchAnamnesisFormList = async (
  searchTerm: string = ''
): Promise<AnamnesisForm[]> => {
  const filteredForms = mockForms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return asyncResponse(filteredForms);
};

// Fetch a single anamnesis form by ID
export const fetchAnamnesisForm = async (
  id: string
): Promise<AnamnesisForm> => {
  const form = mockForms.find((f) => f.id === id);
  if (!form) {
    throw new Error('Form not found');
  }
  return asyncResponse(form);
};

// Create a new anamnesis form
export const createAnamnesisForm = async (
  form: Omit<AnamnesisForm, 'id' | 'createdAt'>
): Promise<AnamnesisForm> => {
  const newForm: AnamnesisForm = {
    ...form,
    id: (mockForms.length + 1).toString(),
    createdAt: new Date().toISOString(),
  };
  mockForms.push(newForm);
  return asyncResponse(newForm);
};

// Update an existing anamnesis form
export const updateAnamnesisForm = async (
  form: AnamnesisForm
): Promise<AnamnesisForm> => {
  const index = mockForms.findIndex((f) => f.id === form.id);
  if (index === -1) {
    throw new Error('Form not found');
  }
  mockForms[index] = form;
  return asyncResponse(form);
};

// Delete an anamnesis form
export const deleteAnamnesisForm = async (id: string): Promise<void> => {
  const index = mockForms.findIndex((f) => f.id === id);
  if (index === -1) {
    throw new Error('Form not found');
  }
  mockForms.splice(index, 1);
  return asyncResponse(undefined);
};

// Simulate an asynchronous search
export const simulateAsyncSearch = async (
  searchTerm: string
): Promise<AnamnesisForm[]> => {
  return fetchAnamnesisFormList(searchTerm);
};
