import { NextRequest, NextResponse } from "next/server";
import Section from "@/models/section.model";
import Batch from "@/models/batch.model";
import connectDB from "@/lib/connectDb";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, batchId, dataType } = await req.json();
  if (!name || !batchId || !dataType) {
    return NextResponse.json(
      { message: "Name, batchId and dataType are required" },
      { status: 400 }
    );
  }
  try {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    const section = new Section({ name, batch, type: dataType });
    const createdSection = await section.save();
    if (dataType === "notes") {
      batch.notes.push(createdSection._id);
    } else if (dataType === "lectures") {
      batch.lectures.push(createdSection._id);
    }
    const updatedBatch = await batch.save();
    if (!createdSection || !updatedBatch) {
      return NextResponse.json(
        { message: "Failed to create section" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "Section created successfully",
        data: createdSection,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create section" },
      { status: 500 }
    );
  }
}
