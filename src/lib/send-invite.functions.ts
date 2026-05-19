import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InviteSchema = z.object({
  kind: z.enum(["movie", "coffee"]).nullable(),
  day: z.number().int().min(1).max(31).nullable(),
  time: z.string().min(1).max(40).nullable(),
  vibe: z.string().min(1).max(40),
  note: z.string().max(200).optional().default(""),
});

const PRADEEP = "Pardeep4710j@gmail.com";
const JESSIKA = "Jessikajobs5@gmail.com";

export const sendInvite = createServerFn({ method: "POST" })
  .inputValidator((input) => InviteSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

    const kindLabel = data.kind === "movie" ? "Movie Date 🎬" : "Coffee Date ☕";
    const dateLabel = `May ${data.day ?? 18}, 2026 at ${data.time ?? "1:00 PM"}`;
    const noteHtml = data.note
      ? `<p style="margin:16px 0;padding:12px 16px;background:#fff1f5;border-left:3px solid #ec4899;border-radius:8px;font-style:italic;color:#9d174d;">"${escapeHtml(data.note)}"</p>`
      : "";

    const movieBody = `
      <p style="font-size:18px;margin:0 0 8px;">Hey youuu 🥹💖</p>
      <p style="margin:0 0 16px;"><strong>Congratulations!</strong></p>
      <p style="margin:0 0 16px;">You've officially been selected as my movie date for the most cutest little cinema moment ever 🍿✨</p>
      <p style="margin:0 0 8px;"><strong>Your duties include:</strong></p>
      <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;">
        <li>Sharing popcorn</li>
        <li>Holding hands during emotional scenes</li>
        <li>Laughing at bad jokes</li>
        <li>And making this date unforgettable 💕</li>
      </ul>
      <p style="margin:0;">See you soon, movie partner 🎬💫</p>
    `;

    const coffeeBody = `
      <p style="font-size:18px;margin:0 0 8px;">Hi cutie ☺️</p>
      <p style="margin:0 0 16px;"><strong>Good news…</strong></p>
      <p style="margin:0 0 16px;">You've officially been selected to join me for a cozy little coffee date ☕✨</p>
      <p style="margin:0 0 8px;"><strong>Expected activities include:</strong></p>
      <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;list-style:none;">
        <li>🤎 Stealing glances</li>
        <li>🤎 Deep conversations</li>
        <li>🤎 Laughing over random things</li>
        <li>🤎 And pretending the coffee isn't making my heart race 😌</li>
      </ul>
      <p style="margin:0;">See you soon, coffee partner 💕</p>
    `;

    const loveBody = data.kind === "movie" ? movieBody : coffeeBody;

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;background:linear-gradient(180deg,#fff1f2,#ffe4e6);border-radius:24px;color:#3f1d2b;">
        <h1 style="font-size:32px;font-style:italic;text-align:center;color:#be185d;margin:0 0 8px;">It's a Date! 💕</h1>
        <p style="text-align:center;color:#9d174d;margin:0 0 24px;">From Pardeep, with love for Jessika ❤️</p>
        <div style="background:#fff;border-radius:16px;padding:20px 24px;margin-bottom:16px;box-shadow:0 4px 20px rgba(236,72,153,0.15);color:#3f1d2b;line-height:1.6;">
          ${loveBody}
        </div>
        <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(236,72,153,0.15);">
          <p style="margin:0 0 8px;font-size:14px;color:#9d174d;text-transform:uppercase;letter-spacing:1px;">Date Confirmed</p>
          <p style="margin:0 0 4px;font-size:22px;font-weight:bold;color:#be185d;">${kindLabel}</p>
          <p style="margin:0;font-size:18px;color:#3f1d2b;">📅 ${dateLabel}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">Vibe: ${escapeHtml(data.vibe)}</p>
        </div>
        ${noteHtml}
        <p style="text-align:center;margin-top:24px;font-style:italic;color:#9d174d;">"Tum mile to lagta hai, dua qubool ho gayi…" 💞</p>
        <p style="text-align:center;margin-top:8px;font-size:12px;color:#9ca3af;">— Made with love, for Jessika</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pardeep ❤️ Jessika <onboarding@resend.dev>",
        to: [PRADEEP, JESSIKA],
        subject: `It's a Date! ${kindLabel} on ${dateLabel} 💕`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend send failed", res.status, text);
      return { ok: false, error: `Email failed (${res.status})` };
    }
    return { ok: true };
  });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}