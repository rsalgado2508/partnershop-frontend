export interface AuthenticatedUser {
  email: string;
  name: string;
  initials: string;
  roles: string[];
  primaryRole: string;
  groups: string[];
}
