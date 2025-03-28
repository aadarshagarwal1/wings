import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/models/attendance.model";
import connectDB from "@/lib/connectDb";
import Batch from "@/models/batch.model";
export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const { attendanceId } = await request.json();
    const deletedAttendance = await Attendance.findByIdAndDelete(attendanceId);
    if (!deletedAttendance) {
      return NextResponse.json({ message: "Attendance not found" }, { status: 404 });
    }
    const batch = await Batch.findById(deletedAttendance.batch);
    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }
    batch.attendance = batch.attendance.filter((attendance: any) => attendance._id.toString() !== attendanceId);
    const updatedBatch = await batch.save();
    return NextResponse.json({ message: "Attendance deleted successfully", deletedAttendance, updatedBatch });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete attendance" }, { status: 500 });
  }
}

