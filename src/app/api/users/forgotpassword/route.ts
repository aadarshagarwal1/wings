import { NextResponse } from "next/server";
import { sendForgotPasswordMail } from "@/helpers/mailer";
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    await sendForgotPasswordMail(email);
    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
