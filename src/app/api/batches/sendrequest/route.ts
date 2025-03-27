import { NextRequest, NextResponse } from "next/server";
import Request from "@/models/request.model";
import connectDB from "@/lib/connectDb";
import Batch from "@/models/batch.model";
import mongoose from "mongoose";
export async function POST(req: NextRequest) {
  await connectDB();
  const { inviteCode, userIdString } = await req.json();
  const batch = await Batch.findOne({ inviteCode });
  if (!batch) {
    return NextResponse.json({ message: "Batch not found" }, { status: 404 });
  }
  const userId = new mongoose.Types.ObjectId(userIdString);
  const request = await Request.create({
    sentBy: userId,
    batch: batch._id,
  });
  batch.requests.push(request._id);
  const updatedBatch = await batch.save();
  if (!updatedBatch) {
    return NextResponse.json({ message: "Request not sent" }, { status: 400 });
  }
  if (!request) {
    return NextResponse.json({ message: "Request not sent" }, { status: 400 });
  }
  return NextResponse.json({ message: "Request sent" }, { status: 200 });
}
