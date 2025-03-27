import { NextResponse } from "next/server";
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });
    response.cookies.delete("token");
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}
