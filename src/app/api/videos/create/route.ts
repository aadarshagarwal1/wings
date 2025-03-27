import { NextRequest, NextResponse } from "next/server";
import Video from "@/models/video.model";
import connectDb from "@/lib/connectDb";
import Section from "@/models/section.model";
export async function POST(req: NextRequest) {
  await connectDb();
  const { title, description, url, sectionId } = await req.json();
  if (!title || !url || !sectionId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const section = await Section.findById(sectionId);
  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 });
  }
  const createdVideo = await Video.create({
    title,
    description,
    url,
    section: sectionId,
  });
  section.content.push(createdVideo);
  const updatedSection = await section.save();
  if (!updatedSection || !createdVideo) {
    return NextResponse.json(
      { message: "Failed to update section" },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "Video created", data: createdVideo },
    { status: 201 }
  );
}
