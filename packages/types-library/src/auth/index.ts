import { IUser } from "../user";
import { IRole } from "../role";

export interface AuthState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

export interface AuthContextType {
  token: string | null;
  role: string | null;
  permissions: string[];
  login: (token: string, role: IRole, perms: string[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
