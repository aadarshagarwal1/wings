import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";
import { Notice } from "./notice.model";
import { Section } from "./section.model";
import { Request } from "./request.model";
import { Attendance } from "./attendance.model";
enum UserStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export interface Batch {
  name: string;
  users: { user: User; status: UserStatus }[];
  description: string;
  notes: Section[];
  lectures: Section[];
  isArchived: boolean;
  notices: Notice[];
  inviteCode: string;
  requests: Request[];
  attendance: Attendance[] | any[];
}

const batchSchema = new Schema<Batch>({
  name: {
    type: String,
    required: [true, "Batch name required."],
  },
  description: {
    type: String,
  },
  users: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: UserStatus,
      },
    },
  ],
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  lectures: [
    {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  isArchived: {
    type: Boolean,
    default: false,
  },
  notices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Notice",
    },
  ],
  inviteCode: {
    type: String,
    required: [true, "Invite code required."],
  },
  requests: [
    {
      type: Schema.Types.ObjectId,
      ref: "Request",
    },
  ],
  attendance: [
    {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
    },
  ],
});
const Batch =
  mongoose.models.Batch || mongoose.model<Batch>("Batch", batchSchema);
export default Batch;
