import { config } from '../config.js';

/**
 * Sends a transactional email through Resend (https://resend.com) using its HTTP
 * API — no SDK needed. Without RESEND_API_KEY the email is logged instead, so
 * development and previews keep working; production should always have a key.
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!config.resendApiKey) {
    console.info(`[email:not-sent] to=${to} subject="${subject}"\n${text}`);
    return { sent: false };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.emailFrom, to, subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) {
    console.error('[email] failed', res.status, await res.text().catch(() => ''));
    return { sent: false };
  }
  return { sent: true };
}

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Simple branded HTML wrapper for transactional emails. */
export function emailLayout(title, paragraphs, action) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${escape(p)}</p>`).join('');
  const button = action
    ? `<p style="margin:22px 0"><a href="${escape(action.url)}" style="background:#0B2A55;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">${escape(action.label)}</a></p>`
    : '';
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#2B2B2B;max-width:560px;margin:0 auto;padding:24px">
  <p style="font-weight:800;font-size:18px;margin:0 0 2px;color:#0B2A55">REAL MOVING CANADA INC.</p>
  <p style="font-style:italic;font-weight:600;font-size:13px;margin:0 0 18px;color:#E21F26">Movers You Can Trust</p>
  <h1 style="font-size:22px;font-weight:600;margin:0 0 16px">${escape(title)}</h1>${body}${button}
  <p style="color:#8B8580;font-size:12px;margin-top:28px">Real Moving Canada Inc. · 231 Flynn Bend, Saskatoon, SK S7V 1R9 · +1 (306) 880-4560 · +1 (306) 202-7026 · info@realmovingcanada.ca</p></div>`;
}
