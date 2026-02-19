export async function POST(request) {
  const { storyText, userId } = await request.json();

  if (!storyText || !storyText.trim()) {
    return Response.json({ status: "rejected", reason: "No story provided." }, { status: 400 });
  }

  // Vercel provides geolocation headers automatically
  const city = request.headers.get("x-vercel-ip-city") || "";
  const country = request.headers.get("x-vercel-ip-country") || "";

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // ── AI Moderation ──
  let result;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a story editor for Date&Tell, an anonymous dating story platform. Your job is to lightly edit submissions while keeping the original voice intact.

REJECTION RULES:
Reject if the story contains: explicit sexual content, hate speech, harassment, illegal activity, defamation, or violent content. If rejecting, respond with: {"status":"rejected","reason":"brief reason"}

EDITING RULES:
If acceptable, edit the story following these rules:
- Keep it under 750 characters
- Remove any identifying details (real names, specific employers, schools)
- Replace names with generic terms (e.g., "my date", "they", "he", "she")
- You may keep general neighborhood or area references (e.g., "around the Marina") but remove specific addresses or venues
- Remove any provocative or explicit language

VOICE RULES (CRITICAL — READ CAREFULLY):
- MATCH THE ORIGINAL POV: If the person writes using "I" statements, YOUR rewrite MUST also use "I" statements. If they write in third person, keep third person. Mirror their perspective exactly.
- KEEP THEIR WORDS: Your job is to polish, not rewrite from scratch. Keep the person's original phrasing, expressions, and word choices as much as possible. If they said "I muster up the courage," keep "I muster up the courage." Don't change it to "So I ask if I can sit with him."
- DON'T MAKE IT CHOPPY: Avoid turning flowing sentences into short, staccato fragments. The rewrite should read like ONE continuous story being told, not a list of things that happened. Connect ideas naturally with "and," commas, or natural transitions.
- PRESERVE EVERY IMPORTANT DETAIL: Do NOT drop details that make the story special. If someone mentions a chocolate bar from England, that detail stays. If someone mentions a bean allergy, that stays. If the waitress said something, keep what she said. The specific details ARE the story.
- KEEP THEIR ENERGY: If the original is warm and sweet, keep it warm and sweet. If it's sarcastic, keep it sarcastic. If it's dramatic, keep it dramatic. Don't flatten their personality.

STORYTELLING RULES:
- Think of this as telling a friend's story at dinner. It should flow naturally from setup to punchline.
- STRUCTURE IT AS: Setup (context) → Build (the situation develops) → Payoff (the moment that makes it a great story). The best part should land at or near the end.
- DON'T RUSH: Let the story breathe. Use natural connectors like "and," "so," "then," "at one point" to keep it flowing. A story that feels like one continuous moment is better than a story that feels like five separate bullet points.
- END ON THE STRONGEST MOMENT: Find the funniest, sweetest, or most surprising part and make sure it's the last thing the reader reads. Don't add commentary after it. Just let it land.
- Never use em dashes. Use commas, periods, or "and" instead.
- Never use flowery or poetic language. No "cuddled," "nestled," "blossomed," "ignited a spark," etc.
- Contractions always (don't, can't, wasn't, etc.)
- Never add a moral, lesson, or neat ending. No "and that's when I knew," "sometimes the best things happen when," "turns out," or "needless to say."

WHAT GOOD EDITING LOOKS LIKE:
- Original: "I matched with this guy on the apps about 6 months ago and we never connected in-person. We would see each other every once in a while around the Marina and would wave hello. One day, I see him working from a busy coffee shop and I couldn't find a seat. I muster up the courage to ask if I could sit with him while I do some work."
- GOOD rewrite: "I matched with this guy on the apps about 6 months ago and we never actually met up. We'd see each other around the Marina every now and then and wave. One day I spot him working at a packed coffee shop and there's nowhere to sit, so I finally muster up the courage to ask if I can join him."
- BAD rewrite: "I matched with this guy 6 months ago and never met up. Classic. We'd wave when we saw each other around the Marina. One day I see him at a coffee shop and can't find a seat, so I muster up the courage and ask if I can sit with him."
- The BAD version is choppy, drops the natural flow, and adds "Classic" which wasn't in the original. The GOOD version keeps the person's voice and lets the story flow.

ALSO GENERATE:
- A fun, catchy title (max 40 chars). Make it sound like a group chat message, not a newspaper headline. Use sentence case (capitalize only the first word, not every word).
- Assign ONE theme from: First Dates, Meet Cutes, Dating App Disasters, Awkward Moments, Meeting the Family, Situationships
- A fun anonymous persona name like "Pasta Lover" or "Serial Texter" (no city names, no real names, keep it playful)
- A comma-separated list of 5-10 searchable tags related to the story content (e.g., "dog, puppy, park, coffee, first date, nervous")

Respond ONLY with JSON, no markdown fences:
{"status":"approved","title":"...","theme":"...","author":"...","rewritten":"...","tags":"..."}

STORY:
${storyText}`
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    try {
      result = JSON.parse(text);
    } catch {
      console.error("AI response not valid JSON:", text);
      result = { status: "approved", title: "Untitled", theme: "Awkward Moments", author: "Anonymous", rewritten: storyText.slice(0, 750), tags: "" };
    }
  } catch (err) {
    console.error("AI moderation error:", err);
    result = { status: "approved", title: "Untitled", theme: "Awkward Moments", author: "Anonymous", rewritten: storyText.slice(0, 750), tags: "" };
  }

  // ── Capitalize title (sentence case) ──
  if (result.title) {
    result.title = result.title.charAt(0).toUpperCase() + result.title.slice(1);
  }

  // ── Save to Supabase ──
  if (result.status === "approved") {
    try {
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          original_text: storyText,
          rewritten_text: result.rewritten,
          title: result.title,
          theme: result.theme,
          author_persona: result.author,
          search_tags: result.tags ? result.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          city: decodeURIComponent(city),
          country,
          status: "pending",
          ...(userId ? { user_id: userId } : {}),
        }),
      });
      if (!saveRes.ok) {
        console.error("Supabase save error:", saveRes.status, await saveRes.text());
      } else {
        const saved = await saveRes.json();
        if (Array.isArray(saved) && saved.length > 0) {
          result.storyId = saved[0].id;
        }
      }
    } catch (err) {
      console.error("Supabase save error:", err);
    }
  }

  return Response.json(result);
}
