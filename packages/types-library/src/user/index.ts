import { IRole } from "../role";

export interface IUser {
  auth_type: string;
  email: string;
  id: number;
  name: string;
  username: string;
  role: IRole;
  token: string;
}
