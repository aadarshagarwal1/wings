import mongoose, { Schema } from "mongoose";
import { Batch } from "./batch.model";
export enum userRole {
  admin = "admin",
  student = "student",
  teacher = "teacher",
}
export interface User {
  name: string;
  email: string;
  password: string;
  role: userRole;
  batch: Batch[];
  isVerified: boolean;
  isSuspended: boolean;
  forgotPasswordToken: string;
  forgotPasswordTokenExpiry: Date;
  verifyToken: string;
  verifyTokenExpiry: Date;
}
const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: userRole,
      default: userRole.student,
    },
    batch: [
      {
        type: Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<User>("User", userSchema);

export default User;
