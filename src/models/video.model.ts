import mongoose, { Schema } from "mongoose";
import { Section } from "./section.model";
export interface Video {
  title: string;
  description?: string;
  url: string;
  section: Section;
  coverImageUrl?: string;
}

const videoSchema = new Schema<Video>(
  {
    title: {
      type: String,
      required: [true, "Video title required."],
    },
    description: {
      type: String,
    },
    url: {
      type: String,
      required: [true, "Video URL required."],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section required."],
    },
    coverImageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Video =
  mongoose.models.Video || mongoose.model<Video>("Video", videoSchema);

export default Video;
