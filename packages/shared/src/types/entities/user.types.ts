import { UserRole } from '../enums';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}
