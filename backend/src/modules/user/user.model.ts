import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@interfaces/roles';

// Tipos para la máquina de estados del usuario
export type UserState = 'offline' | 'online' | 'waiting' | 'playing' | 'spectating';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // hashed
  avatarUrl: string;
  points: number;
  state: UserState;
  stats: {
    wins: number;
    losses: number;
  };
  role: UserRole;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    avatarUrl: { 
      type: String, 
      default: '/uploads/default-avatar.png' 
    },
    points: { 
      type: Number, 
      default: 100, 
      min: [0, 'Los puntos no pueden ser negativos'] // Requerimiento: No números rojos
    },
    state: {
      type: String,
      enum: ['offline', 'online', 'waiting', 'playing', 'spectating'],
      default: 'offline',
    },
    stats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: ['super_user', 'standard_user', 'service_desk_user'],
      default: 'standard_user',
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);