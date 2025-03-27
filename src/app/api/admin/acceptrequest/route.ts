import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Request from "@/models/request.model";
import Batch from "@/models/batch.model";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  const { requestId } = await req.json();
  await connectDB();
  const request = await Request.findById(requestId);
  if (!request) {
    return NextResponse.json({ message: "Request not found" }, { status: 404 });
  }
  const batch = await Batch.findById(request.batch);
  if (!batch) {
    return NextResponse.json({ message: "Batch not found" }, { status: 404 });
  }
  const user = await User.findById(request.sentBy);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  batch.users.push({ user: user, status: "approved" });
  user.batches.push(batch._id);
  const updatedBatch = await batch.save();
  const updatedUser = await user.save();
  if (!updatedBatch || !updatedUser) {
    return NextResponse.json(
      { message: "Failed to accept request" },
      { status: 500 }
    );
  }
  await Request.findByIdAndDelete(requestId);
  return NextResponse.json(
    {
      message: "Request accepted",
      data: updatedBatch,
    },
    { status: 200 }
  );
}
