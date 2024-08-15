export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'date_time';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answer: string;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface AnamnesisForm {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  sections: Section[];
}
export interface FilterProps {
  globalFilter: string;
  setGlobalFilter: any;
}
