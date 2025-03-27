import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import User from "@/models/user.model";
import { userRole } from "@/models/user.model";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectDb();
  try {
    const { newRole } = await request.json();

    if (!Object.values(userRole).includes(newRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    user.role = newRole;
    const updatedUser = await user.save();

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user role",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
