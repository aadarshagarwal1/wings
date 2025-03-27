import { NextRequest, NextResponse } from "next/server";
import Notice from "@/models/notice.model";
import Batch from "@/models/batch.model";
import User from "@/models/user.model";
import dbConnect from "@/lib/connectDb";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { title, description, batchId, attachmentUrl, createdBy } = await request.json();
    const user = await User.findById(createdBy);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    if(!title||!description){
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    } 
    const notice = await Notice.create({
      title,
      description,
      batch: batchId,
      createdBy: createdBy,
      attachmentUrl: attachmentUrl||"",
    });
    batch.notices.push(notice._id);
    const updatedBatch = await batch.save();
    if (!updatedBatch||!notice) {
      return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
    }
    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
