"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── Sample Stories Data ──
const SAMPLE_STORIES = [
  {
    id: 1, title: "The Great Spaghetti Incident", theme: "First Dates",
    author: "Pasta Enthusiast", trending: true,
    text: "Ordered spaghetti on a first date to seem 'cultured.' Twirled too aggressively. Sauce on my forehead, noodle on my chin. He said 'you've got a little something' and gestured at my entire face. We've been together two years now.",
    likes: 342, publishedAt: "2026-02-07", reactions: { "😂": 89, "❤️": 45, "😬": 23 }
  },
  {
    id: 2, title: "Autocorrect Strikes Again", theme: "Dating App Disasters",
    author: "Typo Queen", trending: true,
    text: "Tried to text my date 'I'm on my way, can't wait!' Autocorrect changed it to 'I'm on my way, can't walk!' He showed up with a wheelchair he borrowed from his grandma. I didn't have the heart to correct him for twenty minutes.",
    likes: 287, publishedAt: "2026-02-07", reactions: { "😂": 112, "❤️": 18, "😬": 67 }
  },
  {
    id: 3, title: "The Dog Park Meet-Cute", theme: "Meet Cutes",
    author: "Golden Retriever Parent", trending: false,
    text: "My dog ran full speed into a stranger at the park, knocked his coffee everywhere. I ran over apologizing. He looked at my dog, looked at me, and said 'worth it.' We now share custody of three dogs.",
    likes: 198, publishedAt: "2026-02-07", reactions: { "❤️": 95, "😂": 34, "✨": 41 }
  },
  {
    id: 4, title: "Mom's Interrogation Protocol", theme: "Meeting the Family",
    author: "Nervous Wreck", trending: false,
    text: "Brought my date to meet my mom. Within five minutes she'd pulled out my baby photos, asked about his credit score, and offered him my grandmother's ring. He excused himself to the bathroom and I found him googling 'is it normal for moms to propose on your behalf.'",
    likes: 156, publishedAt: "2026-02-07", reactions: { "😂": 72, "😬": 44, "❤️": 12 }
  },
  {
    id: 5, title: "The Label Conversation", theme: "Situationships",
    author: "Hopeless Romantic", trending: true,
    text: "After four months of 'hanging out' I finally asked where we stood. He said 'I really like what we have.' I said 'what do we have?' He said 'this conversation is a great example.' We are no longer having conversations.",
    likes: 421, publishedAt: "2026-02-07", reactions: { "😂": 134, "😬": 89, "💀": 67 }
  },
  {
    id: 6, title: "Wrong Table, Right Person", theme: "Awkward Moments",
    author: "Latte Lover", trending: false,
    text: "Showed up to a blind date at a coffee shop. Sat down across from someone, chatted for ten minutes about our lives. Turns out it wasn't my date — just a very friendly stranger. My actual date watched the whole thing from two tables over. Married the stranger.",
    likes: 267, publishedAt: "2026-01-31", reactions: { "❤️": 88, "😂": 56, "✨": 73 }
  },
  {
    id: 7, title: "The Zoom Background Betrayal", theme: "Dating App Disasters",
    author: "Remote Worker", trending: false,
    text: "Had a video date. Used a fancy apartment as my virtual background. Cat jumped on my desk and knocked my laptop, revealing my actual studio apartment with laundry everywhere. They said 'honestly, I respect the ambition.' Second date was at a laundromat.",
    likes: 189, publishedAt: "2026-01-31", reactions: { "😂": 78, "❤️": 22, "😬": 31 }
  },
  {
    id: 8, title: "Uber Driver Played Cupid", theme: "Meet Cutes",
    author: "Backseat Romantic", trending: false,
    text: "Shared a pool ride with a stranger. Driver kept 'accidentally' taking wrong turns to extend the trip. We talked for forty minutes. As we got out, the driver handed us both a receipt that said 'you're welcome' with his Venmo. We sent him flowers on our anniversary.",
    likes: 312, publishedAt: "2026-01-31", reactions: { "❤️": 121, "✨": 56, "😂": 43 }
  },
];

const THEMES = ["First Dates", "Meet Cutes", "Dating App Disasters", "Awkward Moments", "Meeting the Family", "Situationships"];
const EMOJI_OPTIONS = ["😂", "❤️", "😬", "✨", "💀"];

// ── AI Moderation via Anthropic API ──
async function moderateStory(storyText) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a content moderator for DatingTales, an anonymous dating story platform. Analyze and process the following dating story submission.

RULES:
1. REJECT if the story contains: explicit sexual content, hate speech, harassment, illegal activity, defamation, or violent content. If rejecting, respond with: {"status":"rejected","reason":"brief reason"}
2. If acceptable, REWRITE the story to:
   - Be 500 characters or less
   - Remove any identifying details (real names, specific cities, employers, schools)
   - Replace names with generic terms (e.g., "my date", "they", "he", "she")
   - Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
   - Remove any provocative or explicit language
   - Maintain the humor, warmth, and tone
   - Keep it engaging and readable
3. Generate a fun, catchy title (max 40 chars)
4. Assign ONE theme from: First Dates, Meet Cutes, Dating App Disasters, Awkward Moments, Meeting the Family, Situationships
5. Generate a fun anonymous persona name like "Pasta Lover" or "Serial Texter" (no city, no real names)

Respond ONLY with JSON, no markdown fences:
{"status":"approved","title":"...","theme":"...","author":"...","rewritten":"..."}

STORY:
${storyText}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(i => i.text || "").join("\n") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("AI moderation error:", err);
    return { status: "approved", title: "A Dating Tale", theme: "Awkward Moments", author: "Anonymous Storyteller", rewritten: storyText.slice(0, 500) };
  }
}

// ── Icon Components ──
const HeartIcon = ({ size = 24, fill = "none", color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,7 12,13 2,7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const EllipsisIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

// ── Main App ──
export default function DatingTales() {
  const [page, setPage] = useState("home");
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [storyText, setStoryText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTheme, setActiveTheme] = useState(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [storyReactions, setStoryReactions] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [hiddenStories, setHiddenStories] = useState(new Set());
  const [reportCounts, setReportCounts] = useState({});
  const submitRef = useRef(null);

  const handleReport = useCallback((storyId, reason) => {
    // Hide for this user immediately
    setHiddenStories(prev => new Set([...prev, storyId]));
    // Track report count
    setReportCounts(prev => {
      const newCount = (prev[storyId] || 0) + 1;
      const updated = { ...prev, [storyId]: newCount };
      // Remove story entirely at 5 reports
      if (newCount >= 5) {
        setStories(s => s.filter(story => story.id !== storyId));
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmitStory = useCallback(async () => {
    if (!storyText.trim() || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    const result = await moderateStory(storyText);
    if (result.status === "rejected") {
      setSubmitResult({ type: "rejected", message: result.reason || "We couldn't publish this one — but we'd love a lighter version!" });
    } else {
      const newStory = {
        id: Date.now(), title: result.title, theme: result.theme,
        author: result.author, trending: false, text: result.rewritten,
        likes: 0, publishedAt: new Date().toISOString().split("T")[0],
        reactions: {}
      };
      setStories(prev => [newStory, ...prev]);
      setSubmitResult({ type: "approved", story: newStory });
      setStoryText("");
    }
    setSubmitting(false);
  }, [storyText, submitting]);

  const handleReaction = useCallback((storyId, emoji) => {
    const key = `${storyId}-${emoji}`;
    if (storyReactions[key]) return;
    setStoryReactions(prev => ({ ...prev, [key]: true }));
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const reactions = { ...s.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...s, reactions, likes: s.likes + 1 };
    }));
  }, [storyReactions]);

  const filteredStories = stories.filter(s => {
    if (hiddenStories.has(s.id)) return false;
    const matchesTheme = !activeTheme || s.theme === activeTheme;
    const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const thisWeekStories = stories.filter(s => s.publishedAt === "2026-02-07" && !hiddenStories.has(s.id));
  const navShadow = scrollY > 10;

  // ── Styles ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #FAFAF7;
      --bg-warm: #F5F0EB;
      --primary: #5B8FB9;
      --primary-light: #E8F1F8;
      --primary-dark: #3A6B8C;
      --accent: #E8836B;
      --accent-light: #FFF0EC;
      --accent-dark: #D4654D;
      --text: #2C2C2C;
      --text-secondary: #6B6B6B;
      --text-light: #9A9A9A;
      --white: #FFFFFF;
      --border: #E8E4DF;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
      --shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
      --radius: 16px;
      --radius-sm: 10px;
      --radius-pill: 999px;
      --font-display: 'DM Serif Display', Georgia, serif;
      --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
      --max-w: 1120px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

    .nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(250, 250, 247, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;
    }
    .nav.scrolled { border-bottom-color: var(--border); box-shadow: var(--shadow-sm); }
    .nav-inner {
      max-width: var(--max-w); margin: 0 auto; padding: 14px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
    .nav-logo-text { font-family: var(--font-display); font-size: 22px; color: var(--text); }
    .nav-logo-icon { color: var(--accent); display: flex; }
    .nav-links { display: flex; align-items: center; gap: 8px; }
    .nav-link {
      font-size: 14px; font-weight: 600; color: var(--text-secondary);
      padding: 8px 16px; border-radius: var(--radius-pill);
      cursor: pointer; transition: all 0.2s; border: none; background: none;
      font-family: var(--font-body); display: inline-flex; align-items: center; gap: 6px;
    }
    .nav-link:hover { color: var(--text); background: var(--bg-warm); }
    .nav-cta {
      font-size: 14px; font-weight: 700; color: var(--white);
      background: var(--accent); padding: 10px 22px;
      border-radius: var(--radius-pill); border: none; cursor: pointer;
      transition: all 0.25s; font-family: var(--font-body);
      box-shadow: 0 2px 8px rgba(232,131,107,0.3);
      display: inline-flex; align-items: center; gap: 6px;
    }
    .nav-cta:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,131,107,0.35); }

    .hero {
      max-width: var(--max-w); margin: 0 auto; padding: 80px 24px 60px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
    }
    .hero-content { text-align: left; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--accent-light); color: var(--accent-dark);
      padding: 6px 16px; border-radius: var(--radius-pill);
      font-size: 13px; font-weight: 700; margin-bottom: 24px;
      letter-spacing: 0.02em;
    }
    .hero h1 {
      font-family: var(--font-display); font-size: clamp(38px, 5vw, 58px);
      line-height: 1.1; margin-bottom: 20px; color: var(--text);
      letter-spacing: -0.02em;
    }
    .hero h1 em { font-style: italic; color: var(--accent); }
    .hero p.hero-sub {
      font-size: 17px; color: var(--text-secondary); max-width: 480px;
      margin: 0 0 32px; line-height: 1.6;
    }
    .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero-illustration {
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .hero-illustration-inner {
      width: 100%; max-width: 460px; aspect-ratio: 1;
      background: linear-gradient(145deg, var(--accent-light) 0%, var(--primary-light) 100%);
      border-radius: 32px; position: relative; overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .hero-card-float {
      position: absolute; background: var(--white); border-radius: 18px;
      padding: 20px 22px; box-shadow: var(--shadow-md); border: 1px solid var(--border);
      max-width: 280px;
    }
    .hero-card-float.card-1 { top: 10%; left: 6%; transform: rotate(-3deg); z-index: 2; }
    .hero-card-float.card-2 { top: 40%; right: 4%; transform: rotate(2deg); z-index: 3; }
    .hero-card-float.card-3 { bottom: 8%; left: 12%; transform: rotate(-1deg); z-index: 1; }
    .hero-card-float .hcf-tag {
      display: inline-block; font-size: 10px; font-weight: 700;
      padding: 3px 8px; border-radius: var(--radius-pill);
      background: var(--primary-light); color: var(--primary-dark);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
    }
    .hero-card-float .hcf-title {
      font-family: var(--font-display); font-size: 15px; margin-bottom: 6px; line-height: 1.25;
    }
    .hero-card-float .hcf-text {
      font-size: 12px; color: var(--text-secondary); line-height: 1.5;
    }
    .hero-card-float .hcf-reactions {
      display: flex; gap: 6px; margin-top: 10px; font-size: 12px;
    }
    .hero-card-float .hcf-reactions span {
      background: var(--bg); padding: 3px 8px; border-radius: var(--radius-pill);
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--accent); color: var(--white);
      padding: 14px 32px; border-radius: var(--radius-pill);
      font-size: 16px; font-weight: 700; border: none; cursor: pointer;
      transition: all 0.25s; font-family: var(--font-body);
      box-shadow: 0 4px 16px rgba(232,131,107,0.3);
    }
    .btn-primary:hover { background: var(--accent-dark); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,131,107,0.35); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--white); color: var(--text);
      padding: 14px 32px; border-radius: var(--radius-pill);
      font-size: 16px; font-weight: 600; border: 1.5px solid var(--border);
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
    }
    .btn-secondary:hover { border-color: var(--primary); color: var(--primary-dark); background: var(--primary-light); }

    .hero-email-capture {
      margin-top: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 14px;
    }
    .hero-email-form {
      display: flex; align-items: center; gap: 0;
      background: var(--white); border: 2px solid var(--border);
      border-radius: var(--radius-pill); padding: 5px 5px 5px 22px;
      max-width: 440px; width: 100%;
      transition: border-color 0.25s, box-shadow 0.25s;
      box-shadow: var(--shadow-sm);
    }
    .hero-email-form:focus-within {
      border-color: var(--primary); box-shadow: 0 0 0 4px rgba(91,143,185,0.12), var(--shadow-sm);
    }
    .hero-email-form input {
      flex: 1; border: none; outline: none; font-size: 15px;
      font-family: var(--font-body); background: transparent; color: var(--text);
      min-width: 0;
    }
    .hero-email-form input::placeholder { color: var(--text-light); }
    .hero-email-btn {
      flex-shrink: 0; padding: 11px 22px; background: var(--primary); color: var(--white);
      border: none; border-radius: var(--radius-pill); font-size: 14px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
    }
    .hero-email-btn:hover { background: var(--primary-dark); }
    .hero-email-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .hero-subscribed-inline {
      display: flex; align-items: center; gap: 8px;
      background: #F0FFF4; padding: 12px 24px; border-radius: var(--radius-pill);
      color: #276749; font-weight: 600; font-size: 14px;
      border: 1.5px solid #C6F6D5;
    }
    .hero-social-proof {
      display: flex; align-items: center; gap: 12px;
    }
    .avatar-stack {
      display: flex; align-items: center;
    }
    .avatar-stack .avatar {
      width: 30px; height: 30px; border-radius: 50%;
      border: 2.5px solid var(--bg);
      margin-left: -9px; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: var(--white);
    }
    .avatar-stack .avatar:first-child { margin-left: 0; }
    .avatar-stack .avatar.a1 { background: #E8836B; z-index: 5; }
    .avatar-stack .avatar.a2 { background: #5B8FB9; z-index: 4; }
    .avatar-stack .avatar.a3 { background: #B07CC6; z-index: 3; }
    .avatar-stack .avatar.a4 { background: #6BBF8E; z-index: 2; }
    .avatar-stack .avatar.a5 { background: #E8B86B; z-index: 1; }
    .hero-social-text {
      font-size: 13px; color: var(--text-secondary); font-weight: 500;
    }
    .hero-social-text strong { color: var(--text); font-weight: 700; }

    .submit-section {
      max-width: 680px; margin: 0 auto; padding: 0 24px 80px;
    }
    .submit-card {
      background: var(--white); border-radius: 24px; padding: 48px;
      box-shadow: var(--shadow-lg); border: 1px solid var(--border);
      position: relative; overflow: hidden;
    }
    .submit-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--accent), var(--primary));
    }
    .submit-card h2 {
      font-family: var(--font-display); font-size: 32px; margin-bottom: 8px;
    }
    .submit-card .subtitle { color: var(--text-secondary); margin-bottom: 24px; font-size: 15px; }
    .textarea-wrap { position: relative; margin-bottom: 16px; }
    .textarea-wrap textarea {
      width: 100%; min-height: 140px; padding: 18px; border-radius: var(--radius);
      border: 1.5px solid var(--border); font-family: var(--font-body);
      font-size: 15px; line-height: 1.6; resize: vertical; color: var(--text);
      transition: border-color 0.2s; background: var(--bg);
    }
    .textarea-wrap textarea:focus { outline: none; border-color: var(--primary); background: var(--white); }
    .textarea-wrap textarea::placeholder { color: var(--text-light); }
    .char-count {
      position: absolute; bottom: 12px; right: 14px;
      font-size: 12px; font-weight: 600; color: var(--text-light);
    }
    .char-count.warn { color: var(--accent); }
    .char-count.over { color: #E53E3E; }
    .submit-btn {
      width: 100%; padding: 16px; background: var(--accent); color: var(--white);
      border: none; border-radius: var(--radius-sm); font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
      box-shadow: 0 4px 16px rgba(232,131,107,0.25);
    }
    .submit-btn:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .submit-fine-print { text-align: center; font-size: 12px; color: var(--text-light); margin-top: 14px; }
    .submit-result {
      margin-top: 20px; padding: 16px 20px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 500; display: flex; align-items: flex-start; gap: 10px;
    }
    .submit-result.approved { background: #F0FFF4; color: #276749; border: 1px solid #C6F6D5; }
    .submit-result.rejected { background: #FFF5F5; color: #9B2C2C; border: 1px solid #FED7D7; }

    .weekly-drop {
      max-width: var(--max-w); margin: 0 auto; padding: 0 24px 80px;
    }
    .section-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 32px; flex-wrap: wrap; gap: 12px;
    }
    .section-header h2 { font-family: var(--font-display); font-size: 36px; }
    .section-header .section-sub { color: var(--text-secondary); font-size: 15px; margin-top: 4px; }
    .section-header .view-all {
      font-size: 14px; font-weight: 700; color: var(--primary-dark);
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      padding: 8px 16px; border-radius: var(--radius-pill);
      transition: all 0.2s; background: none; border: none; font-family: var(--font-body);
    }
    .section-header .view-all:hover { background: var(--primary-light); }

    .stories-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .story-card {
      background: var(--white); border-radius: 20px; padding: 28px;
      border: 1px solid var(--border); transition: all 0.3s;
      display: flex; flex-direction: column;
    }
    .story-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
    .story-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
    .story-card h3 { font-family: var(--font-display); font-size: 20px; line-height: 1.25; flex: 1; }
    .story-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700; padding: 4px 10px;
      border-radius: var(--radius-pill); white-space: nowrap;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .story-tag.theme { background: var(--primary-light); color: var(--primary-dark); }
    .story-tag.trending { background: #FEFCBF; color: #975A16; }
    .story-meta { font-size: 12px; color: var(--text-light); margin-bottom: 14px; font-weight: 500; }
    .story-text { font-size: 14px; line-height: 1.7; color: var(--text-secondary); flex: 1; margin-bottom: 6px; }
    .story-signoff {
      font-family: var(--font-display); font-style: italic; font-size: 14px;
      color: var(--accent); margin-bottom: 16px;
    }
    .story-reactions {
      display: flex; gap: 6px; flex-wrap: wrap; padding-top: 14px;
      border-top: 1px solid var(--border);
    }
    .reaction-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 12px; border-radius: var(--radius-pill);
      font-size: 13px; border: 1.5px solid var(--border);
      background: var(--white); cursor: pointer; transition: all 0.2s;
      font-family: var(--font-body); font-weight: 600; color: var(--text-secondary);
    }
    .reaction-btn:hover { border-color: var(--primary); background: var(--primary-light); }
    .reaction-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }

    /* ── Report Menu ── */
    .story-menu-wrap { position: relative; }
    .story-menu-btn {
      background: none; border: none; cursor: pointer; padding: 4px 6px;
      border-radius: 6px; transition: background 0.2s; color: var(--text-light);
      display: flex; align-items: center; justify-content: center;
    }
    .story-menu-btn:hover { background: var(--bg-warm); color: var(--text-secondary); }
    .story-menu-dropdown {
      position: absolute; top: 100%; right: 0; z-index: 20;
      background: var(--white); border: 1px solid var(--border);
      border-radius: var(--radius-sm); box-shadow: var(--shadow-md);
      min-width: 160px; padding: 6px; margin-top: 4px;
    }
    .story-menu-item {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 10px 14px; border: none; background: none;
      font-size: 13px; font-weight: 600; color: #E53E3E; cursor: pointer;
      border-radius: 8px; transition: background 0.15s; font-family: var(--font-body);
      text-align: left;
    }
    .story-menu-item:hover { background: #FFF5F5; }
    .report-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      z-index: 200; display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .report-modal {
      background: var(--white); border-radius: 20px; padding: 36px;
      max-width: 420px; width: 100%; box-shadow: var(--shadow-lg);
      position: relative;
    }
    .report-modal h3 {
      font-family: var(--font-display); font-size: 22px; margin-bottom: 6px;
    }
    .report-modal .report-sub {
      font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;
    }
    .report-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .report-option {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
      cursor: pointer; transition: all 0.2s; background: var(--white);
      font-size: 14px; font-weight: 500; color: var(--text); text-align: left;
      font-family: var(--font-body); width: 100%;
    }
    .report-option:hover { border-color: var(--primary); background: var(--primary-light); }
    .report-option.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }
    .report-option .ro-radio {
      width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border);
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .report-option.selected .ro-radio {
      border-color: var(--primary);
    }
    .report-option.selected .ro-radio::after {
      content: ''; width: 10px; height: 10px; border-radius: 50%;
      background: var(--primary);
    }
    .report-actions { display: flex; gap: 10px; }
    .report-cancel {
      flex: 1; padding: 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
      background: var(--white); font-size: 14px; font-weight: 600; cursor: pointer;
      font-family: var(--font-body); color: var(--text-secondary); transition: all 0.2s;
    }
    .report-cancel:hover { background: var(--bg); }
    .report-submit {
      flex: 1; padding: 12px; border: none; border-radius: var(--radius-sm);
      background: #E53E3E; color: var(--white); font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: var(--font-body); transition: all 0.2s;
    }
    .report-submit:hover:not(:disabled) { background: #C53030; }
    .report-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .report-success {
      text-align: center; padding: 12px 0;
    }
    .report-success-icon {
      width: 48px; height: 48px; border-radius: 50%; background: #F0FFF4;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; color: #38A169;
    }
    .report-success p { font-size: 14px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5; }

    .value-props {
      max-width: var(--max-w); margin: 0 auto; padding: 0 24px 80px;
    }
    .value-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .value-card {
      background: var(--white); border-radius: 20px; padding: 36px 32px;
      border: 1px solid var(--border); text-align: center;
      transition: all 0.3s;
    }
    .value-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
    .value-icon { font-size: 36px; margin-bottom: 16px; }
    .value-card h3 { font-family: var(--font-display); font-size: 22px; margin-bottom: 10px; }
    .value-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

    .stats-section {
      background: var(--text); border-radius: 28px; max-width: var(--max-w);
      margin: 0 auto 80px; padding: 60px 40px;
      text-align: center; color: var(--white);
      margin-left: 24px; margin-right: 24px;
    }
    .stats-section h2 { font-family: var(--font-display); font-size: 32px; margin-bottom: 40px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; }
    .stat-item .stat-number {
      font-family: var(--font-display); font-size: 48px; line-height: 1;
      color: var(--accent); margin-bottom: 8px;
    }
    .stat-item .stat-label { font-size: 14px; color: rgba(255,255,255,0.6); font-weight: 500; }

    .newsletter-banner-wrap {
      max-width: var(--max-w); margin: 0 auto; padding: 0 24px 80px;
    }
    .newsletter-banner {
      background: var(--white); border-radius: 24px; padding: 40px 48px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 32px; flex-wrap: wrap;
      box-shadow: var(--shadow-lg); border: 1px solid var(--border);
    }
    .newsletter-banner-left h2 {
      font-family: var(--font-display); font-size: 28px; color: var(--text);
      margin-bottom: 6px;
    }
    .newsletter-banner-left p {
      font-size: 14px; color: var(--text-light); font-weight: 500;
    }
    .newsletter-banner-right {
      display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap;
    }
    .banner-email-input {
      padding: 12px 18px; border-radius: var(--radius-sm);
      border: 1.5px solid var(--border); font-size: 14px;
      font-family: var(--font-body); background: var(--bg);
      color: var(--text); min-width: 220px; transition: all 0.25s;
    }
    .banner-email-input:focus {
      outline: none; border-color: var(--primary);
      background: var(--white); box-shadow: 0 0 0 4px rgba(91,143,185,0.1);
    }
    .banner-email-input::placeholder { color: var(--text-light); }
    .banner-cta {
      padding: 12px 28px; border-radius: var(--radius-sm);
      background: var(--accent); color: var(--white);
      font-size: 14px; font-weight: 700; border: none; cursor: pointer;
      font-family: var(--font-body); transition: all 0.25s;
      white-space: nowrap; box-shadow: 0 2px 8px rgba(232,131,107,0.25);
    }
    .banner-cta:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); }
    .banner-cta:disabled { opacity: 0.5; cursor: not-allowed; }
    .banner-subscribed {
      display: flex; align-items: center; gap: 8px;
      color: #38A169; font-weight: 700; font-size: 15px;
    }

    .footer {
      background: #1E2A38; color: rgba(255,255,255,0.5); padding: 0;
    }
    .footer-main {
      max-width: var(--max-w); margin: 0 auto;
      padding: 56px 24px 40px;
      display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
    }
    .footer-brand .footer-logo {
      display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    }
    .footer-brand .footer-logo-text {
      font-family: var(--font-display); font-size: 20px; color: var(--white);
    }
    .footer-brand p {
      font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.45);
      max-width: 280px;
    }
    .footer-col h4 {
      font-size: 14px; font-weight: 700; color: var(--white);
      margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .footer-col ul li a, .footer-col ul li button {
      font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none;
      transition: color 0.2s; background: none; border: none; cursor: pointer;
      font-family: var(--font-body); padding: 0; text-align: left;
    }
    .footer-col ul li a:hover, .footer-col ul li button:hover { color: var(--white); }
    .footer-bottom {
      max-width: var(--max-w); margin: 0 auto;
      padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;
    }

    /* ── Subscribe Page ── */
    .subscribe-page {
      min-height: calc(100vh - 160px);
      display: flex; align-items: center; justify-content: center;
      padding: 60px 24px;
    }
    .subscribe-container {
      width: 100%; max-width: 460px; text-align: center;
    }
    .subscribe-icon-wrap {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-light), var(--primary-light));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 28px; color: var(--accent);
    }
    .subscribe-container h1 {
      font-family: var(--font-display); font-size: 36px;
      margin-bottom: 10px; line-height: 1.15;
    }
    .subscribe-container h1 em { font-style: italic; color: var(--accent); }
    .subscribe-container .subscribe-sub {
      font-size: 16px; color: var(--text-secondary); line-height: 1.6;
      margin-bottom: 36px; max-width: 380px; margin-left: auto; margin-right: auto;
    }
    .subscribe-form {
      display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;
    }
    .subscribe-input {
      width: 100%; padding: 16px 20px; border-radius: var(--radius); 
      border: 2px solid var(--border); font-size: 16px; font-family: var(--font-body);
      transition: all 0.25s; background: var(--white); color: var(--text);
    }
    .subscribe-input:focus {
      outline: none; border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(91,143,185,0.1);
    }
    .subscribe-input::placeholder { color: var(--text-light); }
    .subscribe-submit {
      width: 100%; padding: 16px; background: var(--accent); color: var(--white);
      border: none; border-radius: var(--radius); font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
      box-shadow: 0 4px 16px rgba(232,131,107,0.25);
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .subscribe-submit:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(232,131,107,0.3); }
    .subscribe-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .subscribe-fine { font-size: 13px; color: var(--text-light); }
    .subscribe-fine a { color: var(--primary-dark); text-decoration: none; font-weight: 600; }
    .subscribe-social-row {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin-bottom: 32px;
    }
    .subscribe-success {
      display: flex; flex-direction: column; align-items: center; gap: 20px;
    }
    .subscribe-success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: #F0FFF4; display: flex; align-items: center; justify-content: center;
      color: #38A169;
    }
    .subscribe-success h2 {
      font-family: var(--font-display); font-size: 30px;
    }
    .subscribe-success p {
      color: var(--text-secondary); font-size: 16px; line-height: 1.6; max-width: 340px;
    }
    .subscribe-success-btn {
      padding: 14px 32px; background: var(--accent); color: var(--white);
      border: none; border-radius: var(--radius-pill); font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
      margin-top: 8px;
    }
    .subscribe-success-btn:hover { background: var(--accent-dark); }

    /* ── Submit Story Page ── */
    .submit-page {
      min-height: calc(100vh - 160px);
      display: flex; align-items: center; justify-content: center;
      padding: 60px 24px;
    }
    .submit-page-inner {
      width: 100%; max-width: 540px;
    }
    .submit-page-card {
      background: var(--white); border-radius: 24px; padding: 48px;
      box-shadow: var(--shadow-lg); border: 1px solid var(--border);
      position: relative; overflow: hidden;
    }
    .submit-page-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--accent), var(--primary));
    }
    .submit-page-card h1 {
      font-family: var(--font-display); font-size: 36px; margin-bottom: 8px;
    }
    .submit-page-card .submit-page-sub {
      color: var(--text-secondary); margin-bottom: 28px; font-size: 15px; line-height: 1.5;
    }
    .submit-page-textarea {
      width: 100%; min-height: 160px; padding: 20px; border-radius: var(--radius);
      border: 2px solid var(--border); font-family: var(--font-body);
      font-size: 16px; line-height: 1.6; resize: vertical; color: var(--text);
      transition: all 0.25s; background: var(--bg);
    }
    .submit-page-textarea:focus {
      outline: none; border-color: var(--primary); background: var(--white);
      box-shadow: 0 0 0 4px rgba(91,143,185,0.1);
    }
    .submit-page-textarea::placeholder { color: var(--text-light); }
    .submit-page-count {
      text-align: right; font-size: 12px; font-weight: 600;
      color: var(--text-light); margin-top: 8px; margin-bottom: 20px;
    }
    .submit-page-count.warn { color: var(--accent); }
    .submit-page-count.over { color: #E53E3E; }
    .submit-page-btn {
      width: 100%; padding: 16px; background: var(--accent); color: var(--white);
      border: none; border-radius: var(--radius); font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
      box-shadow: 0 4px 16px rgba(232,131,107,0.25);
    }
    .submit-page-btn:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(232,131,107,0.3); }
    .submit-page-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .submit-page-fine { text-align: center; font-size: 12px; color: var(--text-light); margin-top: 16px; }
    .submit-page-social {
      margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 16px;
      padding-top: 28px; border-top: 1px solid var(--border);
    }
    .submit-page-social-stats {
      display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
    }
    .submit-page-stat {
      text-align: center;
    }
    .submit-page-stat .sp-num {
      font-family: var(--font-display); font-size: 24px; color: var(--text); line-height: 1;
    }
    .submit-page-stat .sp-label {
      font-size: 12px; color: var(--text-light); font-weight: 500; margin-top: 4px;
    }
    .submit-page-result {
      margin-top: 20px; padding: 16px 20px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 500; display: flex; align-items: flex-start; gap: 10px;
    }
    .submit-page-result.approved { background: #F0FFF4; color: #276749; border: 1px solid #C6F6D5; }
    .submit-page-result.rejected { background: #FFF5F5; color: #9B2C2C; border: 1px solid #FED7D7; }

    /* ── Post-Submit Confirmation ── */
    .submit-confirm {
      text-align: center;
    }
    .submit-confirm-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: #F0FFF4; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px; color: #38A169;
    }
    .submit-confirm-icon svg { width: 36px; height: 36px; }
    .submit-confirm h1 {
      font-family: var(--font-display); font-size: 32px; margin-bottom: 8px;
    }
    .submit-confirm .confirm-sub {
      color: var(--text-secondary); font-size: 15px; line-height: 1.6;
      margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;
    }
    .submit-confirm-preview {
      background: var(--bg); border-radius: var(--radius); padding: 20px 24px;
      text-align: left; margin-bottom: 32px; border: 1px solid var(--border);
    }
    .submit-confirm-preview .preview-tag {
      display: inline-block; font-size: 10px; font-weight: 700;
      padding: 3px 10px; border-radius: var(--radius-pill);
      background: var(--primary-light); color: var(--primary-dark);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
    }
    .submit-confirm-preview h3 {
      font-family: var(--font-display); font-size: 18px; margin-bottom: 8px;
    }
    .submit-confirm-preview p {
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
    }
    .confirm-divider {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 28px; color: var(--text-light); font-size: 12px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .confirm-divider::before, .confirm-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }
    .account-prompt-card {
      background: var(--white); border-radius: 20px; padding: 32px;
      border: 1px solid var(--border); box-shadow: var(--shadow-sm);
      text-align: center;
    }
    .account-prompt-card .ap-icon {
      font-size: 32px; margin-bottom: 12px;
    }
    .account-prompt-card h3 {
      font-family: var(--font-display); font-size: 22px; margin-bottom: 8px;
    }
    .account-prompt-card .ap-sub {
      font-size: 14px; color: var(--text-secondary); line-height: 1.6;
      margin-bottom: 20px; max-width: 340px; margin-left: auto; margin-right: auto;
    }
    .account-prompt-form {
      display: flex; flex-direction: column; gap: 12px; max-width: 360px; margin: 0 auto;
    }
    .account-prompt-btn {
      width: 100%; padding: 14px; background: var(--primary); color: var(--white);
      border: none; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.25s; font-family: var(--font-body);
    }
    .account-prompt-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
    .account-prompt-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .account-skip {
      background: none; border: none; color: var(--text-light); font-size: 13px;
      font-weight: 600; cursor: pointer; font-family: var(--font-body);
      padding: 8px; transition: color 0.2s; margin-top: 4px;
    }
    .account-skip:hover { color: var(--text-secondary); }
    .account-features {
      display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .account-feature {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-secondary); font-weight: 500;
    }
    .account-feature .af-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--primary); flex-shrink: 0;
    }
    .account-created-msg {
      display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 8px 0;
    }
    .account-created-msg .ac-check {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--primary-light); color: var(--primary-dark);
      display: flex; align-items: center; justify-content: center;
    }
    .account-created-msg p {
      font-size: 14px; color: var(--text-secondary);
    }
    .account-created-msg strong {
      font-size: 16px; color: var(--text);
    }

    /* ── Library Page ── */
    .library-page { max-width: var(--max-w); margin: 0 auto; padding: 40px 24px 80px; }
    .library-page h1 { font-family: var(--font-display); font-size: 40px; margin-bottom: 8px; }
    .library-page .subtitle { color: var(--text-secondary); margin-bottom: 32px; font-size: 16px; }
    .library-section {
      margin-bottom: 48px;
    }
    .library-section-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 8px;
    }
    .library-section-header h2 {
      font-family: var(--font-display); font-size: 28px;
    }
    .library-section-header .section-date {
      font-size: 13px; color: var(--text-light); font-weight: 600;
    }
    .library-divider {
      height: 1px; background: var(--border); margin-bottom: 40px;
    }
    .library-search {
      display: flex; align-items: center; gap: 10px;
      background: var(--white); border: 1.5px solid var(--border);
      border-radius: var(--radius-pill); padding: 10px 20px; margin-bottom: 20px;
      transition: border-color 0.2s; max-width: 480px;
    }
    .library-search:focus-within { border-color: var(--primary); }
    .library-search input {
      flex: 1; border: none; outline: none; font-size: 15px;
      font-family: var(--font-body); background: transparent; color: var(--text);
    }
    .library-search input::placeholder { color: var(--text-light); }
    .library-search svg { color: var(--text-light); flex-shrink: 0; }
    .theme-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
    .theme-chip {
      padding: 8px 18px; border-radius: var(--radius-pill); font-size: 13px;
      font-weight: 600; border: 1.5px solid var(--border); background: var(--white);
      cursor: pointer; transition: all 0.2s; font-family: var(--font-body); color: var(--text-secondary);
    }
    .theme-chip:hover { border-color: var(--primary); color: var(--primary-dark); }
    .theme-chip.active { background: var(--primary); color: var(--white); border-color: var(--primary); }

    .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); margin: 5px 0; border-radius: 2px; transition: all 0.3s; }
    .mobile-menu { display: none; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-in { animation: fadeUp 0.5s ease forwards; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
    .delay-3 { animation-delay: 0.3s; opacity: 0; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spinner {
      width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .nav-links.open {
        display: flex; flex-direction: column; position: absolute;
        top: 100%; left: 0; right: 0; background: var(--white);
        padding: 16px 24px; border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow-md); gap: 8px;
      }
      .hamburger { display: block; }
      .hero h1 { font-size: 36px; }
      .hero { padding: 48px 24px 40px; grid-template-columns: 1fr; gap: 32px; }
      .hero-illustration { display: none; }
      .hero-illustration-inner { max-width: 340px; margin: 0 auto; }
      .hero-content { text-align: left; }
      .hero-email-form { padding: 4px 4px 4px 16px; }
      .hero-email-btn { padding: 10px 16px; font-size: 13px; }
      .hero-social-proof { flex-direction: column; gap: 6px; }
      .submit-card { padding: 32px 24px; }
      .submit-page-card { padding: 32px 24px; }
      .submit-page-social-stats { gap: 16px; }
      .stats-section { margin-left: 16px; margin-right: 16px; padding: 40px 24px; }
      .stat-item .stat-number { font-size: 36px; }
      .stories-grid { grid-template-columns: 1fr; }
      .footer-main { grid-template-columns: 1fr; gap: 32px; }
      .newsletter-banner { padding: 32px 24px; flex-direction: column; align-items: flex-start; text-align: left; }
      .banner-email-input { min-width: 0; width: 100%; }
      .newsletter-banner-right { width: 100%; }
    }
  `;

  // ── Render ──
  return (
    <div>
      <style>{css}</style>

      {/* Navigation */}
      <nav className={`nav ${navShadow ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => { setPage("home"); setMobileMenuOpen(false); }}>
            <span className="nav-logo-icon"><HeartIcon size={26} fill="#E8836B" color="#E8836B" /></span>
            <span className="nav-logo-text">DatingTales</span>
          </div>
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span /><span /><span />
          </button>
          <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            <button className="nav-link" onClick={() => { setPage("library"); setMobileMenuOpen(false); }}>Story library</button>
            <button className="nav-link" onClick={() => { setPage("subscribe"); setMobileMenuOpen(false); window.scrollTo(0, 0); }}><MailIcon /> Subscribe</button>
            <button className="nav-cta" onClick={() => { setPage("submit"); setMobileMenuOpen(false); window.scrollTo(0, 0); }}>Share your story <ArrowIcon /></button>
          </div>
        </div>
      </nav>

      {page === "home" ? (
        <>
          {/* Hero */}
          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge animate-in">
                <HeartIcon size={14} fill="#E8836B" color="#E8836B" />
                New stories drop every Friday
              </div>
              <h1 className="animate-in delay-1">Share the story.<br /><em>Laugh together.</em></h1>
              <p className="hero-sub animate-in delay-2">Anonymous dating stories, delivered every Friday. Because dating is better when we're all in on the joke.</p>
              <div className="hero-email-capture animate-in delay-3">
                {subscribed ? (
                  <div className="hero-subscribed-inline">
                    <CheckIcon /> You're in — see you Friday!
                  </div>
                ) : (
                  <div className="hero-email-form">
                    <input
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) setSubscribed(true); }}
                    />
                    <button
                      className="hero-email-btn"
                      onClick={() => { if (email.includes("@")) setSubscribed(true); }}
                      disabled={!email.includes("@")}
                    >
                      Join the drop <ArrowIcon />
                    </button>
                  </div>
                )}
                <div className="hero-social-proof">
                  <div className="avatar-stack">
                    <div className="avatar a1">S</div>
                    <div className="avatar a2">M</div>
                    <div className="avatar a3">J</div>
                    <div className="avatar a4">R</div>
                    <div className="avatar a5">K</div>
                  </div>
                  <span className="hero-social-text">
                    Join <strong>2,500+ readers</strong> who get stories every Friday
                  </span>
                </div>
              </div>
            </div>
            <div className="hero-illustration animate-in delay-2">
              <div className="hero-illustration-inner">
                <div className="hero-card-float card-1">
                  <span className="hcf-tag">First Dates</span>
                  <div className="hcf-title">The Spaghetti Incident</div>
                  <div className="hcf-text">Ordered spaghetti to seem cultured. Sauce on my forehead, noodle on my chin...</div>
                  <div className="hcf-reactions"><span>😂 89</span><span>❤️ 45</span></div>
                </div>
                <div className="hero-card-float card-2">
                  <span className="hcf-tag">Meet Cutes</span>
                  <div className="hcf-title">Dog Park Destiny</div>
                  <div className="hcf-text">My dog knocked his coffee everywhere. He looked at me and said "worth it."</div>
                  <div className="hcf-reactions"><span>❤️ 95</span><span>✨ 41</span></div>
                </div>
                <div className="hero-card-float card-3">
                  <span className="hcf-tag">Situationships</span>
                  <div className="hcf-title">The Label Talk</div>
                  <div className="hcf-text">"I like what we have." "What do we have?" "This conversation is a great example."</div>
                  <div className="hcf-reactions"><span>😂 134</span><span>💀 67</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Section */}
          <section className="submit-section" ref={submitRef}>
            <div className="submit-card">
              <h2>Spill it. Anonymously.</h2>
              <p className="subtitle">Your story stays between us (and a few thousand readers).</p>
              <div className="textarea-wrap">
                <textarea
                  value={storyText}
                  onChange={e => setStoryText(e.target.value.slice(0, 600))}
                  placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                  maxLength={600}
                />
                <span className={`char-count ${storyText.length > 500 ? "over" : storyText.length > 400 ? "warn" : ""}`}>
                  {storyText.length}/500
                </span>
              </div>
              <button
                className="submit-btn"
                onClick={handleSubmitStory}
                disabled={!storyText.trim() || submitting}
              >
                {submitting ? <><span className="spinner" /> Our AI is polishing your tale...</> : "Submit story"}
              </button>
              <p className="submit-fine-print">All stories are anonymized and lightly edited by AI for clarity and safety.</p>
              {submitResult && (
                <div className={`submit-result ${submitResult.type}`}>
                  {submitResult.type === "approved" ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <CheckIcon /> <strong>Your DatingTale is in!</strong>
                      </div>
                      Your tale has been anonymized and queued for this week's drop. All stories are reviewed before publishing — if everything checks out, yours will be included this Friday.
                    </div>
                  ) : (
                    <div>We couldn't publish this one — but we'd love a lighter version! {submitResult.message}</div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* This Week's Drop */}
          <section className="weekly-drop">
            <div className="section-header">
              <div>
                <h2>This week's drop</h2>
                <p className="section-sub">Fresh stories from the dating trenches — Feb 7, 2026</p>
              </div>
              <button className="view-all" onClick={() => setPage("library")}>
                View all stories <ArrowIcon />
              </button>
            </div>
            <div className="stories-grid">
              {thisWeekStories.slice(0, 4).map((story, i) => (
                <StoryCard key={story.id} story={story} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} delay={i} />
              ))}
            </div>
          </section>

          {/* Value Props */}
          <section className="value-props">
            <div className="value-grid">
              <div className="value-card">
                <div className="value-icon">✨</div>
                <h3>Spill it, anonymously</h3>
                <p>Funny, cringe, or cute — we pick the best stories and share them safely. No names, no judgment, just great tales.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💌</div>
                <h3>Everyone's welcome</h3>
                <p>Single, taken, situationship — all stories belong here. If you've ever been on a date, you're one of us.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">😂</div>
                <h3>Need a laugh?</h3>
                <p>Perfect for anyone living vicariously through dating drama. New stories every Friday to get you through the weekend.</p>
              </div>
            </div>
          </section>

          {/* Newsletter Banner */}
          <section className="newsletter-banner-wrap">
            <div className="newsletter-banner">
              <div className="newsletter-banner-left">
                <h2>New stories drop this Friday</h2>
                <p>One email a week. All laughs, no strings.</p>
              </div>
              <div className="newsletter-banner-right">
                {subscribed ? (
                  <div className="banner-subscribed"><CheckIcon /> You're in!</div>
                ) : (
                  <>
                    <input
                      className="banner-email-input"
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) setSubscribed(true); }}
                    />
                    <button
                      className="banner-cta"
                      onClick={() => { if (email.includes("@")) setSubscribed(true); }}
                      disabled={!email.includes("@")}
                    >
                      Join the drop
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      ) : page === "subscribe" ? (
        /* ── Subscribe Page ── */
        <div className="subscribe-page">
          <div className="subscribe-container">
            {subscribed ? (
              <div className="subscribe-success animate-in">
                <div className="subscribe-success-icon">
                  <CheckIcon />
                </div>
                <h2>You're in!</h2>
                <p>Welcome to the community. Your first batch of stories lands in your inbox this Friday.</p>
                <button className="subscribe-success-btn" onClick={() => setPage("home")}>
                  Browse This Week's Stories
                </button>
              </div>
            ) : (
              <>
                <div className="subscribe-icon-wrap animate-in">
                  <HeartIcon size={32} fill="#E8836B" color="#E8836B" />
                </div>
                <h1 className="animate-in delay-1">Get stories every <em>Friday</em></h1>
                <p className="subscribe-sub animate-in delay-2">The funniest, cringiest, and cutest anonymous dating tales — curated and delivered to your inbox weekly.</p>
                <div className="subscribe-social-row animate-in delay-2">
                  <div className="avatar-stack">
                    <div className="avatar a1">S</div>
                    <div className="avatar a2">M</div>
                    <div className="avatar a3">J</div>
                    <div className="avatar a4">R</div>
                    <div className="avatar a5">K</div>
                  </div>
                  <span className="hero-social-text">
                    <strong>2,500+</strong> readers every Friday
                  </span>
                </div>
                <div className="subscribe-form animate-in delay-3">
                  <input
                    className="subscribe-input"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) setSubscribed(true); }}
                  />
                  <button
                    className="subscribe-submit"
                    onClick={() => { if (email.includes("@")) setSubscribed(true); }}
                    disabled={!email.includes("@")}
                  >
                    Subscribe — it's free
                  </button>
                </div>
                <p className="subscribe-fine animate-in delay-3">No spam, ever. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </div>
      ) : page === "submit" ? (
        /* ── Submit Story Page ── */
        <div className="submit-page">
          <div className="submit-page-inner">
            {submitResult?.type === "approved" ? (
              /* ── Post-Submit Confirmation ── */
              <div className="submit-confirm animate-in">
                <div className="submit-confirm-icon">
                  <CheckIcon />
                </div>
                <h1>Your DatingTale is in!</h1>
                <p className="confirm-sub">It's been anonymized, polished, and queued for review. All stories are reviewed before publishing — if everything checks out, yours will be included this Friday.</p>
                <div className="submit-confirm-preview">
                  <span className="preview-tag">{submitResult.story.theme}</span>
                  <h3>{submitResult.story.title}</h3>
                  <p>{submitResult.story.text}</p>
                  <div className="story-signoff" style={{ marginBottom: 0, marginTop: 12 }}>— {submitResult.story.author}</div>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => { setSubmitResult(null); setStoryText(""); }}>
                    Submit another story
                  </button>
                  <button className="btn-secondary" onClick={() => { setPage("library"); setSubmitResult(null); window.scrollTo(0, 0); }}>
                    Browse stories
                  </button>
                </div>
              </div>
            ) : (
              /* ── Submit Form ── */
              <div className="submit-page-card animate-in">
                <h1>Spill it. Anonymously.</h1>
                <p className="submit-page-sub">Your story stays between us (and a few thousand readers).</p>
                <div>
                  <textarea
                    className="submit-page-textarea"
                    value={storyText}
                    onChange={e => setStoryText(e.target.value.slice(0, 600))}
                    placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                    maxLength={600}
                  />
                  <div className={`submit-page-count ${storyText.length > 500 ? "over" : storyText.length > 400 ? "warn" : ""}`}>
                    {storyText.length}/500
                  </div>
                </div>
                <button
                  className="submit-page-btn"
                  onClick={handleSubmitStory}
                  disabled={!storyText.trim() || submitting}
                >
                  {submitting ? <><span className="spinner" /> Our AI is polishing your tale...</> : "Submit story"}
                </button>
                <p className="submit-page-fine">All stories are anonymized and lightly edited by AI for clarity and safety.</p>
                {submitResult?.type === "rejected" && (
                  <div className="submit-page-result rejected">
                    <div>We couldn't publish this one — but we'd love a lighter version! {submitResult.message}</div>
                  </div>
                )}
                <div className="submit-page-social">
                  <div className="hero-social-proof" style={{ marginBottom: 4 }}>
                    <div className="avatar-stack">
                      <div className="avatar a1">S</div>
                      <div className="avatar a2">M</div>
                      <div className="avatar a3">J</div>
                      <div className="avatar a4">R</div>
                      <div className="avatar a5">K</div>
                    </div>
                    <span className="hero-social-text">
                      Join <strong>150+ storytellers</strong> who've shared
                    </span>
                  </div>
                  <div className="submit-page-social-stats">
                    <div className="submit-page-stat">
                      <div className="sp-num">2,500+</div>
                      <div className="sp-label">Weekly readers</div>
                    </div>
                    <div className="submit-page-stat">
                      <div className="sp-num">150+</div>
                      <div className="sp-label">Stories shared</div>
                    </div>
                    <div className="submit-page-stat">
                      <div className="sp-num">98%</div>
                      <div className="sp-label">Laugh guarantee</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Library Page ── */
        <div className="library-page">
          <h1>Story library</h1>
          <p className="subtitle">Every tale ever told. Search, filter, and enjoy.</p>

          {/* This Week's Drop */}
          {thisWeekStories.length > 0 && (
            <div className="library-section">
              <div className="library-section-header">
                <h2>This week's drop</h2>
                <span className="section-date">Feb 7, 2026</span>
              </div>
              <div className="stories-grid">
                {thisWeekStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} delay={i} />
                ))}
              </div>
            </div>
          )}

          <div className="library-divider" />

          {/* All Stories */}
          <div className="library-section">
            <div className="library-section-header">
              <h2>All stories</h2>
            </div>

            <div className="library-search">
              <SearchIcon />
              <input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="theme-chips">
              <button className={`theme-chip ${!activeTheme ? "active" : ""}`} onClick={() => setActiveTheme(null)}>All</button>
              {THEMES.map(t => (
                <button key={t} className={`theme-chip ${activeTheme === t ? "active" : ""}`} onClick={() => setActiveTheme(activeTheme === t ? null : t)}>{t}</button>
              ))}
            </div>

            {filteredStories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 16, fontWeight: 600 }}>No stories found</p>
                <p style={{ fontSize: 14, marginTop: 4 }}>Try a different search or filter.</p>
              </div>
            ) : (
              <div className="stories-grid">
                {filteredStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} delay={i % 6} />
                ))}
              </div>
            )}
          </div>

          {/* Library Newsletter Banner */}
          <div className="newsletter-banner" style={{ marginTop: 48 }}>
            <div className="newsletter-banner-left">
              <h2>New stories drop this Friday</h2>
              <p>One email a week. All laughs, no strings.</p>
            </div>
            <div className="newsletter-banner-right">
              {subscribed ? (
                <div className="banner-subscribed"><CheckIcon /> You're in!</div>
              ) : (
                <>
                  <input
                    className="banner-email-input"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) setSubscribed(true); }}
                  />
                  <button
                    className="banner-cta"
                    onClick={() => { if (email.includes("@")) setSubscribed(true); }}
                    disabled={!email.includes("@")}
                  >
                    Join the drop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <HeartIcon size={22} fill="#E8836B" color="#E8836B" />
              <span className="footer-logo-text">DatingTales</span>
            </div>
            <p>Anonymous dating stories, delivered every Friday. Because dating is better when we're all in on the joke.</p>
          </div>
          <div className="footer-col">
            <h4>Quick links</h4>
            <ul>
              <li><button onClick={() => { setPage("submit"); window.scrollTo(0, 0); }}>Submit story</button></li>
              <li><button onClick={() => { setPage("library"); window.scrollTo(0, 0); }}>Story library</button></li>
              <li><button onClick={() => { setPage("subscribe"); window.scrollTo(0, 0); }}>Subscribe</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Terms of service</a></li>
              <li><a href="#">Contact us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 DatingTales. All rights reserved. Made with love and bad date stories.
        </div>
      </footer>
    </div>
  );
}

// ── Report Reasons ──
const REPORT_REASONS = [
  "Inappropriate or explicit content",
  "Hate speech or discrimination",
  "Contains personal information",
  "Harassment or bullying",
  "Spam or fake story",
];

// ── Story Card Component ──
function StoryCard({ story, onReaction, onReport, reacted, delay = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportStep, setReportStep] = useState(null); // null | "select" | "done"
  const [selectedReason, setSelectedReason] = useState(null);
  const [pendingReport, setPendingReport] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSubmitReport = () => {
    if (!selectedReason) return;
    setPendingReport(true);
    setReportStep("done");
  };

  const handleCloseReport = () => {
    setReportStep(null);
    setSelectedReason(null);
    if (pendingReport) {
      onReport(story.id, selectedReason);
      setPendingReport(false);
    }
  };

  return (
    <>
      <div className={`story-card animate-in delay-${Math.min(delay + 1, 3)}`}>
        <div className="story-card-header">
          <h3>{story.title}</h3>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
            {story.trending && (
              <span className="story-tag trending"><TrendingIcon /> Trending</span>
            )}
            <div className="story-menu-wrap" ref={menuRef}>
              <button className="story-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <EllipsisIcon />
              </button>
              {menuOpen && (
                <div className="story-menu-dropdown">
                  <button className="story-menu-item" onClick={() => { setMenuOpen(false); setReportStep("select"); }}>
                    <FlagIcon /> Report Story
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="story-tag theme">{story.theme}</span>
        </div>
        <p className="story-text">{story.text}</p>
        <div className="story-signoff">— {story.author}</div>
        <div className="story-reactions">
          {EMOJI_OPTIONS.map(emoji => {
            const count = story.reactions?.[emoji] || 0;
            const isActive = reacted[`${story.id}-${emoji}`];
            return (
              <button
                key={emoji}
                className={`reaction-btn ${isActive ? "active" : ""}`}
                onClick={() => onReaction(story.id, emoji)}
              >
                {emoji} {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Modal */}
      {reportStep && (
        <div className="report-overlay" onClick={(e) => { if (e.target === e.currentTarget) { if (reportStep === "done") handleCloseReport(); else { setReportStep(null); setSelectedReason(null); } } }}>
          <div className="report-modal">
            {reportStep === "select" ? (
              <>
                <h3>Report this story</h3>
                <p className="report-sub">Help us keep DatingTales safe. Why are you reporting this?</p>
                <div className="report-options">
                  {REPORT_REASONS.map(reason => (
                    <button
                      key={reason}
                      className={`report-option ${selectedReason === reason ? "selected" : ""}`}
                      onClick={() => setSelectedReason(reason)}
                    >
                      <span className="ro-radio" />
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="report-actions">
                  <button className="report-cancel" onClick={() => { setReportStep(null); setSelectedReason(null); }}>Cancel</button>
                  <button className="report-submit" onClick={handleSubmitReport} disabled={!selectedReason}>Submit report</button>
                </div>
              </>
            ) : (
              <div className="report-success">
                <div className="report-success-icon"><CheckIcon /></div>
                <h3>Thanks for letting us know</h3>
                <p>We've received your report and will review this story. It's been removed from your feed.</p>
                <button
                  className="report-cancel"
                  style={{ marginTop: 20, width: "100%" }}
                  onClick={handleCloseReport}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
