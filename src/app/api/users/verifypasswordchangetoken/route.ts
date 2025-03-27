import connectDb from "@/lib/connectDb";
import User from "@/models/user.model";
import { NextResponse, NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  await connectDb();
  try {
    const reqBody = await request.json();
    const { token } = reqBody;
    console.log(token);
    const user = await User.findOne({
      forgotPasswordToken: token,
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid token",
        },
        { status: 400 }
      );
    }
    console.log(user);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    const savedUser = await user.save();
    if (!savedUser)
      return NextResponse.json(
        { error: "something went wrong" },
        { status: 500 }
      );
    return NextResponse.json(
      {
        message: "Password change token verified successfully.",
        success: true,
        userId: user._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
