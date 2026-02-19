export async function POST(request) {
  const { originalText, currentTitle, currentStory, currentAuthor, currentTheme, target, storyId } = await request.json();

  if (!originalText || !target || !["title", "story"].includes(target)) {
    return Response.json({ error: "Missing originalText or invalid target (must be 'title' or 'story')" }, { status: 400 });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  let prompt;

  if (target === "title") {
    prompt = `You are a title writer for Date&Tell, an anonymous dating story platform.

Here is the original story submission:
${originalText}

Here is the current AI-rewritten version:
${currentStory}

The current title is: "${currentTitle}"

Generate a NEW, DIFFERENT title. The title should:
- Be max 40 chars
- Make someone WANT to click and read
- Sound like a group chat message that makes everyone go "WAIT WHAT"
- Tease without spoiling. Hint at the chaos or sweetness without giving away the punchline
- Use sentence case (capitalize only the first word)
- Be meaningfully different from the current title, not just a minor rewording

Good examples: "He brought receipts. Literally.", "6 months of waving", "The aunt had a whole plan", "We climbed through a window for this", "At least my parents were proud"
Bad examples: "My crazy first date" (generic), "The spaghetti incident on our date" (too literal), "How I met my boyfriend" (boring)

Respond ONLY with JSON, no markdown fences:
{"title":"..."}`;
  } else {
    prompt = `You are a story editor for Date&Tell, an anonymous dating story platform.

Here is the original story submission:
${originalText}

Here is the current AI-rewritten version:
${currentStory}

Rewrite the story again with a FRESH take. Follow these rules:

- Keep it under 750 characters
- Remove any identifying details (real names, specific employers, schools)
- You may keep general neighborhood or area references but remove specific addresses or venues
- MATCH THE ORIGINAL POV: If the person writes using "I" statements, your rewrite MUST also use "I" statements
- KEEP THEIR WORDS: Polish, don't rewrite from scratch. Keep the person's original phrasing and expressions as much as possible
- DON'T MAKE IT CHOPPY: The rewrite should read like ONE continuous story being told, not a list of things that happened
- PRESERVE EVERY IMPORTANT DETAIL: Do NOT drop details that make the story special
- KEEP THEIR ENERGY: Match the tone of the original
- Structure as: Setup → Build → Payoff. The best part should land at or near the end
- Let the story breathe with natural connectors like "and," "so," "then"
- END ON THE STRONGEST MOMENT: Don't add commentary after it. Just let it land.
- Never use em dashes. Use commas, periods, or "and" instead
- Contractions always
- Never add a moral or lesson
- Make this version meaningfully different from the current rewrite, not just minor word swaps. Try a different angle, pacing, or structure while keeping all the same facts.

Respond ONLY with JSON, no markdown fences:
{"rewritten":"..."}`;
  }

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
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Regenerate response not valid JSON:", text);
      return Response.json({ error: "AI returned invalid response" }, { status: 500 });
    }

    // Update Supabase if we have a storyId
    if (storyId && SUPABASE_SERVICE_KEY) {
      try {
        const updateBody = target === "title"
          ? { title: parsed.title }
          : { rewritten_text: parsed.rewritten };

        await fetch(`${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify(updateBody),
        });
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }

    return Response.json({ ok: true, ...parsed });
  } catch (err) {
    console.error("Regenerate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
