import mongoose, { Schema } from "mongoose";
import { Section } from "./section.model";
export interface Note {
  title: string;
  description?: string;
  url: string;
  section: Section;
}

const noteSchema = new Schema<Note>(
  {
    title: {
      type: String,
      required: [true, "Notes title required."],
    },
    description: {
      type: String,
    },
    url: {
      type: String,
      required: [true, "Notes URL required."],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section required."],
    },
  },
  { timestamps: true }
);

const Note = mongoose.models.Note || mongoose.model<Note>("Note", noteSchema);

export default Note;
