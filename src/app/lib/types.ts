export interface ErrorItem {
  id: string;
  text: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  errors: ErrorItem[];
}

export interface Evaluation {
  id?: string;
  date: string;
  week: number;
  contact: string;
  specialist: string;
  supervisor: string;
  topic: string;
  selectedErrors: Record<string, string>; // criterionId -> errorId или 'ok'
  totalScore: number;
  csi?: number;
  inspector: string;
  comment: string;
  createdAt?: string;
}