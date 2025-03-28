import mongoose from "mongoose";
import { Schema } from "mongoose";
import { Batch } from "./batch.model";
import { User } from "./user.model";
export enum AttendanceStatus {
  present = "present",
  absent = "absent",
}
export interface Attendance {
  createdAt: Date;
  batch: Batch;
  record: [
    {
      student: User;
      status: AttendanceStatus;
    }
  ];
  subject: string;
  period: number;
  createdBy: User;
}

const attendanceSchema = new Schema<Attendance>({
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  record: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: AttendanceStatus,
        required: true,
      },
    },
  ],
  subject: {
    type: String,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Attendance =
  (mongoose.models && mongoose.models.Attendance) || // Check if models exist first
  mongoose.model<Attendance>("Attendance", attendanceSchema);

export default Attendance;
