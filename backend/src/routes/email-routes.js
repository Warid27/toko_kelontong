import { Hono } from "hono";
import { SMTPClient } from "emailjs";
import { SMTP_EMAIL, SMTP_PASSWORD, EMAIL_RECIPIENT } from "@config/config";

const router = new Hono();

const client = new SMTPClient({
  user: SMTP_EMAIL,
  password: SMTP_PASSWORD,
  host: "smtp.gmail.com",
  ssl: true,
});

router.post("/send", async (c) => {
  try {
    const { name, email, message } = await c.req.json();

    if (!name || !email || !message) {
      return c.json({ success: false, error: "All fields are required" }, 400);
    }

    // Send Email
    await client.sendAsync({
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      from: SMTP_EMAIL,
      to: EMAIL_RECIPIENT,
      subject: `New Message from ${name}`,
    });

    return c.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    return c.json({ success: false, error: "Failed to send email" }, 500);
  }
});
export default router;
