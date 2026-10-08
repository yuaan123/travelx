import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  if (!process.env.EMAIL_FROM) {
    console.error("EMAIL_FROM is missing");
    return;
  }

  const { error } = await resend.emails.send({
    from: 'Travelx <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email sending failed:", error);
  }
}
