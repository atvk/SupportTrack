// User types
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  department?: string;
  companyId?: number | null;
  manager?: string;
  avatar?: string;
  hasFullAccess?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  department?: string;
  companyId?: number | null;
  manager?: string;
  avatar?: string;
  hasFullAccess?: boolean;
}

// Evaluation types
export interface SelectedErrors {
  literacy?: string[];
  needsIdentification?: string[];
  risks?: string[];
  timing?: string[];
  programWork?: string[];
  correctness?: string[];
  clarity?: string[];
}

export interface EvaluationData {
  id: string;
  date: string;
  week: number;
  contact?: string;
  specialistId: string;
  supervisorId?: string;
  topic?: string;
  selectedErrors: SelectedErrors;
  csi: number;
  inspectorId: string;
  comment?: string;
  totalScore: number;
  createdAt?: string;
  
  // populated fields
  specialist?: UserData;
  inspector?: UserData;
  supervisor?: UserData;
}

export interface EvaluationInput {
  date: string;
  week: number;
  contact?: string;
  specialistId: string;
  supervisorId?: string;
  topic?: string;
  selectedErrors: SelectedErrors;
  csi: number;
  inspectorId: string;
  comment?: string;
  totalScore: number;
}