import { AuthenticatedUser } from './authenticated-user.model';

export interface AuthSession {
  accessToken: string;
  idToken?: string;
  expiresAt: number;
  refreshToken?: string;
  roles: string[];
  groups?: string[];
  user: AuthenticatedUser;
}
