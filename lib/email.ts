// Sends transactional email via Resend (https://resend.com). Resend has a
// free tier (100 emails/day) that's enough for admission confirmations.
// Uses plain fetch instead of the Resend SDK to avoid an extra dependency.
//
// Setup (see .env.example):
//   1. Create a free account at resend.com
//   2. Verify a sending domain (or use their onboarding@resend.dev sender
//      for testing, which works without domain verification but only
//      delivers to the email you signed up with)
//   3. Create an API key and set RESEND_API_KEY in your environment
//   4. Set EMAIL_FROM to your verified sender, e.g. "EEF College <admissions@eefcollege.edu.pk>"

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    // Email is not configured yet. Don't throw - the calling code should
    // treat this as "email not sent" and continue (e.g. an admission
    // application still gets saved even if no confirmation email goes out).
    console.warn(
      "sendEmail skipped: RESEND_API_KEY or EMAIL_FROM is not set."
    );
    return { ok: false, error: "Email is not configured." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("sendEmail failed:", response.status, body);
      return { ok: false, error: `Email provider returned ${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendEmail error:", err);
    return { ok: false, error: "Could not reach email provider." };
  }
}
