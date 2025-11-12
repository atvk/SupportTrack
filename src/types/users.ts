export interface UserData {
  id: string;
  department:string;
  role: string;
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: string;
}

export interface NewUserData {
  role: string;
  department:string;
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface Role {
  id: string;
  icon: any;
  label: string;
  description: string;
}