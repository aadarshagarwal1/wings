import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Video from "@/models/video.model";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { videoId } = await req.json();
  const video = new mongoose.Types.ObjectId(videoId);
  const deletedVideo = await Video.findByIdAndDelete(video);
  if (!deletedVideo) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Video deleted" }, { status: 200 });
}
