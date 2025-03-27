import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Section from "@/models/section.model";
import mongoose from "mongoose";
import Note from "@/models/note.model";

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { noteId } = await req.json();
  const note = new mongoose.Types.ObjectId(noteId);
  const deletedNote = await Note.findByIdAndDelete(note);
  if (!deletedNote) {
    return NextResponse.json({ message: "Notes not found" }, { status: 404 });
  }
  return NextResponse.json(
    { message: "Note deleted successfully" },
    { status: 200 }
  );
}
