import { ILoginRequest, IRegisterRequest } from '../api';

export interface IUseAuthReturn {
  user: IAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: ILoginRequest) => Promise<void>;
  register: (data: IRegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
