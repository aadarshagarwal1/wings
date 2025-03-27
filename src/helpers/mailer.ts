import nodemailer from "nodemailer";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";

const sendMail = async (email: string, emailType: string, userId: any) => {
  try {
    const hashedToken = await bcrypt.hash(userId.toString(), 10);
    if (emailType === "VERIFY_ACCOUNT") {
      await User.findByIdAndUpdate(
        userId,
        {
          verifyToken: hashedToken,
          verifyTokenExpiry: Date.now() + 3600000,
        },
        { new: true }
      );
    } else if (emailType === "CHANGE_PASSWORD") {
      await User.findByIdAndUpdate(
        userId,
        {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: Date.now() + 3600000,
        },
        { new: true }
      );
    }
    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "41727c07b42905",
        pass: "c516a55657ca04",
      },
    });
    const mailOptions = {
      from: "aadarshsaroon001@gmail.com",
      to: email,
      subject: emailType,
      html: `<p>Click <a href="${process.env.DOMAIN}/${
        emailType === "VERIFY_ACCOUNT" ? "verifyemail" : "changepassword"
      }?token=${hashedToken}">here</a> to ${
        emailType === "VERIFY_ACCOUNT"
          ? "verify your email"
          : "reset your password"
      }
            or copy and paste the link below in your browser. <br> ${
              process.env.DOMAIN
            }/${
        emailType === "VERIFY_ACCOUNT" ? "verifyemail" : "changepassword"
      }?token=${hashedToken}
            </p>`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
const sendForgotPasswordMail = async (email: string) => {
  try {
    const hashedToken = await bcrypt.hash(email.toString(), 10);

    await User.findOneAndUpdate(
      { email },
      {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      },
      { new: true }
    );
    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "41727c07b42905",
        pass: "c516a55657ca04",
      },
    });
    const mailOptions = {
      from: "aadarshsaroon001@gmail.com",
      to: email,
      subject: "FORGOT PASSWORD",
      html: `<p>Click <a href="${process.env.DOMAIN}/changepassword?token=${hashedToken}">here</a> to reset your password   
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/changepassword?token=${hashedToken}
            </p>`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
export { sendMail, sendForgotPasswordMail };
