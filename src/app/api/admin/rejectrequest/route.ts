import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Request from "@/models/request.model";
export async function DELETE(req: NextRequest) {
  const { requestId } = await req.json();
  await connectDB();
  const request = await Request.findById(requestId);
  if (!request) {
    return NextResponse.json({ message: "Request not found" }, { status: 404 });
  }
  await Request.findByIdAndDelete(requestId);
  return NextResponse.json(
    {
      message: "Request rejected",
    },
    { status: 200 }
  );
}
