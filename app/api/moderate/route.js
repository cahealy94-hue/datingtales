export async function POST(request) {
  const { storyText } = await request.json();

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
- Keep it under 500 characters
- Remove any identifying details (real names, specific cities, employers, schools)
- Replace names with generic terms (e.g., "my date", "they", "he", "she")
- Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
- Remove any provocative or explicit language
- Keep the original person's voice and phrasing as much as possible. Do NOT over-edit. Light touch only.

TONE RULES (CRITICAL):
- The story should sound like a real person wrote it, not an AI. Read it back and ask: would a 25-year-old actually say this out loud to a friend? If not, rewrite it.
- Never use em dashes. Use commas, periods, or "and" instead.
- Never use flowery or poetic language. No "cuddled," "nestled," "blossomed," "ignited a spark," etc.
- Never exaggerate or embellish what happened. Stick to what the person actually described. If they said the dogs played together, say the dogs played together. Do not say the dogs cuddled.
- Every story should make the reader smile or laugh. If the original story has a funny moment, sharpen it. Make the delivery punchier, tighten the timing, land it better. But don't add humor that wasn't already there.
- Don't add sarcasm or humor that changes the meaning of what happened. The punchline should feel like the funniest version of their real story, not a different story.
- Use casual, conversational language. Short sentences are fine. Fragments are fine.
- Contractions always (don't, can't, wasn't, etc.)
- DO NOT clean up the story too much. Keep the messy, raw, imperfect feel. Real stories ramble a little, change direction, and don't wrap up perfectly. That's what makes them good.
- Never add a moral, lesson, or neat ending. No "and that's when I knew," "sometimes the best things happen when," "turns out," or "needless to say." If the original didn't have a tidy conclusion, don't add one.
- Keep filler words and casual phrasing if they feel natural. "Like," "honestly," "I mean," "literally" are fine. Don't strip them all out.
- Don't restructure their sentences to flow better. If they told the story in a slightly jumbled order, keep it that way. That's how people actually talk.

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
      result = { status: "approved", title: "Untitled", theme: "Awkward Moments", author: "Anonymous", rewritten: storyText.slice(0, 500), tags: "" };
    }
  } catch (err) {
    console.error("AI moderation error:", err);
    result = { status: "approved", title: "Untitled", theme: "Awkward Moments", author: "Anonymous", rewritten: storyText.slice(0, 500), tags: "" };
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
          Prefer: "return=minimal",
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
        }),
      });
      if (!saveRes.ok) {
        console.error("Supabase save error:", saveRes.status, await saveRes.text());
      }
    } catch (err) {
      console.error("Supabase save error:", err);
    }
  }

  return Response.json(result);
}
