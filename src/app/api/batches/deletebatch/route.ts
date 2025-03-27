import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import Batch from "@/models/batch.model";
import mongoose from "mongoose";

export async function DELETE(request: NextRequest) {
  try {
    await connectDb();
    const { batchName } = await request.json();
    const batch = await Batch.findOne({ name: batchName });
    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }
    await Batch.findOneAndDelete({ name: batchName });
    return NextResponse.json({ success: true, message: "Batch deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
