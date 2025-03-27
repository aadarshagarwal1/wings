import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import User from "@/models/user.model";

export async function GET(request: NextRequest) {
  await connectDb();
  try {
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

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this page",
        },
        { status: 403 }
      );
    }

    const users = await User.find({});
    if (!users) {
      return NextResponse.json(
        {
          success: false,
          message: "Something went wrong",
        },
        { status: 500 }
      );
    }

    // Separate teachers and students
    const teachers = users.filter((user) => user.role === "teacher");
    const students = users.filter((user) => user.role === "student");

    return NextResponse.json(
      {
        success: true,
        data: {
          teachers,
          students,
        },
      },
      { status: 200 }
    );
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
