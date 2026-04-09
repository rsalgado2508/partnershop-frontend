export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
  requiredRoles?: string[];
}
