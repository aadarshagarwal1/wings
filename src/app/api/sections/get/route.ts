import { NextRequest, NextResponse } from "next/server";
import Section from "@/models/section.model";
import connectDB from "@/lib/connectDb";

export async function GET(req: NextRequest) {
  await connectDB();
  const { batchId, dataType } = await req.json();
  const sections = await Section.find({ batch: batchId });
  if (!sections) {
    return NextResponse.json(
      { message: "Sections not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(
    { message: "Sections found", data: sections },
    { status: 200 }
  );
}
