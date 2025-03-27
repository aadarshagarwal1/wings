import mongoose, { Schema } from "mongoose";
import { Batch } from "./batch.model";
import { Video } from "./video.model";
import { Note } from "./note.model";

export interface Section {
  name: string;
  content: (Video | Note)[];
  batch: Batch;
  type: "notes" | "lectures";
}

const sectionSchema = new Schema<Section>({
  name: {
    type: String,
    required: [true, "Section name required."],
  },
  content: [
    {
      type: Schema.Types.Mixed,
    },
  ],
  batch: {
    type: Schema.Types.ObjectId,
    ref: "Batch",
    required: [true, "Batch required."],
  },
  type: {
    type: String,
    required: [true, "Data type required."],
  },
});

const Section =
  mongoose.models.Section || mongoose.model<Section>("Section", sectionSchema);
export default Section;
