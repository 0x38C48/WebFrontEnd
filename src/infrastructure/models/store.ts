export interface UserInfo {
  loggedIn: boolean;
  username: string;
  perName: string;
  token: string;
  id: number;
  role: string;
}
export interface MenuInfo {
  id: number;
  name: string;
  path?: string;
  title: string;
  sList?: MenuInfo[];
  pid?: string | null;
  user_type_ids?: string;
}
export interface SystemConfig {
  menuList: MenuInfo[];
  dataBaseUserName: string;
}
