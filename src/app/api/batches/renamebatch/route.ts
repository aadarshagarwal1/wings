import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import Batch from "@/models/batch.model";
import mongoose from "mongoose";

export async function PATCH(request: NextRequest) {
  await connectDb();
  const { batchName, newName } = await request.json();
  const batch = await Batch.findOne({ name: batchName });
  if (!batch) {
    return NextResponse.json(
      { success: false, message: "Batch not found" },
      { status: 404 }
    );
  }
  batch.name = newName.toUpperCase().trim();
  const updatedBatch = await batch.save();
  if (!updatedBatch) {
    return NextResponse.json(
      { success: false, message: "Failed to rename batch" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    success: true,
    message: "Batch renamed",
    data: updatedBatch,
  });
}
