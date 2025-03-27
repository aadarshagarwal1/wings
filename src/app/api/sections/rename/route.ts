import { NextRequest, NextResponse } from "next/server";
import Section from "@/models/section.model";
import connectDB from "@/lib/connectDb";

export async function PATCH(req: NextRequest) {
  await connectDB();
  const { sectionId, newName } = await req.json();
  const section = await Section.findById(sectionId);
  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 });
  }
  section.name = newName;
  const updatedSection = await section.save();
  if (!updatedSection) {
    return NextResponse.json(
      { message: "Failed to rename section" },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "Section renamed successfully", data: updatedSection },
    { status: 200 }
  );
}
