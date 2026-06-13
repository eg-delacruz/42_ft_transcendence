import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@interfaces/roles";

// Define the User interface extending mongoose Document
export interface IUser extends Document {
  email: string;
  password: string; // hashed
  role: UserRole;
  avatar_url: string;
  display_name: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      required: true,
    },
    avatar_url: { type: String, default: "" },
    display_name: { type: String, default: "" },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }, // This option automatically adds createdAt and updatedAt fields to the schema
);

export const User = mongoose.model<IUser>("User", userSchema);
