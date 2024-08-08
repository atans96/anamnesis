import type { DragEndEvent } from '@dnd-kit/core';
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
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  fetchAnamnesisForm,
  updateAnamnesisForm,
} from '../services/anamnesisService';
import type { AnamnesisForm, Question, Section } from '../types/anamnesis';
import SortableQuestion from './SortableQuestion';
import SortableSection from './SortableSection';

const AnamnesisFormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<AnamnesisForm>({
    id: '',
    title: '',
    description: '',
    createdAt: '',
    sections: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    // Set a distance of 10 pixels on mouse before activating
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Set a distance of 10 pixels on touch before activating
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(
    mouseSensor,
    touchSensor,
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchAnamnesisForm(id)
        .then(setForm)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
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

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      sections: prevForm.sections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      ),
    }));
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: '',
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

  const handleAddQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
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

  const handleQuestionDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
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
    setIsLoading(true);
    setError(null);
    try {
      await updateAnamnesisForm(form);
      navigate(`/`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Edit Anamnesis Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title-input" className="mb-2 block">
            Title
            <input
              type="text"
              id="title-input"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              required
            />
          </label>
        </div>
        <div className="mb-4">
          <label htmlFor="description-input" className="mb-2 block">
            Description
            <textarea
              id="description-input"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              rows={3}
            />
          </label>
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
                onTitleChange={(newTitle) =>
                  handleSectionTitleChange(section.id, newTitle)
                }
                onRemove={() => handleRemoveSection(section.id)}
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
                        isReadOnly={false}
                        question={question}
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
                  className="mt-2 rounded bg-blue-500 p-1 text-sm text-white"
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
          className="mr-2 mt-4 rounded bg-green-500 p-2 text-white"
        >
          Add Section
        </button>
        <button
          type="submit"
          className="mt-4 rounded bg-blue-500 p-2 text-white"
          disabled={isLoading}
        >
          Update Form
        </button>
      </form>
    </div>
  );
};

export default AnamnesisFormEditor;
