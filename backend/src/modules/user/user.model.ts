import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@interfaces/roles';

// Define the User interface extending mongoose Document
export interface IUser extends Document {
  email: string;
  password: string; // hashed
  role: UserRole;
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_user', 'standard_user', 'service_desk_user'],
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
