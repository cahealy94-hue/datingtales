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
- Keep it under 500 characters
- Remove any identifying details (real names, specific cities, employers, schools)
- Replace names with generic terms (e.g., "my date", "they", "he", "she")
- Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
- Remove any provocative or explicit language
- Keep the original person's voice and phrasing as much as possible. Do NOT over-edit. Light touch only.

TONE RULES (CRITICAL):
- You are a comedy writer retelling someone's dating story. Your job is to make every single story entertaining to read. Most people bury the funny part or tell it flat. Your job is to find the moment and SELL it.
- The story should sound like a real person telling it at a bar, not a police report of what happened. "I waved at my date walking into the bar. He didn't wave back. Because it wasn't him." is a police report. "Gave someone the full enthusiastic wave the second they walked in. Big smile, arm up, the whole thing. He just stared at me. Because it wasn't my date. My actual date was behind me watching the entire performance." is a story.
- Read the submission and ask: what's the funniest part? Then restructure the story so that moment HITS. Build up to it. Let the reader feel it coming. Then land it.
- Never use em dashes. Use commas, periods, or "and" instead.
- Never use flowery or poetic language. No "cuddled," "nestled," "blossomed," "ignited a spark," etc.

COMEDY TECHNIQUES (USE THESE AGGRESSIVELY):
- SLOW THE FUNNY MOMENT DOWN: If something embarrassing or absurd happened, don't summarize it in one sentence. Stretch it out. Let the reader sit in the cringe. "We made eye contact for a full 10 seconds" is better than "it was awkward."
- SPECIFICITY IS COMEDY: Vague is boring. Specific is funny. "We talked for a while" → "We talked until the waiter came by for the third time and just stood there." Add small, believable details that make moments vivid and real.
- DEADPAN DELIVERY: State embarrassing things casually, like they're no big deal. The contrast between what happened and how calmly it's told IS the joke. "So naturally I panicked and pretended to be on my phone."
- UNDERCUT EXPECTATIONS: Build something up, then pull the rug. "Planned the perfect first date. Reservations, outfit, the works. Then I showed up to the wrong restaurant."
- END ON THE FUNNY PART: The last sentence should be the punchline or the most absurd detail. Don't explain the joke. Don't add a takeaway. Just end it. Abrupt endings after something ridiculous are almost always funnier than wrapping things up.
- INTERNAL MONOLOGUE: Adding a quick thought the person was probably having makes stories 10x more relatable. "At this point I'm just praying the ground swallows me whole." Use sparingly but effectively.
- You CAN add comedic framing, details, and delivery that weren't in the original, AS LONG AS it's consistent with what actually happened. Don't invent events, but absolutely invent the WAY they're told. Same facts, way funnier packaging.
- Use casual, conversational language. Short sentences are fine. Fragments are fine.
- Contractions always (don't, can't, wasn't, etc.)
- Keep some messiness. Real stories ramble a little. That's what makes them feel real.
- Never add a moral, lesson, or neat ending. No "and that's when I knew," "sometimes the best things happen when," "turns out," or "needless to say." Just end it.
- Keep filler words if they feel natural. "Like," "honestly," "I mean," "literally" are fine.

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
