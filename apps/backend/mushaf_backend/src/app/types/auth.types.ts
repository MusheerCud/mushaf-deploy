import { Permission, UserRole } from '../models/user.model';

// JWT payload — embedded in every signed token
export interface TokenPayload {
  sub: string;        // MongoDB user _id
  email: string;
  role: UserRole;
  permissions: Permission[];
}

// POST /auth/register body
export interface RegisterBody {
  email: string;
  name: string;
  mobileNumber: string;
  password: string;
}

// POST /auth/login body
export interface LoginBody {
  email: string;
  password: string;
}
