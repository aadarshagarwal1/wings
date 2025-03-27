import { NextResponse } from "next/server";
import { sendMail } from "@/helpers/mailer";

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();

    await sendMail(email, "CHANGE_PASSWORD", userId);

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
