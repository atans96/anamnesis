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
import { useParams } from 'react-router-dom';

import SortableQuestion from '../components/SortableQuestion';
import SortableSection from '../components/SortableSection';
import {
  fetchAnamnesisForm,
  updateAnamnesisForm,
} from '../services/anamnesisService';
import type { AnamnesisForm } from '../types/anamnesis';

const AnamnesisFormDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<AnamnesisForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchAnamnesisForm(id)
        .then(setForm)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && form) {
      setForm((prevForm) => {
        if (!prevForm) return null;

        const oldIndex = prevForm.sections.findIndex(
          (section) => section.id === active.id
        );
        const newIndex = prevForm.sections.findIndex(
          (section) => section.id === over.id
        );

        const newForm = {
          ...prevForm,
          sections: arrayMove(prevForm.sections, oldIndex, newIndex),
        };

        // Update the form on the server
        updateAnamnesisForm(newForm);

        return newForm;
      });
    }
  };

  const handleQuestionDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && form) {
      setForm((prevForm) => {
        if (!prevForm) return null;

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

        const newForm = {
          ...prevForm,
          sections: newSections,
        };

        // Update the form on the server
        updateAnamnesisForm(newForm);

        return newForm;
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>No form found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">{form.title}</h1>
      <p className="mb-4">{form.description}</p>
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
            <SortableSection key={section.id} section={section} isReadOnly>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleQuestionDragEnd(section.id, event)}
              >
                <SortableContext
                  items={section.questions.map((question) => question.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {section.questions.map((question) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      isReadOnly
                      onQuestionChange={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default AnamnesisFormDetail;
