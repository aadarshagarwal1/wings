import { NextRequest, NextResponse } from "next/server";
import Section from "@/models/section.model";
import connectDB from "@/lib/connectDb";

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { sectionId } = await req.json();

  const deletedSection = await Section.findByIdAndDelete(sectionId);
  if (!deletedSection) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 });
  }
  return NextResponse.json(
    { message: "Section deleted successfully" },
    { status: 200 }
  );
}
