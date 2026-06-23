import mongoose, { Schema, Document, Types } from "mongoose";
import { GameName } from "@interfaces/games";

// TODO: check if match_id, winner_id are actually needed. Discuss with Terto. For now, they are not included
export interface IGame extends Document {
  name: GameName;
  top_1_user: Types.ObjectId | null;
  top_1_score: number;
  top_2_user: Types.ObjectId | null;
  top_2_score: number;
  top_3_user: Types.ObjectId | null;
  top_3_score: number;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema: Schema<IGame> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    top_1_user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    top_1_score: { type: Number, default: 0 },
    top_2_user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    top_2_score: { type: Number, default: 0 },
    top_3_user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    top_3_score: { type: Number, default: 0 },
  },
  { timestamps: true }, // This option automatically adds createdAt and updatedAt fields to the schema
);

export const Game = mongoose.model<IGame>("Game", gameSchema);
