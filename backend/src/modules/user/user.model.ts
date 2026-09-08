import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@interfaces/roles";

// Tipos para la máquina de estados del usuario
export type UserState = 'offline' | 'online' | 'waiting' | 'playing' | 'spectating';

export interface IUser extends Document{
  username: string;
  email: string;
  password: string; // hashed
  avatarUrl: string;
  state: UserState;
  stats: {
    wins: number;
    losses: number;
  };
  role: UserRole;
  avatar_url: string;
  display_name: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
      required: true,
    },
    avatar_url: { type: String, default: "" },
    display_name: { type: String, default: "" },
    // points: { type: Number, default: 0 },
  },
  { timestamps: true }, // This option automatically adds createdAt and updatedAt fields to the schema
);

export const User = mongoose.model<IUser>("User", userSchema);
