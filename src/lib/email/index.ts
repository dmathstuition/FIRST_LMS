import "server-only";

import { siteConfig } from "@/config/site";

const RESEND_API = "https://api.resend.com/emails";

/** True when Resend is configured (RESEND_API_KEY present). */
export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send a transactional email via Resend. No-ops (returns false) when Resend
 * isn't configured, and never throws — email is best-effort and must not break
 * the checkout flow.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return false;
  const from = process.env.RESEND_FROM || `${siteConfig.name} <onboarding@resend.dev>`;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch (error) {
    console.error("sendEmail failed:", error);
    return false;
  }
}

/** Branded HTML purchase receipt. */
function receiptHtml(opts: {
  courseTitle: string;
  amountNaira: number;
  reference: string;
}): string {
  const amount = `₦${opts.amountNaira.toLocaleString("en-NG")}`;
  const date = new Date().toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `<!doctype html>
<html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#101828">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="background:#fff;border:1px solid #e4e8f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px;color:#fff">
        <div style="font-size:18px;font-weight:700">${siteConfig.name}</div>
        <div style="opacity:.85;font-size:14px;margin-top:4px">Payment receipt</div>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 16px;font-size:15px">Thank you for your purchase! You're enrolled and ready to start learning.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#5b6575">Course</td><td style="padding:8px 0;text-align:right;font-weight:600">${opts.courseTitle}</td></tr>
          <tr><td style="padding:8px 0;color:#5b6575">Amount paid</td><td style="padding:8px 0;text-align:right;font-weight:700">${amount}</td></tr>
          <tr><td style="padding:8px 0;color:#5b6575">Reference</td><td style="padding:8px 0;text-align:right;font-family:monospace">${opts.reference}</td></tr>
          <tr><td style="padding:8px 0;color:#5b6575">Date</td><td style="padding:8px 0;text-align:right">${date}</td></tr>
        </table>
        <a href="${siteConfig.url}/dashboard" style="display:inline-block;margin-top:20px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px">Go to your dashboard</a>
      </div>
    </div>
    <p style="text-align:center;color:#8a93a3;font-size:12px;margin-top:16px">
      ${siteConfig.name} · This is an automated receipt.
    </p>
  </div>
</body></html>`;
}

/** Send a purchase receipt email. Best-effort. */
export async function sendReceiptEmail(opts: {
  to: string;
  courseTitle: string;
  amountNaira: number;
  reference: string;
}): Promise<boolean> {
  return sendEmail({
    to: opts.to,
    subject: `Your ${siteConfig.shortName} receipt — ${opts.courseTitle}`,
    html: receiptHtml(opts),
  });
}
