import { NextRequest, NextResponse } from "next/server";
import Notice from "@/models/notice.model";
import dbConnect from "@/lib/connectDb";
import Batch from "@/models/batch.model";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { noticeId } = await request.json();
    const notice = await Notice.findByIdAndDelete(noticeId);
    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }
    const batch = await Batch.findById(notice.batch);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    batch.notices = batch.notices.filter((notice: any) => notice._id.toString() !== noticeId);
    const updatedBatch = await batch.save();
    if(!updatedBatch){
      return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
    }
    return NextResponse.json({ notice: notice, updatedBatch: updatedBatch }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}