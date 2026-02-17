"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── Supabase Config ──
const SUPABASE_URL = "https://vopnqpulwbofvbyztcta.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG5xcHVsd2JvZnZieXp0Y3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjM1MDEsImV4cCI6MjA4NjQzOTUwMX0.eHiT32WgGqJcO--htiAFR5gpWIgET28j2j3_ZCKmzkY";

// ── Icons ──
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const FlagIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const ShareIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-7-7v4C7 9 4 14 3 19c2.5-3.5 6-5.1 11-5.1V18l7-6z"/></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// ── Fallback Stories ──
const SAMPLE_STORIES = [
  { id: 1, title: "The Great Spaghetti Incident", theme: "First Dates", author: "Pasta Enthusiast", text: "Ordered spaghetti on a first date to seem 'cultured.' Twirled too aggressively. Sauce on my forehead, noodle on my chin. He said 'you've got a little something' and gestured at my entire face. We've been together two years now.", publishedAt: "2026-02-07", reactions: { "😂": 89, "❤️": 45, "😬": 23 }, tags: "spaghetti,pasta,food,dinner,restaurant,italian,messy,embarrassing,funny,sauce,date,first date,cute,together" },
  { id: 2, title: "Autocorrect Strikes Again", theme: "Dating App Disasters", author: "Typo Queen", text: "Tried to text my date 'I'm on my way, can't wait!' Autocorrect changed it to 'I'm on my way, can't walk!' He showed up with a wheelchair he borrowed from his grandma.", publishedAt: "2026-02-07", reactions: { "😂": 112, "❤️": 18, "😬": 67 } , tags: "texting,text,autocorrect,phone,message,typo,funny,hilarious,wheelchair,grandma,embarrassing,sweet" },
  { id: 3, title: "The Dog Park Meet-Cute", theme: "Meet Cutes", author: "Golden Retriever Parent", text: "My dog ran full speed into a stranger at the park, knocked his coffee everywhere. I ran over apologizing. He looked at my dog, looked at me, and said 'worth it.' We now share custody of three dogs.", publishedAt: "2026-02-07", reactions: { "❤️": 95, "😂": 34, "✨": 41 } , tags: "dog,dogs,puppy,puppies,pup,pet,park,coffee,cute,sweet,romantic,meet cute,golden retriever,animal" },
  { id: 4, title: "Mom's Interrogation Protocol", theme: "Meeting the Family", author: "Nervous Wreck", text: "Brought my date to meet my mom. Within five minutes she'd pulled out my baby photos, asked about his credit score, and offered him my grandmother's ring.", publishedAt: "2026-02-07", reactions: { "😂": 72, "😬": 44, "❤️": 12 } , tags: "mom,mother,parent,family,meeting,baby photos,embarrassing,funny,ring,awkward,nervous,interrogation" },
  { id: 5, title: "The Label Conversation", theme: "Situationships", author: "Hopeless Romantic", text: "After four months of 'hanging out' I finally asked where we stood. He said 'I really like what we have.' I said 'what do we have?' He said 'this conversation is a great example.'", publishedAt: "2026-01-31", reactions: { "😂": 134, "😬": 89, "💀": 67 } , tags: "situationship,relationship,label,define,commitment,hanging out,funny,frustrating,conversation,what are we" },
  { id: 6, title: "Wrong Table, Right Person", theme: "Awkward Moments", author: "Latte Lover", text: "Showed up to a blind date at a coffee shop. Sat down across from someone, chatted for ten minutes. Turns out it wasn't my date — just a very friendly stranger. My actual date watched the whole thing from two tables over.", publishedAt: "2026-01-31", reactions: { "❤️": 88, "😂": 56, "✨": 73 } , tags: "coffee,cafe,coffee shop,blind date,stranger,awkward,embarrassing,funny,wrong person,mistaken identity" },
  { id: 7, title: "The Zoom Background Betrayal", theme: "Dating App Disasters", author: "Remote Worker", text: "Had a video date. Used a fancy apartment as my virtual background. Cat jumped on my desk and knocked my laptop, revealing my actual studio apartment with laundry everywhere.", publishedAt: "2026-01-31", reactions: { "😂": 78, "❤️": 22, "😬": 31 } , tags: "zoom,video call,virtual,cat,kitten,pet,apartment,laundry,embarrassing,funny,work from home,background,laptop" },
  { id: 8, title: "Uber Driver Played Cupid", theme: "Meet Cutes", author: "Backseat Romantic", text: "Shared a pool ride with a stranger. Driver kept 'accidentally' taking wrong turns to extend the trip. We talked for forty minutes. As we got out, the driver handed us both a receipt that said 'you're welcome.'", publishedAt: "2026-01-31", reactions: { "❤️": 121, "✨": 56, "😂": 43 } , tags: "uber,lyft,rideshare,car,driving,stranger,romantic,sweet,cute,meet cute,cupid,funny,ride" },
];

const THEMES = ["First Dates", "Meet Cutes", "Dating App Disasters", "Awkward Moments", "Meeting the Family", "Situationships"];
const EMOJI_OPTIONS = ["😂", "❤️", "😬", "✨", "💀"];
const REPORT_REASONS = ["Inappropriate or explicit content", "Hate speech or discrimination", "Contains personal information", "Harassment or bullying", "Spam or fake story"];

// ── Synonym Map for Smart Search ──
const SYNONYM_MAP = {
  dog: ["puppy", "puppies", "pup", "pups", "doggo", "canine", "pet"],
  puppy: ["dog", "puppies", "pup", "pups", "doggo", "canine", "pet"],
  cat: ["kitten", "kitty", "feline", "pet"],
  kitten: ["cat", "kitty", "feline", "pet"],
  bar: ["pub", "club", "nightclub", "drinks", "cocktail", "lounge"],
  club: ["bar", "nightclub", "pub", "lounge", "dancing"],
  coffee: ["cafe", "latte", "espresso", "starbucks", "tea"],
  cafe: ["coffee", "latte", "espresso", "coffeeshop"],
  restaurant: ["dinner", "dining", "food", "meal", "brunch", "lunch"],
  dinner: ["restaurant", "dining", "food", "meal", "supper"],
  brunch: ["breakfast", "lunch", "restaurant", "food", "meal"],
  text: ["texting", "message", "dm", "sms", "chat"],
  texting: ["text", "message", "dm", "sms", "chat"],
  phone: ["call", "facetime", "text", "mobile", "cell"],
  kiss: ["kissing", "makeout", "smooch", "peck"],
  kissing: ["kiss", "makeout", "smooch"],
  ex: ["breakup", "ex-boyfriend", "ex-girlfriend", "former", "past"],
  breakup: ["ex", "split", "dumped", "ended"],
  crush: ["like", "into", "feelings", "attraction"],
  tinder: ["bumble", "hinge", "dating app", "swipe", "match"],
  bumble: ["tinder", "hinge", "dating app", "swipe", "match"],
  hinge: ["tinder", "bumble", "dating app", "swipe", "match"],
  awkward: ["cringe", "cringey", "embarrassing", "uncomfortable", "weird"],
  cringe: ["awkward", "cringey", "embarrassing", "uncomfortable"],
  embarrassing: ["awkward", "cringe", "mortifying", "humiliating"],
  funny: ["hilarious", "lol", "comedy", "laugh", "humor"],
  hilarious: ["funny", "lol", "comedy", "laugh"],
  sweet: ["cute", "romantic", "adorable", "wholesome", "lovely"],
  cute: ["sweet", "romantic", "adorable", "wholesome"],
  romantic: ["sweet", "cute", "love", "romance", "dreamy"],
  scary: ["terrifying", "creepy", "horror", "frightening", "spooky"],
  creepy: ["scary", "weird", "uncomfortable", "unsettling"],
  drunk: ["drinking", "wasted", "tipsy", "hammered", "alcohol", "wine", "beer"],
  drinking: ["drunk", "alcohol", "wine", "beer", "cocktail", "bar"],
  car: ["driving", "uber", "lyft", "ride"],
  movie: ["movies", "film", "theater", "cinema", "netflix"],
  wedding: ["married", "marriage", "engaged", "engagement", "proposal"],
  parent: ["parents", "mom", "dad", "mother", "father", "family"],
  mom: ["mother", "parent", "mama", "family"],
  dad: ["father", "parent", "papa", "family"],
  friend: ["friends", "buddy", "bestie", "bff", "pal"],
  work: ["job", "office", "coworker", "colleague", "boss"],
  gym: ["workout", "exercise", "fitness", "lifting", "running"],
  beach: ["ocean", "sea", "swimming", "sand", "surf"],
  travel: ["trip", "vacation", "flight", "airport", "abroad"],
  cook: ["cooking", "kitchen", "recipe", "chef", "baking"],
  hiking: ["hike", "trail", "nature", "outdoors", "walk"],
  concert: ["music", "show", "gig", "festival", "band"],
};

function stem(word) {
  const w = word.toLowerCase();
  const roots = new Set([w]);
  if (w.endsWith("ing")) roots.add(w.slice(0, -3)).add(w.slice(0, -3) + "e");
  if (w.endsWith("ed")) roots.add(w.slice(0, -2)).add(w.slice(0, -2) + "e");
  if (w.endsWith("s") && !w.endsWith("ss")) roots.add(w.slice(0, -1));
  if (w.endsWith("es")) roots.add(w.slice(0, -2));
  if (w.endsWith("ies")) roots.add(w.slice(0, -3) + "y");
  if (w.endsWith("ly")) roots.add(w.slice(0, -2));
  if (w.endsWith("er")) roots.add(w.slice(0, -2)).add(w.slice(0, -2) + "e");
  roots.add(w + "s"); roots.add(w + "ing"); roots.add(w + "ed"); roots.add(w + "er");
  if (w.endsWith("e")) { roots.add(w.slice(0, -1) + "ing"); roots.add(w.slice(0, -1) + "er"); }
  if (w.endsWith("y")) roots.add(w.slice(0, -1) + "ies");
  return [...roots].filter(r => r.length > 1);
}

function expandSearch(query) {
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);
  const expanded = new Set();
  terms.forEach(term => {
    const stemmed = stem(term);
    stemmed.forEach(s => expanded.add(s));
    stemmed.forEach(s => {
      if (SYNONYM_MAP[s]) {
        SYNONYM_MAP[s].forEach(syn => expanded.add(syn));
      }
    });
  });
  return [...expanded];
}

// ── Auth Helpers ──
function getStoredAuth() {
  try {
    const stored = localStorage.getItem("dt_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.user && parsed.access_token) return parsed;
    }
  } catch {}
  return null;
}

function storeAuth(authData) {
  try { localStorage.setItem("dt_auth", JSON.stringify(authData)); } catch {}
}

function clearAuth() {
  try { localStorage.removeItem("dt_auth"); } catch {}
}

function getUnlinkedStoryIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("dt_unlinked_stories") || "[]");
    return Array.isArray(ids) ? ids : [];
  } catch { return []; }
}

function addUnlinkedStoryId(id) {
  try {
    const ids = getUnlinkedStoryIds();
    if (!ids.includes(id)) ids.push(id);
    localStorage.setItem("dt_unlinked_stories", JSON.stringify(ids));
  } catch {}
}

function clearUnlinkedStoryIds() {
  try { localStorage.removeItem("dt_unlinked_stories"); } catch {}
}

// ── Story Card Component ──
function StoryCard({ story, onReaction, onReport, reacted }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportStep, setReportStep] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [pendingReport, setPendingReport] = useState(false);
  const [shared, setShared] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSubmitReport = () => { if (!selectedReason) return; setPendingReport(true); setReportStep("done"); };
  const handleCloseReport = () => { setReportStep(null); if (pendingReport) { onReport(story.id, selectedReason); } setSelectedReason(null); setPendingReport(false); };

  const handleShare = async () => {
    const shareText = `"${story.title}" — ${story.text}\n\n— ${story.author} on Date & Tell`;
    const shareUrl = "https://dateandtell.com";
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, text: shareText, url: shareUrl });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
    } catch {}
    setShared(true); setTimeout(() => setShared(false), 2500);
  };

  const themeClass = `theme-${story.theme.toLowerCase().replace(/ /g, "-")}`;

  return (
    <>
      <div className="story-card">
        <div className="story-card-header">
          <div className="story-card-title">{story.title}</div>
          <div className="story-menu-wrap" ref={menuRef}>
            <button className="story-card-dots" onClick={() => setMenuOpen(!menuOpen)}>···</button>
            {menuOpen && (
              <div className="story-menu-dropdown">
                <button className="story-menu-item share-item" onClick={() => { setMenuOpen(false); handleShare(); }}>
                  <ShareIcon /> Share Story
                </button>
                <button className="story-menu-item report-item" onClick={() => { setMenuOpen(false); setReportStep("select"); }}>
                  <FlagIcon /> Report Story
                </button>
              </div>
            )}
          </div>
        </div>
        <span className={`story-card-theme ${themeClass}`}>{story.theme}</span>
        <div className="story-card-text">{story.text}</div>
        <div className="story-card-persona">— {story.author}</div>
        <div className="story-card-divider" />
        <div className="story-card-reactions">
          {EMOJI_OPTIONS.map(emoji => {
            const count = story.reactions?.[emoji] || 0;
            const isActive = reacted[`${story.id}-${emoji}`];
            return (
              <button key={emoji} className={`story-reaction ${isActive ? "active" : ""}`} onClick={() => onReaction(story.id, emoji)}>
                {emoji}{count > 0 && <span className="reaction-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {reportStep && (
        <div className="report-overlay" onClick={(e) => { if (e.target === e.currentTarget) { if (reportStep === "done") handleCloseReport(); else { setReportStep(null); setSelectedReason(null); } } }}>
          <div className="report-modal">
            {reportStep === "select" ? (
              <>
                <h3>Report this story</h3>
                <p className="report-sub">Help us keep Date & Tell safe. Why are you reporting this?</p>
                <div className="report-options">
                  {REPORT_REASONS.map(reason => (
                    <button key={reason} className={`report-option ${selectedReason === reason ? "selected" : ""}`} onClick={() => setSelectedReason(reason)}>
                      <span className="ro-radio" />{reason}
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
                <button className="report-cancel" style={{ marginTop: 20, width: "100%" }} onClick={handleCloseReport}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {shared && (
        <div className="share-toast">
          <CheckIcon /> Link copied
        </div>
      )}
    </>
  );
}

// ── Main App ──
export default function DateAndTell() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\//, "");
    if (["library", "submit", "subscribe", "login", "signup", "dashboard", "forgot-password", "reset-password"].includes(path)) return path;
    return "home";
  };

  const [email, setEmail] = useState("");
  const [heroSub, setHeroSub] = useState(false);
  const [ctaSub, setCtaSub] = useState(false);
  const [pageSub, setPageSub] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [page, setPageState] = useState("home");
  const [filter, setFilter] = useState("All");
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [storyReactions, setStoryReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dt_reactions") || "{}"); } catch { return {}; }
  });
  const [hiddenStories, setHiddenStories] = useState(new Set());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Auth State ──
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [dashboardStories, setDashboardStories] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashFilter, setDashFilter] = useState("all");
  const [showDashWelcome, setShowDashWelcome] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Load auth on mount
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) setAuthUser(stored);
  }, []);

  const setPage = (p) => {
    setPageState(p);
    setMobileMenu(false);
    setSearchQuery("");
    setAuthError("");
    setAuthEmail("");
    setAuthPassword("");
    const url = p === "home" ? "/" : `/${p}`;
    window.history.pushState({}, "", url);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    setLoaded(true);
    setPageState(getPageFromPath());
    const onPop = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPop);

    // Parse recovery token from Supabase redirect hash
    if (window.location.pathname === "/reset-password" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const token = params.get("access_token");
      const type = params.get("type");
      if (token && type === "recovery") {
        setResetToken(token);
        setPageState("reset-password");
        // Clean up the URL
        window.history.replaceState({}, "", "/reset-password");
      }
    }

    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Fetch published stories from Supabase
  useEffect(() => {
    async function fetchPublished() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/stories?status=eq.published&order=published_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const dbStories = data.map(s => ({
              id: s.id, title: s.title, theme: s.theme, author: s.author_persona,
              text: s.rewritten_text,
              tags: Array.isArray(s.search_tags) ? s.search_tags : [],
              publishedAt: s.published_at?.split("T")[0] || new Date().toISOString().split("T")[0],
              reactions: s.reactions || {},
            }));
            setStories(dbStories);
          }
        }
      } catch (err) { console.error("Failed to fetch stories:", err); }
    }
    fetchPublished();
  }, []);

  // Fetch dashboard stories when on dashboard
  useEffect(() => {
    if (page !== "dashboard" || !authUser) return;
    // Show welcome popup on first visit
    try {
      if (!localStorage.getItem("dt_dash_welcomed")) {
        setShowDashWelcome(true);
        localStorage.setItem("dt_dash_welcomed", "1");
      }
    } catch {}
    async function fetchMyStories() {
      setDashboardLoading(true);
      try {
        const res = await fetch("/api/auth/my-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authUser.user.id }),
        });
        const data = await res.json();
        if (data.ok) setDashboardStories(data.stories || []);
      } catch (err) { console.error("Dashboard fetch error:", err); }
      setDashboardLoading(false);
    }
    fetchMyStories();
  }, [page, authUser]);

  // ── Auth Handlers ──
  const linkStoriesAndGo = async (userId) => {
    const unlinked = getUnlinkedStoryIds();
    if (unlinked.length > 0) {
      try {
        await fetch("/api/auth/link-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyIds: unlinked, userId }),
        });
        clearUnlinkedStoryIds();
      } catch (err) { console.error("Link story error:", err); }
    }
    setPage("dashboard");
  };

  const handleSignup = useCallback(async () => {
    if (!authEmail || !authPassword) return;
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters"); return; }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error === "already_exists") {
          setAuthError("already_exists");
        } else {
          setAuthError(data.error || "Signup failed");
        }
      } else if (data.user && data.session) {
        const authData = { user: data.user, access_token: data.session.access_token, refresh_token: data.session.refresh_token };
        storeAuth(authData);
        setAuthUser(authData);
        await linkStoriesAndGo(data.user.id);
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail, authPassword, authName]);

  const handleLogin = useCallback(async () => {
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Login failed");
      } else {
        const authData = { user: data.user, access_token: data.access_token, refresh_token: data.refresh_token };
        storeAuth(authData);
        setAuthUser(authData);
        await linkStoriesAndGo(data.user.id);
      }
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail, authPassword]);

  const handleLogout = () => {
    clearAuth();
    setAuthUser(null);
    setDashboardStories([]);
    setPage("home");
  };

  const handleResetRequest = useCallback(async () => {
    if (!authEmail) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      setResetSent(true);
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail]);

  const handleResetPassword = useCallback(async () => {
    if (!authPassword || !resetToken) return;
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters"); return; }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: resetToken, newPassword: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Failed to reset password. The link may have expired.");
      } else {
        setResetSuccess(true);
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authPassword, resetToken]);

  // ── Handlers ──
  const handleSubscribe = useCallback(async (source) => {
    if (!email.includes("@")) return;
    if (source === "hero") setHeroSub(true);
    else if (source === "cta") setCtaSub(true);
    else if (source === "page") setPageSub(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) { console.error("Subscribe error:", err); }
  }, [email]);

  const handleSubmitStory = useCallback(async () => {
    if (!storyText.trim() || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    setEditingSubmission(false);
    setEditedText("");
    setShowSignupPrompt(false);
    try {
      const body = { storyText };
      // If logged in, attach userId
      if (authUser) body.userId = authUser.user.id;

      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.status === "rejected") {
        setSubmitResult({ type: "rejected", message: result.reason || "We couldn't publish this one, but we'd love a lighter version!" });
      } else {
        setSubmitResult({ type: "approved", storyId: result.storyId, story: { title: result.title, theme: result.theme, author: result.author, text: result.rewritten } });
        setStoryText("");

        // If not logged in, save story ID for later linking
        if (!authUser && result.storyId) {
          addUnlinkedStoryId(result.storyId);
          setShowSignupPrompt(true);
          // After 2 seconds, gently scroll to peek the signup card into view
          setTimeout(() => {
            const el = document.getElementById("post-submit-signup");
            if (el) {
              const rect = el.getBoundingClientRect();
              const peekAmount = 120; // Show rainbow bar + title
              if (rect.top > window.innerHeight) {
                window.scrollTo({ top: window.pageYOffset + (rect.top - window.innerHeight + peekAmount), behavior: "smooth" });
              }
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitResult({ type: "rejected", message: "Something went wrong. Please try again!" });
    }
    setSubmitting(false);
  }, [storyText, submitting, authUser]);

  const handleReaction = useCallback((storyId, emoji) => {
    const key = `${storyId}-${emoji}`;
    const alreadyReacted = storyReactions[key];
    const action = alreadyReacted ? "remove" : "add";

    setStoryReactions(prev => {
      const next = { ...prev };
      if (alreadyReacted) { delete next[key]; } else { next[key] = true; }
      try { localStorage.setItem("dt_reactions", JSON.stringify(next)); } catch {}
      return next;
    });
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const reactions = { ...s.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + (alreadyReacted ? -1 : 1);
      if (reactions[emoji] <= 0) delete reactions[emoji];
      return { ...s, reactions };
    }));

    fetch("/api/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, emoji, action }),
    }).then(res => res.json()).then(data => {
      if (!data.ok) console.error("Reaction API error:", data);
    }).catch(err => console.error("Reaction save error:", err));
  }, [storyReactions]);

  const handleReport = useCallback(async (storyId, reason) => {
    setHiddenStories(prev => new Set([...prev, storyId]));
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, reason }),
      });
      const data = await res.json();
      if (data.deleted) setStories(s => s.filter(story => story.id !== storyId));
    } catch (err) { console.error("Report error:", err); }
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editedText.trim() || !submitResult?.storyId) return;
    setSavingEdit(true);
    try {
      await fetch("/api/stories/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: submitResult.storyId, rewritten_text: editedText }),
      });
      setSubmitResult(prev => ({ ...prev, story: { ...prev.story, text: editedText }, edited: true }));
      setEditingSubmission(false);
    } catch (err) { console.error("Edit error:", err); }
    setSavingEdit(false);
  }, [editedText, submitResult]);

  const renderAuthError = () => {
    if (!authError) return null;
    if (authError === "already_exists") {
      return (
        <div className="auth-error">
          An account with this email already exists. <span className="auth-switch-link" onClick={() => setPage("login")}>Log in instead</span>
        </div>
      );
    }
    return <div className="auth-error">{authError}</div>;
  };

  const startEditSubmission = () => {
    if (submitResult?.story) {
      setEditedText(submitResult.story.text);
      setEditingSubmission(true);
    }
  };

  const PencilIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

  const renderSubmissionPreview = () => {
    if (!submitResult) return null;
    if (submitResult.type === "rejected") {
      return <div className="submit-result rejected"><div>{submitResult.message}</div></div>;
    }
    const s = submitResult.story;
    const themeClass = `theme-${s.theme?.toLowerCase().replace(/ /g, "-")}`;
    return (
      <div className="submission-preview">
        <div className="sp-header">
          <div className="sp-check"><CheckIcon /></div>
          <div className="sp-header-text">
            <div className="sp-title-text">{submitResult.edited ? "Story updated" : "Here's your story"}</div>
            <div className="sp-subtitle">{submitResult.edited ? "Your changes have been saved. The story is back in review with your edits." : "Submitted for review. If anything looks off, tap the pencil to tweak it."}</div>
          </div>
        </div>
        <div className="sp-card">
          <div className="sp-card-top">
            <span className={`story-card-theme ${themeClass}`}>{s.theme}</span>
            {!editingSubmission && (
              <button className="sp-edit-btn" onClick={startEditSubmission} title="Edit story"><PencilIcon /></button>
            )}
          </div>
          <div className="sp-card-title">{s.title}</div>
          {editingSubmission ? (
            <div className="sp-edit-area">
              <textarea className="sp-edit-textarea" value={editedText} onChange={e => setEditedText(e.target.value)} />
              <div className="sp-edit-actions">
                <button className="sp-cancel" onClick={() => setEditingSubmission(false)}>Cancel</button>
                <button className="sp-save" onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? <><span className="spinner" /> Saving...</> : "Save changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="sp-card-text">{s.text}</div>
          )}
          <div className="sp-card-persona">— {s.author}</div>
        </div>
      </div>
    );
  };

  // ── Computed ──
  const visibleStories = stories.filter(s => !hiddenStories.has(s.id));
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const thisWeekStories = visibleStories.filter(s => s.publishedAt >= weekAgo);
  const sortByReactions = (arr) => [...arr].sort((a, b) => {
    const totalA = Object.values(a.reactions || {}).reduce((sum, n) => sum + n, 0);
    const totalB = Object.values(b.reactions || {}).reduce((sum, n) => sum + n, 0);
    return totalB - totalA;
  });
  const homeStories = sortByReactions(thisWeekStories).slice(0, 4);

  const searchFilter = (arr) => {
    if (!searchQuery.trim()) return arr;
    const searchTerms = expandSearch(searchQuery);
    return arr.filter(s => {
      const tagStr = Array.isArray(s.tags) ? s.tags.join(" ") : (s.tags || "");
      const searchable = `${s.title} ${s.text} ${s.author} ${s.theme} ${tagStr}`.toLowerCase();
      return searchTerms.some(term => searchable.includes(term));
    });
  };
  const themeFilter = (arr) => filter === "All" ? arr : arr.filter(s => s.theme === filter);
  const filteredThisWeek = sortByReactions(searchFilter(themeFilter(thisWeekStories)));
  const filteredAll = sortByReactions(searchFilter(themeFilter(visibleStories)));
  const allThemes = ["All", ...THEMES];

  // ── Dashboard helpers ──
  const getStatusColor = (status) => {
    switch (status) {
      case "published": return { bg: "#DCFCE7", color: "#166534" };
      case "pending": return { bg: "#FEF3C7", color: "#92400E" };
      case "approved": return { bg: "#DBEAFE", color: "#1E40AF" };
      case "queued": return { bg: "#E0E7FF", color: "#4338CA" };
      case "rejected": return { bg: "#FEE2E2", color: "#991B1B" };
      default: return { bg: "#F1F5F9", color: "#475569" };
    }
  };

  const getTotalReactions = (reactions) => {
    if (!reactions || typeof reactions !== "object") return 0;
    return Object.values(reactions).reduce((sum, n) => sum + n, 0);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=League+Spartan:wght@700;800;900&display=swap');

    :root {
      --blue: #2563EB;
      --blue-light: #DBEAFE;
      --blue-pale: #EFF6FF;
      --blue-dark: #1E40AF;
      --blue-deep: #1E3A5F;
      --black: #0F172A;
      --gray: #64748B;
      --gray-light: #94A3B8;
      --border: #E2E8F0;
      --bg: #FFFFFF;
      --font: 'DM Sans', system-ui, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--bg); color: var(--black); }

    .fade-up { opacity: 0; transform: translateY(16px); animation: fadeUp 0.6s ease forwards; }
    .d1 { animation-delay: 0.08s; } .d2 { animation-delay: 0.16s; }
    .d3 { animation-delay: 0.24s; } .d4 { animation-delay: 0.32s; }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes float1 { 0%,100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-8px); } }
    @keyframes float2 { 0%,100% { transform: rotate(2.5deg) translateY(0); } 50% { transform: rotate(2.5deg) translateY(-10px); } }
    @keyframes float3 { 0%,100% { transform: rotate(-1.5deg) translateY(0); } 50% { transform: rotate(-1.5deg) translateY(-6px); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Nav ── */
    .nav-wrapper { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226,232,240,0.5); }
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; max-width: 1280px; margin: 0 auto; }
    .nav-logo { display: flex; flex-direction: column; cursor: pointer; line-height: 1; }
    .nav-logo-text { font-family: 'League Spartan', var(--font); font-size: 34px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; }
    .nav-logo-tagline { font-family: var(--font); font-size: 13px; font-weight: 400; color: var(--blue); letter-spacing: 0.02em; font-style: italic; margin-top: 1px; }
    .nav-right { display: flex; align-items: center; gap: 20px; }
    .nav-link { font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--gray); cursor: pointer; text-decoration: none; transition: color 0.2s; }
    .nav-link:hover { color: var(--black); }
    .nav-user-btn { font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--gray); cursor: pointer; display: flex; align-items: center; gap: 6px; background: none; border: 1.5px solid var(--border); padding: 8px 16px; border-radius: 10px; transition: all 0.2s; }
    .nav-user-btn:hover { border-color: var(--blue-light); color: var(--black); }
    .nav-share { font-family: var(--font); font-size: 14px; font-weight: 600; color: white; background: var(--black); padding: 12px 24px; border-radius: 14px; border: none; cursor: pointer; transition: all 0.2s; }
    .nav-share:hover { background: #1E293B; }
    .nav-hamburger { display: none; background: none; border: none; color: var(--black); cursor: pointer; padding: 4px; }
    .mobile-menu { display: none; }

    /* ── Hero ── */
    .hero { max-width: 1280px; margin: 0 auto; padding: 80px 48px 100px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--blue); margin-bottom: 20px; letter-spacing: 0.01em; background: var(--blue-pale); padding: 10px 20px; border-radius: 100px; }
    .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); }
    .hero h1 { font-family: var(--font); font-size: 60px; font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; color: var(--black); margin-bottom: 24px; }
    .hero h1 em { color: var(--blue); font-style: italic; }
    .hero-blue { color: var(--blue); }
    .hero-sub { font-family: var(--font); font-size: 18px; color: var(--gray); line-height: 1.6; margin-bottom: 36px; font-weight: 400; max-width: 460px; }
    .hero-email { display: flex; gap: 10px; margin-bottom: 20px; }
    .hero-input { flex: 1; padding: 16px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); }
    .hero-input::placeholder { color: var(--gray-light); }
    .hero-input:focus { outline: none; border-color: var(--blue); }
    .hero-btn { padding: 16px 32px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font); white-space: nowrap; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .hero-btn:hover { background: var(--blue-dark); transform: translateY(-1px); }
    .hero-subbed { display: flex; align-items: center; gap: 10px; padding: 16px 24px; background: var(--blue-pale); border-radius: 14px; font-size: 15px; font-weight: 600; color: var(--blue-dark); font-family: var(--font); }
    .hero-subbed-success { padding: 16px 24px; background: #DCFCE7; border-radius: 14px; font-size: 15px; font-weight: 600; color: #166534; font-family: var(--font); line-height: 1.5; }

    /* ── Floating cards ── */
    .hero-cards { position: relative; height: 520px; }
    .float-card { position: absolute; background: white; border-radius: 20px; padding: 22px; width: 280px; box-shadow: 0 8px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); }
    .float-card.c1 { top: 0; left: 10px; animation: float1 4s ease-in-out infinite; z-index: 2; }
    .float-card.c2 { top: 180px; right: 0; animation: float2 5s ease-in-out infinite; z-index: 3; }
    .float-card.c3 { bottom: 10px; left: 40px; animation: float3 4.5s ease-in-out infinite; z-index: 1; }
    .fc-tag { display: inline-block; font-family: var(--font); font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 100px; margin-bottom: 12px; }
    .c1 .fc-tag { background: var(--blue-light); color: var(--blue-dark); }
    .c2 .fc-tag { background: #DCFCE7; color: #166534; }
    .c3 .fc-tag { background: #F3E8FF; color: #7C3AED; }
    .fc-title { font-family: var(--font); font-size: 16px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .fc-text { font-family: var(--font); font-size: 13px; color: var(--gray); line-height: 1.55; margin-bottom: 12px; }
    .fc-reactions { display: flex; gap: 12px; font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; }

    /* ── Home sections ordering ── */
    .home-sections { display: flex; flex-direction: column; }
    .home-submit { order: 1; }
    .home-stories { order: 2; }
    @media (min-width: 769px) { .home-submit { order: 2; } .home-stories { order: 1; } }

    /* ── Stories ── */
    .stories-section { max-width: 1280px; margin: 0 auto; padding: 0 48px 100px; }
    .stories-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; }
    .stories-title { font-family: var(--font); font-size: 36px; font-weight: 700; letter-spacing: -0.02em; color: var(--black); }
    .rainbow-accent { height: 4px; width: 60px; border-radius: 4px; margin-top: 10px; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .stories-link { font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--black); cursor: pointer; display: flex; align-items: center; gap: 6px; text-decoration: underline; text-underline-offset: 3px; }
    .stories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

    /* ── Story Card ── */
    .story-card { background: white; border-radius: 20px; padding: 28px; transition: all 0.3s; border: 1px solid var(--border); }
    .story-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); border-color: transparent; }
    .story-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .story-card-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); line-height: 1.25; }
    .story-card-dots { color: var(--gray-light); font-size: 18px; cursor: pointer; background: none; border: none; padding: 4px 8px; border-radius: 8px; font-family: var(--font); }
    .story-card-dots:hover { background: var(--blue-pale); }
    .story-menu-wrap { position: relative; }
    .story-menu-dropdown { position: absolute; top: 100%; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); border: 1px solid var(--border); padding: 4px; min-width: 180px; z-index: 50; }
    .story-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; border: none; background: none; font-family: var(--font); font-size: 13px; color: var(--gray); cursor: pointer; border-radius: 8px; transition: background 0.1s; }
    .story-menu-item:hover { background: var(--blue-pale); color: var(--blue); }
    .story-card-theme { display: inline-block; font-family: var(--font); font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.04em; }
    .theme-first-dates { background: #DCFCE7; color: #166534; }
    .theme-meet-cutes { background: #FEF3C7; color: #92400E; }
    .theme-awkward-moments { background: #F3E8FF; color: #7C3AED; }
    .theme-dating-app-disasters { background: #FFE4E6; color: #BE123C; }
    .theme-situationships { background: #E0F2FE; color: #0369A1; }
    .theme-meeting-the-family { background: #FFF7ED; color: #C2410C; }
    .story-card-text { font-family: var(--font); font-size: 15px; color: var(--gray); line-height: 1.65; margin-bottom: 16px; }
    .story-card-persona { font-family: var(--font); font-size: 14px; font-weight: 600; font-style: italic; color: var(--blue); margin-bottom: 16px; }
    .story-card-divider { height: 1px; background: var(--border); margin-bottom: 16px; }
    .story-card-reactions { display: flex; gap: 8px; }
    .story-reaction { min-width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 18px; cursor: pointer; transition: all 0.2s; padding: 0 10px; }
    .story-reaction:hover { background: var(--blue-pale); border-color: var(--blue-light); transform: scale(1.05); }
    .story-reaction.active { background: var(--blue-pale); border-color: var(--blue); }
    .reaction-count { font-size: 12px; font-weight: 600; color: var(--gray); font-family: var(--font); }
    .story-menu-item.share-item:hover { background: var(--blue-pale); color: var(--blue); }
    .story-menu-item.report-item:hover { background: #FEF2F2; color: #DC2626; }

    /* ── Report Modal ── */
    .report-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .report-modal { background: white; border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); font-family: var(--font); }
    .report-modal h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--black); }
    .report-sub { font-size: 14px; color: var(--gray); margin-bottom: 20px; }
    .report-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .report-option { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1.5px solid var(--border); background: white; cursor: pointer; font-family: var(--font); font-size: 14px; color: var(--black); transition: all 0.15s; }
    .report-option:hover { border-color: var(--blue-light); }
    .report-option.selected { border-color: var(--blue); background: var(--blue-pale); }
    .ro-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); flex-shrink: 0; }
    .report-option.selected .ro-radio { border-color: var(--blue); background: var(--blue); box-shadow: inset 0 0 0 3px white; }
    .report-actions { display: flex; gap: 10px; }
    .report-cancel { flex: 1; padding: 14px; border-radius: 12px; border: 1.5px solid var(--border); background: white; font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--gray); cursor: pointer; }
    .report-submit { flex: 1; padding: 14px; border-radius: 12px; border: none; background: #EF4444; color: white; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; }
    .report-submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .report-success { text-align: center; }
    .report-success-icon { width: 48px; height: 48px; border-radius: 50%; background: #DCFCE7; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #166534; }

    /* ── Share Toast ── */
    .share-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: var(--black); color: white; padding: 14px 24px; border-radius: 12px; font-family: var(--font); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 300; box-shadow: 0 8px 30px rgba(0,0,0,0.2); animation: toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards; }
    .share-toast svg { width: 16px; height: 16px; stroke: #4ADE80; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

    /* ── Submit Section (homepage) ── */
    .submit-section { max-width: 1280px; margin: 0 auto; padding: 0 48px 100px; }
    .submit-inner { background: var(--blue-pale); border-radius: 24px; padding: 48px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: start; }
    .submit-title { font-family: var(--font); font-size: 32px; font-weight: 700; color: var(--black); letter-spacing: -0.02em; margin-bottom: 12px; }
    .submit-sub { font-family: var(--font); font-size: 17px; color: var(--gray); line-height: 1.6; }
    .submit-form-area { position: relative; }
    .submit-textarea { width: 100%; padding: 18px; padding-bottom: 36px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); resize: none; line-height: 1.5; min-height: 140px; }
    .submit-char-count { position: absolute; bottom: 14px; right: 16px; font-family: var(--font); font-size: 12px; color: var(--gray-light); }
    .submit-char-count.warn { color: #F59E0B; }
    .submit-char-count.over { color: #EF4444; }
    .submit-textarea::placeholder { color: var(--gray-light); }
    .submit-textarea:focus { outline: none; border-color: var(--blue); }
    .submit-row { display: flex; justify-content: flex-end; align-items: center; margin-top: 12px; }
    .submit-btn { padding: 14px 28px; background: var(--black); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font); display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .submit-btn:hover { background: #1E293B; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-result { margin-top: 16px; padding: 16px; border-radius: 12px; font-family: var(--font); font-size: 14px; line-height: 1.5; }
    .submit-result.approved { background: #DCFCE7; color: #166534; }
    .submit-result.rejected { background: #FEF2F2; color: #991B1B; }

    /* ── Submission Preview ── */
    .submission-preview { margin-top: 20px; }
    .sp-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
    .sp-check { width: 36px; height: 36px; border-radius: 50%; background: #DCFCE7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #166534; }
    .sp-check svg { width: 16px; height: 16px; }
    .sp-header-text { flex: 1; }
    .sp-title-text { font-family: var(--font); font-size: 16px; font-weight: 700; color: var(--black); margin-bottom: 2px; }
    .sp-subtitle { font-family: var(--font); font-size: 13px; color: var(--gray); line-height: 1.4; }
    .sp-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .sp-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .sp-edit-btn { background: none; border: none; color: var(--gray-light); cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; }
    .sp-edit-btn:hover { color: var(--blue); background: var(--blue-pale); }
    .sp-card-title { font-family: var(--font); font-size: 18px; font-weight: 700; color: var(--black); margin-bottom: 10px; }
    .sp-card-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 12px; }
    .sp-card-persona { font-family: var(--font); font-size: 13px; font-weight: 600; font-style: italic; color: var(--blue); }
    .sp-edit-area { margin-bottom: 12px; }
    .sp-edit-textarea { width: 100%; padding: 14px; border: 2px solid var(--blue-light); border-radius: 12px; font-size: 14px; font-family: var(--font); color: var(--black); resize: vertical; line-height: 1.5; min-height: 100px; background: var(--blue-pale); }
    .sp-edit-textarea:focus { outline: none; border-color: var(--blue); }
    .sp-edit-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    .sp-cancel { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: white; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray); cursor: pointer; }
    .sp-save { padding: 8px 16px; border-radius: 10px; border: none; background: var(--blue); color: white; font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .sp-save:hover { background: var(--blue-dark); }
    .sp-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

    /* ── Auth Pages (Login / Signup) ── */
    .auth-page { max-width: 440px; margin: 0 auto; padding: 80px 24px; }
    .auth-card { background: white; border: 1px solid var(--border); border-radius: 20px; padding: 40px 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .auth-logo { font-family: 'League Spartan', var(--font); font-size: 28px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; text-align: center; margin-bottom: 8px; }
    .auth-title { font-family: var(--font); font-size: 24px; font-weight: 700; color: var(--black); text-align: center; margin-bottom: 8px; }
    .auth-subtitle { font-family: var(--font); font-size: 14px; color: var(--gray); text-align: center; margin-bottom: 28px; line-height: 1.5; }
    .auth-label { display: block; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--black); margin-bottom: 6px; }
    .auth-input { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; font-family: var(--font); color: var(--black); margin-bottom: 16px; }
    .auth-input::placeholder { color: var(--gray-light); }
    .auth-input:focus { outline: none; border-color: var(--blue); }
    .auth-btn { width: 100%; padding: 16px; background: var(--blue); color: white; border: none; border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
    .auth-btn:hover { background: var(--blue-dark); }
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-error { background: #FEF2F2; color: #991B1B; padding: 12px 16px; border-radius: 10px; font-family: var(--font); font-size: 13px; margin-bottom: 16px; line-height: 1.4; }
    .auth-switch { font-family: var(--font); font-size: 14px; color: var(--gray); text-align: center; }
    .auth-switch-link { color: var(--blue); font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
    .auth-forgot { font-family: var(--font); font-size: 13px; color: var(--blue); font-weight: 500; cursor: pointer; text-align: right; margin-top: -4px; margin-bottom: 8px; }
    .auth-forgot:hover { text-decoration: underline; text-underline-offset: 2px; }
    .auth-success { text-align: center; padding: 20px 0; }
    .auth-success-icon { font-size: 40px; margin-bottom: 16px; }
    .auth-success-title { font-family: var(--font); font-size: 22px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .auth-success-sub { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 24px; }
    .auth-success-sub strong { color: var(--black); }
    .auth-btn-secondary { width: 100%; padding: 14px; background: white; border: 1.5px solid var(--border); border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 600; color: var(--black); cursor: pointer; transition: all 0.2s; }
    .auth-btn-secondary:hover { border-color: var(--blue); color: var(--blue); }
    .auth-divider { display: flex; align-items: center; gap: 16px; margin: 20px 0; }
    .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
    .auth-divider-text { font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; }

    /* ── Dashboard ── */
    .dash-page { max-width: 960px; margin: 0 auto; padding: 60px 48px 100px; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
    .dash-title { font-family: var(--font); font-size: 36px; font-weight: 700; color: var(--black); letter-spacing: -0.02em; }
    .dash-email { font-family: var(--font); font-size: 14px; color: var(--gray); }
    .dash-logout { font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray); background: none; border: 1.5px solid var(--border); padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .dash-logout:hover { border-color: #EF4444; color: #EF4444; }
    .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
    .dash-stat { background: var(--blue-pale); border-radius: 16px; padding: 24px; text-align: center; }
    .dash-stat-num { font-family: var(--font); font-size: 32px; font-weight: 700; color: var(--blue); margin-bottom: 4px; }
    .dash-stat-label { font-family: var(--font); font-size: 13px; color: var(--gray); font-weight: 500; }
    .dash-section-title { font-family: var(--font); font-size: 24px; font-weight: 700; color: var(--black); margin-bottom: 16px; }
    .dash-story { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 12px; transition: all 0.2s; }
    .dash-story:hover { border-color: var(--blue-light); box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .dash-story-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .dash-story-title { font-family: var(--font); font-size: 17px; font-weight: 700; color: var(--black); }
    .dash-story-status { font-family: var(--font); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.04em; }
    .dash-story-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 12px; }
    .dash-story-meta { display: flex; gap: 20px; font-family: var(--font); font-size: 13px; color: var(--gray-light); }
    .dash-story-meta span { display: flex; align-items: center; gap: 4px; }
    .dash-story-reactions { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .dash-reaction-pill { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: var(--blue-pale); border-radius: 100px; font-size: 14px; }
    .dash-reaction-count { font-family: var(--font); font-size: 13px; font-weight: 700; color: var(--black); }
    .dash-reaction-total { font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; margin-left: 4px; }
    .dash-share-link { display: flex; align-items: center; gap: 4px; color: var(--blue); font-weight: 600; cursor: pointer; margin-left: auto; transition: opacity 0.2s; }
    .dash-share-link:hover { opacity: 0.7; }
    .dash-share-link svg { width: 14px; height: 14px; stroke: var(--blue); }
    .dash-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .dash-filter { font-family: var(--font); font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 100px; border: 1.5px solid var(--border); background: white; color: var(--gray); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .dash-filter:hover { border-color: var(--blue-light); color: var(--black); }
    .dash-filter.active { background: var(--black); color: white; border-color: var(--black); }
    .dash-filter-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.08); padding: 2px 7px; border-radius: 100px; }
    .dash-filter.active .dash-filter-count { background: rgba(255,255,255,0.2); }
    .dash-empty { text-align: center; padding: 60px 20px; }
    .dash-empty-icon { font-size: 40px; margin-bottom: 12px; }
    .dash-empty-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .dash-empty-sub { font-family: var(--font); font-size: 14px; color: var(--gray); margin-bottom: 20px; line-height: 1.5; }
    .dash-empty-btn { padding: 14px 28px; background: var(--blue); color: white; border: none; border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 600; cursor: pointer; }
    .dash-empty-btn:hover { background: var(--blue-dark); }
    .dash-loading { text-align: center; padding: 60px; font-family: var(--font); color: var(--gray); }
    .dash-welcome-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
    .dash-welcome { background: white; border-radius: 20px; padding: 40px 32px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .dash-welcome-emoji { font-size: 48px; margin-bottom: 16px; }
    .dash-welcome-title { font-family: var(--font); font-size: 22px; font-weight: 700; color: var(--black); margin-bottom: 12px; }
    .dash-welcome-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 24px; }

    /* ── How it works ── */
    .how-section { background: var(--blue); padding: 80px 48px; }
    .how-inner { max-width: 1280px; margin: 0 auto; }
    .how-title { font-family: var(--font); font-size: 36px; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 48px; }
    .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .how-card { background: rgba(255,255,255,0.12); border-radius: 24px; padding: 36px 28px; }
    .how-num { font-family: var(--font); font-size: 44px; font-weight: 700; color: rgba(255,255,255,0.2); margin-bottom: 16px; line-height: 1; }
    .how-card h3 { font-family: var(--font); font-size: 18px; font-weight: 700; color: white; margin-bottom: 10px; }
    .how-card p { font-family: var(--font); font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; }

    /* ── CTA ── */
    .cta-section { max-width: 1280px; margin: 0 auto; padding: 100px 48px; text-align: center; }
    .cta-title { font-family: var(--font); font-size: 44px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 16px; }
    .cta-sub { font-family: var(--font); font-size: 17px; color: var(--gray); margin-bottom: 36px; }
    .cta-email { display: inline-flex; gap: 10px; max-width: 480px; width: 100%; }
    .cta-input { flex: 1; padding: 16px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); color: var(--black); }
    .cta-input::placeholder { color: var(--gray-light); }
    .cta-input:focus { outline: none; border-color: var(--blue); }
    .cta-btn { padding: 16px 32px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font); }
    .cta-btn:hover { background: var(--blue-dark); }

    /* ── Library ── */
    .library-page { max-width: 1280px; margin: 0 auto; padding: 60px 48px 100px; }
    .library-header { margin-bottom: 40px; }
    .library-title { font-family: var(--font); font-size: 44px; font-weight: 700; color: var(--black); letter-spacing: -0.03em; margin-bottom: 12px; }
    .library-sub { font-family: var(--font); font-size: 17px; color: var(--gray); }
    .library-section-title { font-family: var(--font); font-size: 30px; font-weight: 700; color: var(--black); margin-bottom: 20px; }
    .library-divider { height: 1px; background: var(--border); margin: 48px 0; }
    .library-search { position: relative; margin-bottom: 16px; }
    .library-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--gray-light); pointer-events: none; }
    .library-search-input { width: 100%; padding: 14px 16px 14px 44px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); transition: border-color 0.2s; }
    .library-search-input::placeholder { color: var(--gray-light); }
    .library-search-input:focus { outline: none; border-color: var(--blue); }
    .library-search-clear { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: var(--border); border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray); font-size: 12px; padding: 0; }
    .library-search-clear:hover { background: var(--gray-light); color: white; }
    .library-filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .library-filter { font-family: var(--font); font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 100px; border: 1.5px solid var(--border); background: white; color: var(--gray); cursor: pointer; transition: all 0.2s; }
    .library-filter:hover { border-color: var(--blue-light); color: var(--black); }
    .library-filter.active { background: var(--blue); color: white; border-color: var(--blue); }
    .library-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .library-empty { grid-column: 1 / -1; text-align: center; padding: 48px; font-family: var(--font); font-size: 15px; color: var(--gray-light); }

    /* ── Subscribe Page ── */
    .subscribe-page { max-width: 520px; margin: 0 auto; padding: 80px 24px; text-align: center; }
    .subscribe-heart { width: 72px; height: 72px; border-radius: 50%; background: var(--blue-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
    .subscribe-page h1 { font-family: var(--font); font-size: 40px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 16px; }
    .subscribe-page h1 em { color: var(--blue); font-style: italic; }
    .subscribe-page-sub { font-family: var(--font); font-size: 17px; color: var(--gray); line-height: 1.6; margin-bottom: 32px; }
    .subscribe-page-input { width: 100%; padding: 18px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 16px; font-family: var(--font); color: var(--black); margin-bottom: 12px; }
    .subscribe-page-input::placeholder { color: var(--gray-light); }
    .subscribe-page-input:focus { outline: none; border-color: var(--blue); }
    .subscribe-page-btn { width: 100%; padding: 18px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: var(--font); margin-bottom: 16px; }
    .subscribe-page-btn:hover { background: var(--blue-dark); }
    .subscribe-page-fine { font-family: var(--font); font-size: 13px; color: var(--gray-light); }

    /* ── Submit Page ── */
    .submit-page { max-width: 560px; margin: 0 auto; padding: 60px 24px; }
    .submit-page-rainbow { height: 5px; border-radius: 14px 14px 0 0; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .submit-page-card { background: white; border-radius: 0 0 20px 20px; padding: 48px 36px; border: 1px solid var(--border); border-top: none; box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .submit-page h1 { font-family: var(--font); font-size: 36px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 8px; }
    .submit-page-sub { font-family: var(--font); font-size: 15px; color: var(--gray); margin-bottom: 28px; line-height: 1.5; }
    .submit-page-form { position: relative; margin-bottom: 12px; }
    .submit-page-textarea { width: 100%; padding: 18px; padding-bottom: 36px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: var(--blue-pale); color: var(--black); resize: vertical; line-height: 1.5; min-height: 180px; }
    .submit-page-textarea::placeholder { color: var(--gray-light); }
    .submit-page-textarea:focus { outline: none; border-color: var(--blue); }
    .submit-page-char { position: absolute; bottom: 14px; right: 16px; font-family: var(--font); font-size: 12px; color: var(--gray-light); }
    .submit-page-char.warn { color: #F59E0B; }
    .submit-page-char.over { color: #EF4444; }
    .submit-page-btn { width: 100%; padding: 18px; background: var(--black); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: var(--font); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .submit-page-btn:hover { background: #1E293B; }
    .submit-page-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-page-fine { font-family: var(--font); font-size: 13px; color: var(--gray-light); text-align: center; }

    /* ── Post-Submit Inline Signup ── */
    .post-submit-signup { margin-top: 24px; background: white; border: 2px solid var(--border); border-radius: 16px; overflow: hidden; }
    .post-submit-signup-rainbow { height: 5px; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .post-submit-signup-inner { padding: 28px 24px; }
    .post-submit-signup-header { margin-bottom: 20px; }
    .post-submit-signup-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); margin-bottom: 6px; }
    .post-submit-signup-sub { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.5; }
    .post-submit-signup .auth-input { background: white; border: 2px solid var(--border); }
    .post-submit-signup .auth-switch { margin-top: 4px; }

    .submit-another-btn { width: 100%; margin-top: 20px; padding: 16px; background: var(--black); border: none; border-radius: 14px; font-family: var(--font); font-size: 15px; font-weight: 700; color: white; cursor: pointer; transition: all 0.2s; }
    .submit-another-btn:hover { background: #1E293B; }
    .submit-page-result { margin-top: 16px; padding: 16px; border-radius: 12px; font-family: var(--font); font-size: 14px; line-height: 1.5; }
    .submit-page-result.approved { background: #DCFCE7; color: #166534; }
    .submit-page-result.rejected { background: #FEF2F2; color: #991B1B; }

    /* ── Footer ── */
    .footer { max-width: 1280px; margin: 0 auto; padding: 32px 48px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .footer-logo { font-family: 'League Spartan', var(--font); font-size: 20px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; }
    .footer-email { font-family: var(--font); font-size: 13px; color: var(--gray); text-decoration: none; transition: color 0.2s; }
    .footer-email:hover { color: var(--blue); }
    .footer-copy { font-family: var(--font); font-size: 13px; color: var(--gray-light); }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .nav { padding: 16px 20px; }
      .nav-link { display: none; }
      .nav-share { display: none; }
      .nav-user-btn { display: none; }
      .nav-hamburger { display: block; }
      .mobile-menu { display: flex; flex-direction: column; padding: 8px 20px 16px; border-top: 1px solid var(--border); }
      .mobile-menu-item { width: 100%; padding: 14px 0; border: none; background: none; font-family: var(--font); font-size: 16px; font-weight: 500; color: var(--gray); cursor: pointer; text-align: left; border-bottom: 1px solid var(--border); }
      .mobile-menu-item:last-child { border-bottom: none; }
      .mobile-menu-item:hover { color: var(--black); }
      .mobile-menu-item.primary { color: var(--blue); font-weight: 700; }

      .hero { grid-template-columns: 1fr; padding: 40px 20px 32px; gap: 32px; }
      .hero h1 { font-size: 36px; }
      .hero-sub { font-size: 16px; margin-bottom: 28px; }
      .hero-eyebrow { font-size: 12px; padding: 8px 16px; }
      .hero-cards { height: 320px; }
      .float-card { width: 220px; padding: 16px; }
      .float-card.c1 { left: 0; top: 0; }
      .float-card.c2 { right: -5px; top: 130px; }
      .float-card.c3 { display: none; }
      .fc-title { font-size: 14px; }
      .fc-text { font-size: 12px; }
      .hero-email { flex-direction: column; }
      .hero-input { padding: 14px 16px; font-size: 16px; }
      .hero-btn { padding: 14px; justify-content: center; font-size: 15px; }
      .stories-section { padding: 0 20px 48px; }
      .stories-title { font-size: 24px; }
      .stories-grid { grid-template-columns: 1fr; gap: 16px; }
      .story-card { padding: 22px; border-radius: 16px; }
      .story-card:hover { transform: none; box-shadow: none; }
      .story-card-title { font-size: 18px; }
      .story-card-text { font-size: 14px; }
      .story-card-reactions { gap: 6px; flex-wrap: wrap; }
      .story-reaction { min-width: 40px; height: 40px; font-size: 16px; border-radius: 10px; padding: 0 8px; }
      .reaction-count { font-size: 11px; }
      .submit-section { padding: 0 20px 48px; }
      .submit-inner { grid-template-columns: 1fr; padding: 24px; gap: 20px; border-radius: 20px; }
      .submit-title { font-size: 22px; }
      .submit-textarea { min-height: 120px; font-size: 16px; }
      .sp-card { padding: 20px; }
      .sp-card-title { font-size: 16px; }
      .sp-edit-textarea { font-size: 16px; }
      .how-section { padding: 48px 20px; }
      .how-title { font-size: 24px; margin-bottom: 32px; }
      .how-grid { grid-template-columns: 1fr; gap: 14px; }
      .how-card { padding: 28px 24px; border-radius: 20px; }
      .cta-section { padding: 48px 20px; }
      .cta-title { font-size: 28px; }
      .cta-sub { font-size: 15px; }
      .cta-email { flex-direction: column; }
      .cta-input { padding: 14px 16px; font-size: 16px; }
      .cta-btn { padding: 14px; font-size: 15px; }
      .footer { padding: 24px 20px; flex-direction: column; gap: 10px; text-align: center; align-items: center; }
      .library-page { padding: 32px 20px 64px; }
      .library-title { font-size: 28px; }
      .library-sub { font-size: 15px; }
      .library-grid { grid-template-columns: 1fr; gap: 16px; }
      .library-search-input { font-size: 16px; padding: 12px 16px 12px 40px; }
      .library-filters { gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; scrollbar-width: none; }
      .library-filters::-webkit-scrollbar { display: none; }
      .library-filter { font-size: 12px; padding: 8px 16px; white-space: nowrap; flex-shrink: 0; }
      .library-section-title { font-size: 24px; }
      .subscribe-page { padding: 48px 20px; }
      .subscribe-page h1 { font-size: 28px; }
      .subscribe-page-sub { font-size: 15px; }
      .subscribe-page-input { font-size: 16px; }
      .subscribe-page-btn { font-size: 16px; }
      .submit-page { padding: 32px 16px; }
      .submit-page h1 { font-size: 26px; }
      .submit-page-card { padding: 28px 20px; border-radius: 0 0 16px 16px; }
      .submit-page-textarea { min-height: 160px; font-size: 16px; }
      .submit-page-btn { font-size: 16px; }
      .report-modal { margin: 16px; padding: 24px; border-radius: 16px; }
      .report-option { padding: 12px 14px; }
      .share-toast { bottom: 24px; font-size: 13px; padding: 12px 20px; }
      .story-menu-dropdown { min-width: 160px; }
      .story-menu-item { padding: 12px 14px; font-size: 14px; }
      .auth-page { padding: 48px 20px; }
      .auth-card { padding: 28px 20px; }
      .dash-page { padding: 32px 20px 64px; }
      .dash-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .dash-stats { grid-template-columns: 1fr; }
      .dash-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
      .dash-filter { white-space: nowrap; flex-shrink: 0; }
      .dash-title { font-size: 28px; }
    }

    @media (max-width: 380px) {
      .hero h1 { font-size: 30px; }
      .hero-cards { height: 280px; }
      .float-card { width: 190px; padding: 14px; }
      .story-reaction { min-width: 36px; height: 36px; font-size: 15px; padding: 0 6px; }
      .cta-title { font-size: 24px; }
      .library-title { font-size: 24px; }
      .subscribe-page h1 { font-size: 24px; }
    }

    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .footer { padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
      .share-toast { bottom: calc(24px + env(safe-area-inset-bottom)); }
    }
  `;

  return (
    <div style={{ fontFamily: "var(--font)", background: "white", minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setPage("home")}>
            <span className="nav-logo-text">Date&amp;Tell</span>
            <span className="nav-logo-tagline">Love, Anonymous.</span>
          </div>
          <div className="nav-right">
            <span className="nav-link" onClick={() => setPage("library")}>Story library</span>
            <span className="nav-link" onClick={() => setPage("subscribe")}>Subscribe</span>
            {authUser ? (
              <button className="nav-user-btn" onClick={() => setPage("dashboard")}><UserIcon /> My stories</button>
            ) : (
              <span className="nav-link" onClick={() => setPage("login")}>Log in</span>
            )}
            <button className="nav-share" onClick={() => setPage("submit")}>Share your story</button>
            <button className="nav-hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenu ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </nav>
        {mobileMenu && (
          <div className="mobile-menu">
            <button className="mobile-menu-item" onClick={() => setPage("library")}>Story library</button>
            <button className="mobile-menu-item" onClick={() => setPage("subscribe")}>Subscribe</button>
            {authUser ? (
              <button className="mobile-menu-item" onClick={() => setPage("dashboard")}>My stories</button>
            ) : (
              <button className="mobile-menu-item" onClick={() => setPage("login")}>Log in</button>
            )}
            <button className="mobile-menu-item primary" onClick={() => setPage("submit")}>Share your story</button>
          </div>
        )}
      </div>

      {page === "home" && (<>
      <section className="hero">
        <div>
          <div className={`hero-eyebrow ${loaded ? "fade-up d1" : ""}`}>
            <span className="eyebrow-dot" /> Launching soon — join the waitlist
          </div>
          <h1 className={loaded ? "fade-up d1" : ""}>
            Real dating stories,<br /><span className="hero-blue">told anonymously.</span>
          </h1>
          <p className={`hero-sub ${loaded ? "fade-up d2" : ""}`}>
            Bite-sized dating stories, dropping in your inbox every Friday. Because dating is better when we're all in on the joke.
          </p>
          <div className={loaded ? "fade-up d3" : ""}>
            {heroSub ? (
              <div className="hero-subbed-success">✓ You've joined the waitlist! You'll be the first to know when our first Friday drop goes live.</div>
            ) : (
              <div className="hero-email">
                <input className="hero-input" placeholder="name@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSubscribe("hero"); }} />
                <button className="hero-btn" onClick={() => handleSubscribe("hero")}>Join waitlist <Arrow /></button>
              </div>
            )}
          </div>
        </div>
        <div className={`hero-cards ${loaded ? "fade-up d2" : ""}`}>
          <div className="float-card c1">
            <span className="fc-tag">First Dates</span>
            <div className="fc-title">The Spaghetti Incident</div>
            <div className="fc-text">Ordered spaghetti to seem cultured. Sauce on my forehead, noodle on my chin...</div>
            <div className="fc-reactions"><span>😂 89</span><span>❤️ 45</span></div>
          </div>
          <div className="float-card c2">
            <span className="fc-tag">Meet Cutes</span>
            <div className="fc-title">Dog Park Destiny</div>
            <div className="fc-text">My dog knocked his coffee everywhere. He looked at me and said "worth it."</div>
            <div className="fc-reactions"><span>❤️ 95</span><span>✨ 41</span></div>
          </div>
          <div className="float-card c3">
            <span className="fc-tag">Situationships</span>
            <div className="fc-title">The Label Talk</div>
            <div className="fc-text">"I like what we have." "What do we have?" "This conversation is a great example."</div>
            <div className="fc-reactions"><span>😂 134</span><span>💀 67</span></div>
          </div>
        </div>
      </section>

      <div className="home-sections">
      <div className="submit-section home-submit" id="home-submit">
        <div className="submit-inner">
          <div>
            <h2 className="submit-title">Got a story?</h2>
            <p className="submit-sub">Chaotic, wholesome, unhinged, we want it all. Your worst date is someone's best Friday read. Write as much as you want, our AI anonymizes and condenses every story.</p>
          </div>
          <div>
            {!submitResult ? (
              <>
                <div className="submit-form-area">
                  <textarea className="submit-textarea" placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                    rows={5} value={storyText} onChange={e => setStoryText(e.target.value)} />
                  <span className={`submit-char-count ${storyText.length > 500 ? "over" : storyText.length > 400 ? "warn" : ""}`}>{storyText.length}/500</span>
                </div>
                <div className="submit-row">
                  <button className="submit-btn" onClick={handleSubmitStory} disabled={!storyText.trim() || submitting}>
                    {submitting ? <><span className="spinner" /> Our AI is polishing your story...</> : <>Submit story <Arrow /></>}
                  </button>
                </div>
              </>
            ) : (
              <>
                {renderSubmissionPreview()}

                {!authUser && submitResult.type === "approved" && (
                  <div className="post-submit-signup" id="post-submit-signup">
                    <div className="post-submit-signup-rainbow" />
                    <div className="post-submit-signup-inner">
                    <div className="post-submit-signup-header">
                      <div className="post-submit-signup-title">Save your story to your account</div>
                      <div className="post-submit-signup-sub">Create a free account to track reactions, shares, and more.</div>
                    </div>
                    {renderAuthError()}
                    <label className="auth-label">Name</label>
                    <input className="auth-input" type="text" placeholder="Your first name"
                      value={authName} onChange={e => setAuthName(e.target.value)} />
                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email" placeholder="name@email.com"
                      value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />
                    <label className="auth-label">Password</label>
                    <input className="auth-input" type="password" placeholder="At least 6 characters"
                      value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />
                    <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
                      {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
                    </button>
                    <div className="auth-switch">
                      Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                    </div>
                    </div>
                  </div>
                )}

                <button className="submit-another-btn" onClick={() => { setSubmitResult(null); setStoryText(""); setShowSignupPrompt(false); setAuthError(""); setTimeout(() => { const el = document.getElementById("home-submit"); if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: "smooth" }); } }, 50); }}>
                  Submit another story
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="stories-section home-stories">
        <div className="stories-header">
          <div>
            <div className="stories-title">This week's drop</div>
            <div className="rainbow-accent" />
          </div>
          <span className="stories-link" onClick={() => setPage("library")}>Browse all stories <Arrow /></span>
        </div>
        <div className="stories-grid">
          {homeStories.map((s) => (
            <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} />
          ))}
        </div>
      </div>
      </div>

      <div className="how-section">
        <div className="how-inner">
          <div className="how-title">How it works</div>
          <div className="how-grid">
            <div className="how-card"><div className="how-num">01</div><h3>Tell your story</h3><p>Submit your anonymous dating story. Chaotic, wholesome, unhinged, we want it all. No names, no judgment.</p></div>
            <div className="how-card"><div className="how-num">02</div><h3>We give it a glow-up</h3><p>Our AI polishes your story while keeping your voice. All identifying details are removed automatically.</p></div>
            <div className="how-card"><div className="how-num">03</div><h3>Friday drop</h3><p>Every Friday, the best stories go live on the site and land in your inbox. Fresh stories, weekly.</p></div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-title">Your inbox deserves better stories.</div>
        <p className="cta-sub">Bite-sized dating stories from real people, dropping every Friday. Love, Anonymous.</p>
        {ctaSub ? (
          <div className="hero-subbed-success" style={{ maxWidth: 480, margin: "0 auto" }}>✓ You've joined the waitlist! You'll be the first to know when our first Friday drop goes live.</div>
        ) : (
          <div className="cta-email">
            <input className="cta-input" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubscribe("cta"); }} />
            <button className="cta-btn" onClick={() => handleSubscribe("cta")}>Join waitlist</button>
          </div>
        )}
      </div>
      </>)}

      {/* Library */}
      {page === "library" && (
        <div className="library-page">
          <div className="library-header">
            <h1 className="library-title">Story library</h1>
            <p className="library-sub">Every tale from the dating trenches, all in one place.</p>
          </div>
          <div className="library-search">
            <div className="library-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input className="library-search-input" placeholder="Search stories, themes, personas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="library-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
          </div>
          <div className="library-filters">
            {allThemes.map(t => (
              <button key={t} className={`library-filter ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          {!searchQuery && filteredThisWeek.length > 0 && (
            <>
              <div className="library-section-title">This week's drop</div>
              <div className="rainbow-accent" style={{ marginBottom: 20 }} />
              <div className="library-grid">
                {filteredThisWeek.map(s => <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} />)}
              </div>
              <div className="library-divider" />
            </>
          )}
          <div className="library-section-title">{searchQuery ? `Results for "${searchQuery}"` : "All stories"}</div>
          <div className="rainbow-accent" style={{ marginBottom: 20 }} />
          {filteredAll.length > 0 ? (
            <div className="library-grid">
              {filteredAll.map(s => <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} reacted={storyReactions} />)}
            </div>
          ) : (
            <div className="library-grid"><div className="library-empty">{searchQuery ? "No stories match your search." : "No stories found for this filter."}</div></div>
          )}
        </div>
      )}

      {/* Subscribe Page */}
      {page === "subscribe" && (
        <div className="subscribe-page">
          <div className="subscribe-heart">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#2563EB" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1>Get stories every <em>Friday</em></h1>
          <p className="subscribe-page-sub">The funniest, cringiest, and cutest anonymous dating stories, curated and delivered to your inbox weekly.</p>
          {pageSub ? (
            <div className="hero-subbed-success" style={{ marginBottom: 16 }}>✓ You've joined the waitlist! You'll be the first to know when our first Friday drop goes live.</div>
          ) : (<>
            <input className="subscribe-page-input" placeholder="name@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubscribe("page"); }} />
            <button className="subscribe-page-btn" onClick={() => handleSubscribe("page")}>Join waitlist (it's free)</button>
          </>)}
          <p className="subscribe-page-fine">No spam, ever. Unsubscribe anytime.</p>
        </div>
      )}

      {/* Submit Page */}
      {page === "submit" && (
        <div className="submit-page">
          <div className="submit-page-rainbow" />
          <div className="submit-page-card">
            <h1>Spill it. Anonymously.</h1>
            <p className="submit-page-sub">Your story stays between us (and a few thousand readers).</p>

            {/* Show form if no result yet, otherwise show post-submit flow */}
            {!submitResult ? (
              <>
                <div className="submit-page-form">
                  <textarea className="submit-page-textarea" placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                    value={storyText} onChange={e => setStoryText(e.target.value)} />
                  <span className={`submit-page-char ${storyText.length > 500 ? "over" : storyText.length > 400 ? "warn" : ""}`}>{storyText.length}/500</span>
                </div>
                <button className="submit-page-btn" onClick={handleSubmitStory} disabled={!storyText.trim() || submitting}>
                  {submitting ? <><span className="spinner" /> Our AI is polishing your story...</> : "Submit story"}
                </button>
                <p className="submit-page-fine">All stories are anonymized and condensed by AI to fit our format. Write as much as you want, we'll handle the rest.</p>
              </>
            ) : (
              <>
                {renderSubmissionPreview()}

                {/* Inline signup after submission (only if not logged in) */}
                {!authUser && submitResult.type === "approved" && (
                  <div className="post-submit-signup" id="post-submit-signup">
                    <div className="post-submit-signup-rainbow" />
                    <div className="post-submit-signup-inner">
                    <div className="post-submit-signup-header">
                      <div className="post-submit-signup-title">Save your story to your account</div>
                      <div className="post-submit-signup-sub">Create a free account to track reactions, shares, and more.</div>
                    </div>

                    {renderAuthError()}

                    <label className="auth-label">Name</label>
                    <input className="auth-input" type="text" placeholder="Your first name"
                      value={authName} onChange={e => setAuthName(e.target.value)} />

                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email" placeholder="name@email.com"
                      value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />

                    <label className="auth-label">Password</label>
                    <input className="auth-input" type="password" placeholder="At least 6 characters"
                      value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />

                    <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
                      {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
                    </button>

                    <div className="auth-switch">
                      Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                    </div>
                    </div>
                  </div>
                )}

                {/* Submit another story — at the bottom */}
                <button className="submit-another-btn" onClick={() => { setSubmitResult(null); setStoryText(""); setShowSignupPrompt(false); setAuthError(""); }}>
                  Submit another story
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Page */}
      {page === "login" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Log in to track your stories and see how people react.</div>

            {renderAuthError()}

            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="name@email.com"
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />

            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="Your password"
              value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />

            <div className="auth-forgot" onClick={() => { setAuthError(""); setPage("forgot-password"); }}>Forgot password?</div>

            <button className="auth-btn" onClick={handleLogin} disabled={authLoading || !authEmail || !authPassword}>
              {authLoading ? <><span className="spinner" /> Logging in...</> : "Log in"}
            </button>

            <div className="auth-switch">
              Don't have an account? <span className="auth-switch-link" onClick={() => setPage("signup")}>Sign up</span> to save your stories and track reactions.
            </div>
          </div>
        </div>
      )}

      {/* Signup Page */}
      {page === "signup" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Create your account</div>
            <div className="auth-subtitle">Track your stories, see reactions, and know when you go live.</div>

            {renderAuthError()}

            <label className="auth-label">Name</label>
            <input className="auth-input" type="text" placeholder="Your first name"
              value={authName} onChange={e => setAuthName(e.target.value)} />

            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="name@email.com"
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="At least 6 characters"
              value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

            <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
              {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
            </button>

            <div className="auth-switch">
              Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Page */}
      {page === "forgot-password" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Reset your password</div>
            <div className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</div>

            {resetSent ? (
              <div className="auth-success">
                <div className="auth-success-icon">✉️</div>
                <div className="auth-success-title">Check your email</div>
                <div className="auth-success-sub">We sent a reset link to <strong>{authEmail}</strong>. Click the link in the email to set a new password.</div>
                <button className="auth-btn-secondary" onClick={() => { setResetSent(false); setPage("login"); }}>Back to login</button>
              </div>
            ) : (
              <>
                {renderAuthError()}

                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="name@email.com"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleResetRequest(); }} />

                <button className="auth-btn" onClick={handleResetRequest} disabled={authLoading || !authEmail}>
                  {authLoading ? <><span className="spinner" /> Sending...</> : "Send reset link"}
                </button>

                <div className="auth-switch">
                  Remember your password? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Page (from email link) */}
      {page === "reset-password" && (
        <div className="auth-page">
          <div className="auth-card">
            {resetSuccess ? (
              <div className="auth-success">
                <div className="auth-success-icon">✅</div>
                <div className="auth-success-title">Password updated</div>
                <div className="auth-success-sub">Your password has been reset. You can now log in with your new password.</div>
                <button className="auth-btn" onClick={() => { setResetSuccess(false); setResetToken(null); setPage("login"); }}>Log in</button>
              </div>
            ) : resetToken ? (
              <>
                <div className="auth-title">Set a new password</div>
                <div className="auth-subtitle">Choose a new password for your account.</div>

                {renderAuthError()}

                <label className="auth-label">New password</label>
                <input className="auth-input" type="password" placeholder="At least 6 characters"
                  value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleResetPassword(); }} />

                <button className="auth-btn" onClick={handleResetPassword} disabled={authLoading || !authPassword}>
                  {authLoading ? <><span className="spinner" /> Updating...</> : "Update password"}
                </button>
              </>
            ) : (
              <div className="auth-success">
                <div className="auth-success-icon">⚠️</div>
                <div className="auth-success-title">Invalid or expired link</div>
                <div className="auth-success-sub">This password reset link is no longer valid. Please request a new one.</div>
                <button className="auth-btn" onClick={() => setPage("forgot-password")}>Request new link</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard */}
      {page === "dashboard" && (
        authUser ? (
          <div className="dash-page">
            {/* Welcome popup */}
            {showDashWelcome && (
              <div className="dash-welcome-overlay" onClick={() => setShowDashWelcome(false)}>
                <div className="dash-welcome" onClick={e => e.stopPropagation()}>
                  <div className="dash-welcome-emoji">🎉</div>
                  <div className="dash-welcome-title">You're in! Consider this your story HQ.</div>
                  <div className="dash-welcome-text">This is your personal dashboard. Here you can track every story you submit, see how people react to your published stories, and share your favorites.</div>
                  <button className="auth-btn" onClick={() => setShowDashWelcome(false)}>View my stories</button>
                </div>
              </div>
            )}
            <div className="dash-header">
              <div>
                <h1 className="dash-title">My stories</h1>
                <div className="dash-email">{authUser.user.email}</div>
              </div>
              <button className="dash-logout" onClick={handleLogout}>Log out</button>
            </div>

            <div className="dash-stats">
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.length}</div>
                <div className="dash-stat-label">Stories submitted</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.filter(s => s.status === "published").length}</div>
                <div className="dash-stat-label">Published</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.reduce((sum, s) => sum + getTotalReactions(s.reactions), 0)}</div>
                <div className="dash-stat-label">Total reactions</div>
              </div>
            </div>

            <div className="dash-section-title">Your stories</div>
            <div className="rainbow-accent" style={{ marginBottom: 12 }} />

            <div className="dash-filters">
              {["all", "published", "pending"].map(f => (
                <button key={f} className={`dash-filter ${dashFilter === f ? "active" : ""}`} onClick={() => setDashFilter(f)}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="dash-filter-count">{f === "all" ? dashboardStories.length : dashboardStories.filter(s => s.status === f).length}</span>
                </button>
              ))}
            </div>

            {dashboardLoading ? (
              <div className="dash-loading"><span className="spinner" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--blue)", width: 24, height: 24 }} /></div>
            ) : dashboardStories.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">✍️</div>
                <div className="dash-empty-title">No stories yet</div>
                <div className="dash-empty-sub">Share your first dating story and track how people react to it.</div>
                <button className="dash-empty-btn" onClick={() => setPage("submit")}>Share a story</button>
              </div>
            ) : (
              (() => {
                const filtered = dashFilter === "all" ? dashboardStories : dashboardStories.filter(s => s.status === dashFilter);
                return filtered.length === 0 ? (
                  <div className="dash-empty" style={{ padding: "40px 20px" }}>
                    <div className="dash-empty-title">No {dashFilter} stories</div>
                    <div className="dash-empty-sub">Stories will appear here once they're {dashFilter}.</div>
                  </div>
                ) : filtered.map(s => {
                const statusStyle = getStatusColor(s.status);
                const totalReactions = getTotalReactions(s.reactions);
                const isPublished = s.status === "published";
                return (
                  <div key={s.id} className="dash-story">
                    <div className="dash-story-top">
                      <div className="dash-story-title">{s.title || "Untitled"}</div>
                      <span className="dash-story-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>{s.status}</span>
                    </div>
                    <div className="dash-story-text">{s.rewritten_text}</div>

                    {isPublished && (
                      <div className="dash-story-reactions">
                        {EMOJI_OPTIONS.map(emoji => {
                          const count = s.reactions?.[emoji] || 0;
                          return (
                            <span key={emoji} className="dash-reaction-pill">
                              {emoji} <span className="dash-reaction-count">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="dash-story-meta">
                      {!isPublished && <span>📊 {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}</span>}
                      <span>🏷️ {s.theme}</span>
                      <span>📅 {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}</span>
                      {isPublished && (
                        <span className="dash-share-link" onClick={async (e) => {
                          const shareText = `"${s.title}" — ${s.rewritten_text}\n\n— ${s.author_persona} on Date & Tell`;
                          const shareUrl = "https://dateandtell.com";
                          const el = e.currentTarget;
                          try {
                            if (navigator.share) {
                              await navigator.share({ title: s.title, text: shareText, url: shareUrl });
                              return;
                            }
                            if (navigator.clipboard) {
                              await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                              const origText = el.textContent;
                              el.textContent = "Copied!";
                              setTimeout(() => { el.textContent = origText; }, 1500);
                            }
                          } catch {}
                        }}>
                          <ShareIcon /> Share
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
              })()
            )}
          </div>
        ) : (
          <div className="auth-page">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <div className="auth-title">Log in to see your stories</div>
              <div className="auth-subtitle">Create an account or log in to track your stories and reactions.</div>
              <button className="auth-btn" onClick={() => setPage("login")}>Log in</button>
              <div className="auth-switch">
                Don't have an account? <span className="auth-switch-link" onClick={() => setPage("signup")}>Sign up</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">Date&Tell</div>
        <a href="mailto:hello@dateandtell.com" className="footer-email">hello@dateandtell.com</a>
        <div className="footer-copy">© 2026 Date&Tell. Love, Anonymous.</div>
      </footer>
    </div>
  );
}
