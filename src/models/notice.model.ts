import mongoose, { Schema } from "mongoose";
import { Batch } from "./batch.model";
import { User } from "./user.model";

export interface Notice {
  title: string;
  description?: string;
  createdAt: Date;
  attachmentUrl: string;
  batch: Batch;
  createdBy: User;
}
const noticeSchema = new Schema<Notice>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    attachmentUrl: {
      type: String,
    },
    batch: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Notice =
  mongoose.models.Notice || mongoose.model<Notice>("Notice", noticeSchema);

export default Notice;
