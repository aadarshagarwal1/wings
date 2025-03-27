import { NextRequest, NextResponse } from "next/server";
import Section from "@/models/section.model";
import Batch from "@/models/batch.model";
import connectDB from "@/lib/connectDb";
import Note from "@/models/note.model";

export async function POST(req: NextRequest) {
  await connectDB();
  const { title, url, description, sectionId } = await req.json();
  if (!title || !sectionId || !url) {
    return NextResponse.json(
      { message: "Title, Section and URL are required" },
      { status: 400 }
    );
  }
  try {
    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    const note = new Note({
      title,
      url,
      description: description || "",
      section: sectionId,
    });
    const createdNote = await note.save();
    const updateSection = await section?.content?.push(createdNote);
    return NextResponse.json(
      {
        message: "Note created successfully",
        data: createdNote,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create note" },
      { status: 500 }
    );
  }
}
