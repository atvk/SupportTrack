export interface UserData {
  id: string; // Строковый ID!
  firstName: string;
  lastName: string;
  email?: string;
  login?: string;
  password?: string;
  role?: string;
  manager?: string;
  department?: string;
  hasFullAccess?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email?: string;
  login?: string;
  password?: string;
  role?: string;
  manager?: string;
  department?: string;
  hasFullAccess?: boolean;
  avatar?: string;
}

