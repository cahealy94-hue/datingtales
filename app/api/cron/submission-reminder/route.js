const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

const variants = [
  {
    subject: "Spill it. We won't tell.",
    previewText: "That one moment you still think about? Yeah, that one.",
    heading: "You don't need a whole story.",
    body: `Just that one moment.<br><br>
The text you screenshot and sent to your group chat. The date that went sideways in the first five minutes. The thing they said that made you go <em>wait, what?</em><br><br>
That's a story. And we want it.<br><br>
Here's how it works: submit anonymously, and our AI will rewrite it, give it a title, and assign you a fun persona — like "Accidental Texter" or "Serial Ghoster." Takes two minutes. No writing skills required.<br><br>
The best stories get featured in the next Date&Tell newsletter. Anonymously, always.`,
  },
  {
    subject: "That cringe moment? It's content now.",
    previewText: "The awkward pause. The wrong name. The accidental like. All of it.",
    heading: "We've all had one.",
    body: `The moment you replayed on the way home.<br><br>
The thing you said that came out completely wrong. The date who showed up looking nothing like their photos. The situationship that ended with zero explanation.<br><br>
Submit it anonymously and our AI takes care of the rest — it rewrites your story, makes it punchy, gives it a title, and assigns you a persona. You stay completely anonymous. The whole thing takes two minutes.<br><br>
Your story could be featured in the next Date&Tell newsletter. No name attached. Ever.`,
  },
  {
    subject: "Your dating life is funnier than you think.",
    previewText: "Seriously. We want the weird stuff.",
    heading: "The weird stuff is the good stuff.",
    body: `Not looking for fairy tales over here.<br><br>
We want the guy who brought his mom. The app match who turned out to be your coworker. The first date that ended at an urgent care.<br><br>
Submit your moment anonymously — our AI rewrites it, gives it a catchy title, and assigns you a fun persona. It takes two minutes and you don't have to be a good writer. We handle that part.<br><br>
The best submissions get featured in the next newsletter. Your identity stays completely hidden. Always.`,
  },
  {
    subject: "Got 2 minutes? We've got a story form.",
    previewText: "Anonymous. No judgment. Just vibes.",
    heading: "Two minutes. That's it.",
    body: `Your name stays out of it. Your ex's name too.<br><br>
Submit your dating moment anonymously, and our AI will rewrite it into something funny and polished, give it a title, and assign you a persona — think "Hopeless Romantic" or "Red Flag Collector." You just supply the raw material.<br><br>
Takes two minutes. No editing required on your end. And if your story is good, it could be featured in the next Date&Tell newsletter — anonymously, of course.<br><br>
One weird moment is all it takes.`,
  },
];

export async function GET(request) {
  const authHeader = request.headers.get("x-cron-secret");
if (authHeader !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const variant = variants[Math.floor(Math.random() * variants.length)];

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #E2E8F0;overflow:hidden;max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#0F172A;padding:28px 40px;">
              <span style="font-family:'League Spartan',system-ui,sans-serif;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">Date&Tell</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="font-size:26px;font-weight:700;color:#0F172A;letter-spacing:-0.02em;margin:0 0 20px 0;line-height:1.2;">${variant.heading}</h1>
              <p style="font-size:16px;color:#64748B;line-height:1.7;margin:0 0 32px 0;">${variant.body}</p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2563EB;border-radius:12px;">
                    <a href="https://www.dateandtell.com/submit"
                       style="display:inline-block;padding:16px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Submit your story →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#94A3B8;margin:28px 0 0 0;line-height:1.6;">
                Anonymous always. Takes 2 minutes. No full story required.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;">
              <p style="font-size:12px;color:#94A3B8;margin:0;line-height:1.6;">
                You're receiving this because you subscribed to Date&Tell.<br>
                <a href="{{unsubscribe_url}}" style="color:#94A3B8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/broadcasts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          subject: variant.subject,
          preview_text: variant.previewText,
          content: { html: emailHtml },
          send_at: null,
          status: "draft",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Beehiiv broadcast error:", data);
      return Response.json({ ok: false, error: data }, { status: 500 });
    }

    return Response.json({ ok: true, broadcastId: data.data?.id });
  } catch (err) {
    console.error("Cron job error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
