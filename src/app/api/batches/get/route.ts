import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import Batch from "@/models/batch.model";
import User from "@/models/user.model";

export async function GET(request: NextRequest) {
  await connectDb();
  const searchParams = request.nextUrl.searchParams;
  const userIdString = searchParams.get("userIdString");

  if (!userIdString) {
    return NextResponse.json(
      {
        success: false,
        message: "User ID is required",
      },
      { status: 400 }
    );
  }

  const user = await User.findById(userIdString);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 }
    );
  }

  const batches = await Batch.find({
    "users.user": user._id,
  }).populate("users.user", "name email");

  // Separate active and archived batches
  const activeBatches = batches.filter((batch) => !batch.isArchived);
  const archivedBatches = batches.filter((batch) => batch.isArchived);

  return NextResponse.json(
    {
      success: true,
      data: {
        active: activeBatches,
        archived: archivedBatches,
      },
    },
    { status: 200 }
  );
}
