import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import Batch from "@/models/batch.model";

export async function PATCH(request: NextRequest) {
  await connectDb();
  const response = await request.json();
  const { batchName } = response.data;
  const batch = await Batch.findOne({ name: batchName });
  if (!batch) {
    return NextResponse.json(
      { success: false, message: "Batch not found" },
      { status: 404 }
    );
  }
  batch.isArchived = false;
  const updatedBatch = await batch.save();
  if (!updatedBatch) {
    return NextResponse.json(
      { success: false, message: "Failed to unarchive batch" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    success: true,
    message: "Batch unarchived",
    data: updatedBatch,
  });
}
