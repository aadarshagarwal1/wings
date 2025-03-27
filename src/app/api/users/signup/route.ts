import connectDb from "@/lib/connectDb";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendMail } from "@/helpers/mailer";
export async function POST(request: NextRequest) {
  await connectDb();
  try {
    const reqBody = await request.json();
    const { name, email, password } = reqBody;
    //check if user exists
    const fetchedUserWithEmail = await User.findOne({ email });
    if (fetchedUserWithEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 400 }
      );
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    if (!savedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Something went wrong. User not created.",
        },
        { status: 500 }
      );
    }
    await sendMail(email, "VERIFY_ACCOUNT", savedUser._id.toString());
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      savedUser,
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
