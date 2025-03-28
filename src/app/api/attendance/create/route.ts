import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/connectDb";
import Attendance from "@/models/attendance.model";
import User from "@/models/user.model";
import Batch from "@/models/batch.model";
export async function POST(request: NextRequest) {
  await dbConnect();

  const { batchId, record, subject, period, createdById } =
    await request.json();

  try {
    const creator = await User.findById(createdById);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    if (record.length === 0 || !subject || !period) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const existingAttendance = await Attendance.findOne({
      batch: batchId,
      subject,
      period,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), $lte: new Date() },
    });
    if (existingAttendance) {
      return NextResponse.json({ error: "Attendance already exists" }, { status: 400 });
    }

    const attendance = await Attendance.create({
      batch: batchId,
      record,
      subject,
      period,
      createdBy: creator._id,
    });
    
    // Initialize attendance array if it doesn't exist
    if (!batch.attendance) {
      batch.attendance = [];
    }
    
    batch.attendance.push(attendance._id);
    const updatedBatch = await batch.save();
    if (!updatedBatch || !attendance) {
      return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Attendance created successfully", attendance, updatedBatch },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Attendance creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
