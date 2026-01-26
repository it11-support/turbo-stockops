export interface IPermission {
  id: number;
  name: string;
  description: string;
}
export interface IRole {
  role: "superadmin" | "admin" | "picker" | null;
  permissions: IPermission[];
}
