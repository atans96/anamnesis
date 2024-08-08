import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createAnamnesisForm } from '../services/anamnesisService';
import type { AnamnesisForm, Question, Section } from '../types/anamnesis';
import SortableQuestion from './SortableQuestion';
import SortableSection from './SortableSection';

const formatDateForSubmission = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // This will format the date as 'YYYY-MM-DD'
};

const CreateAnamnesisForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<AnamnesisForm, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    sections: [],
  });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: ``,
      questions: [],
    };
    setForm((prevForm) => ({
      ...prevForm,
      sections: [...prevForm.sections, newSection],
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      ),
    }));
  };

  const handleAddQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: ``,
      type: 'short_text',
      answer: '',
    };
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.map((section) =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      ),
    }));
  };

  const handleRemoveQuestion = (sectionId: string, questionId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            }
          : section
      ),
    }));
  };

  const handleQuestionChange = (
    sectionId: string,
    questionId: string,
    field: keyof Question,
    value: string
  ) => {
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? { ...question, [field]: value }
                  : question
              ),
            }
          : section
      ),
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setForm((prevForm) => {
        const oldIndex = prevForm.sections.findIndex(
          (section) => section.id === active.id
        );
        const newIndex = prevForm.sections.findIndex(
          (section) => section.id === over.id
        );

        return {
          ...prevForm,
          sections: arrayMove(prevForm.sections, oldIndex, newIndex),
        };
      });
    }
  };

  const handleQuestionDragEnd = (sectionId: string, event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setForm((prevForm) => {
        const sectionIndex = prevForm.sections.findIndex(
          (section) => section.id === sectionId
        );
        const oldIndex = prevForm.sections[sectionIndex].questions.findIndex(
          (question) => question.id === active.id
        );
        const newIndex = prevForm.sections[sectionIndex].questions.findIndex(
          (question) => question.id === over.id
        );

        const newSections = [...prevForm.sections];
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          questions: arrayMove(
            newSections[sectionIndex].questions,
            oldIndex,
            newIndex
          ),
        };

        return {
          ...prevForm,
          sections: newSections,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error states
    setTitleError(null);
    setDescriptionError(null);

    // Check if title or description is empty
    if (!form.title.trim()) {
      setTitleError('Title is required');
      return;
    }

    if (!form.description.trim()) {
      setDescriptionError('Description is required');
      return;
    }

    try {
      const formattedForm = {
        ...form,
        sections: form.sections.map((section) => ({
          ...section,
          questions: section.questions.map((question) => {
            if (question.type === 'date_time') {
              return {
                ...question,
                answer: formatDateForSubmission(question.answer),
              };
            }
            return question;
          }),
        })),
      };
      await createAnamnesisForm(formattedForm);
      navigate(`/`);
    } catch (error) {
      console.error('Error creating form:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Create Anamnesis Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block">
            Title
            <input
              type="text"
              id="title"
              name="title"
              onKeyDown={handleKeyDown}
              value={form.title}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
            />
          </label>
          {titleError && <p className="text-red-500">{titleError}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block">
            Description
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full rounded border p-2"
              rows={3}
            />
          </label>
          {descriptionError && (
            <p className="text-red-500">{descriptionError}</p>
          )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={form.sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {form.sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onRemove={() => handleRemoveSection(section.id)}
                onTitleChange={(newTitle) =>
                  handleSectionTitleChange(section.id, newTitle)
                }
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) =>
                    handleQuestionDragEnd(section.id, event)
                  }
                >
                  <SortableContext
                    items={section.questions.map((question) => question.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.questions.map((question) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        isReadOnly={false}
                        onQuestionChange={(field, value) =>
                          handleQuestionChange(
                            section.id,
                            question.id,
                            field,
                            value
                          )
                        }
                        onRemove={() =>
                          handleRemoveQuestion(section.id, question.id)
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <button
                  type="button"
                  onClick={() => handleAddQuestion(section.id)}
                  className="mt-2 rounded bg-blue-500 p-2 text-white"
                >
                  Add Question
                </button>
              </SortableSection>
            ))}
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={handleAddSection}
          className="mt-4 rounded bg-green-500 p-2 text-white"
        >
          Add Section
        </button>
        <button
          type="submit"
          className="ml-2 mt-4 rounded bg-blue-500 p-2 text-white"
        >
          Create Form
        </button>
      </form>
    </div>
  );
};

export default CreateAnamnesisForm;
