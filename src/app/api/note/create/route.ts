import { NextRequest, NextResponse } from "next/server";
import Note from "@/models/note.model";
import Section from "@/models/section.model";
import connectDB from "@/lib/connectDb";

export async function POST(req: NextRequest) {
  await connectDB();
  const { title, description, url, sectionId } = await req.json();

  if (!title || !url || !sectionId) {
    return NextResponse.json(
      { message: "Title, URL and section ID are required" },
      { status: 400 }
    );
  }

  try {
    // Find the section
    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    // Create the note
    const note = new Note({
      title,
      description,
      url,
      section: sectionId,
    });

    const savedNote = await note.save();

    // Add the note to the section's content array
    if (!section.content) {
      section.content = [];
    }

    section.content.push(savedNote._id);
    await section.save();

    return NextResponse.json(
      {
        message: "Note created successfully",
        data: savedNote,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { message: "Failed to create note", error: error.message },
      { status: 500 }
    );
  }
}
