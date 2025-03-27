import { NextResponse, NextRequest } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/lib/connectDb";
import bcrypt from "bcryptjs";
await connectDb();
export async function POST(request: NextRequest) {
  await connectDb();
  const reqBody = await request.json();
  const { password, userId } = reqBody;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();
  return NextResponse.json(
    { message: "Password changed successfully", success: true },
    { status: 200 }
  );
}
