import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import Batch from "@/models/batch.model";
import mongoose from "mongoose";
enum UserStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export async function POST(request: NextRequest) {
  await connectDb();
  const { name, inviteCode, userIdString } = await request.json();
  const userId = new mongoose.Types.ObjectId(userIdString);
  const batchName = name.toUpperCase().trim();
  const existingBatch = await Batch.findOne({ name: batchName });
  if (existingBatch) {
    return NextResponse.json(
      { success: false, message: "Batch already exists" },
      { status: 400 }
    );
  }
  const batch = new Batch({
    name: batchName,
    inviteCode,
    isArchived: false,
    users: [{ user: userId, status: UserStatus.APPROVED }],
    notes: [],
    lectures: [],
    notices: [],
  });
  const savedBatch = await batch.save();
  if (!savedBatch) {
    return NextResponse.json(
      {
        success: false,
        message: "Batch creation failed",
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      success: true,
      message: "Batch created successfully",
      data: savedBatch,
    },
    { status: 201 }
  );
}
