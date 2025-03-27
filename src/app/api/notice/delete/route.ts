import { NextRequest, NextResponse } from "next/server";
import Notice from "@/models/notice.model";
import dbConnect from "@/lib/connectDb";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { noticeId } = await request.json();
    const notice = await Notice.findByIdAndDelete(noticeId);
    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }
    return NextResponse.json({ notice: notice }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}