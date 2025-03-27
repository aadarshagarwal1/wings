import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import User from "@/models/user.model";

export async function POST(request: NextRequest) {
  await connectDb();
  try {
    const { userId } = await request.json();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    console.log("user:", user);

    console.log("status:", user.isSuspended);
    const updatedUser = await user.save();
    console.log("new status:", updatedUser.isSuspended);
    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user status",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account suspended",
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
