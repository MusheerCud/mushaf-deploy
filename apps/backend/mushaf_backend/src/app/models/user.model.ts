import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Permission list ────────────────────────────────────────────────────────────
// Granular permissions that can be assigned to any user regardless of role.
export type Permission = 'view' | 'upload' | 'delete' | 'manage_users';

// ── Role ──────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'user';

// ── Default permissions per role ──────────────────────────────────────────────
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['view', 'upload', 'delete', 'manage_users'],
  user: ['view'],
};

// ── Document interface ────────────────────────────────────────────────────────
export interface IUser extends Document {
  email: string;
  name: string;
  mobileNumber: string;
  password: string;          // bcrypt hash — never expose in API responses
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // Never select password by default in queries
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    permissions: {
      type: [String],
      enum: ['view', 'upload', 'delete', 'manage_users'],
      default: DEFAULT_PERMISSIONS['user'],
    },
  },
  { timestamps: true }
);

// Fast lookup by email
UserSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
