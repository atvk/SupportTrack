export type UserRole = "specialist" | "manager" | "employee";

export interface User {
  id: string;
  email: string;
  password: string; 
  role: UserRole;
  name?: string;
}