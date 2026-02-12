"use client";
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://vopnqpulwbofvbyztcta.supabase.co";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editPersona, setEditPersona] = useState("");
  const [editTheme, setEditTheme] = useState("");

  const login = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      localStorage.setItem("admin_pass", password);
    } else {
      alert("Wrong password");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_pass");
    if (saved) {
      setPassword(saved);
      fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: saved }),
      }).then(res => { if (res.ok) setAuthed(true); });
    }
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/stories?status=${filter}`, {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      const data = await res.json();
      setStories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchStories();
  }, [authed, filter]);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id, status }),
    });
    setStories(prev => prev.filter(s => s.id !== id));
    setActionLoading(null);
  };

  const startEdit = (story) => {
    setEditing(story.id);
    setEditTitle(story.title || "");
    setEditText(story.rewritten_text || "");
    setEditPersona(story.author_persona || "");
    setEditTheme(story.theme || "");
  };

  const saveEdit = async (id) => {
    setActionLoading(id);
    await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({
        id,
        title: editTitle,
        rewritten_text: editText,
        author_persona: editPersona,
        theme: editTheme,
      }),
    });
    setStories(prev => prev.map(s => s.id === id ? {
      ...s, title: editTitle, rewritten_text: editText,
      author_persona: editPersona, theme: editTheme,
    } : s));
    setEditing(null);
    setActionLoading(null);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #FAFAF7; color: #2C2C2C; }
    .admin-wrap { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .admin-header { margin-bottom: 32px; }
    .admin-header h1 { font-family: 'DM Serif Display', serif; font-size: 32px; margin-bottom: 4px; }
    .admin-header p { color: #6B6B6B; font-size: 14px; }
    .login-card {
      max-width: 400px; margin: 120px auto; background: white; padding: 40px;
      border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #E8E4DF;
      text-align: center;
    }
    .login-card h1 { font-family: 'DM Serif Display', serif; font-size: 28px; margin-bottom: 8px; }
    .login-card p { color: #6B6B6B; font-size: 14px; margin-bottom: 24px; }
    .login-input {
      width: 100%; padding: 14px 18px; border: 2px solid #E8E4DF; border-radius: 12px;
      font-size: 15px; font-family: inherit; margin-bottom: 14px; background: #FAFAF7;
    }
    .login-input:focus { outline: none; border-color: #5B8FB9; }
    .login-btn {
      width: 100%; padding: 14px; background: #E8836B; color: white; border: none;
      border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: background 0.2s;
    }
    .login-btn:hover { background: #D4654D; }
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .filter-tab {
      padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 600;
      border: 1.5px solid #E8E4DF; background: white; cursor: pointer;
      font-family: inherit; color: #6B6B6B; transition: all 0.2s;
    }
    .filter-tab:hover { border-color: #5B8FB9; color: #3A6B8C; }
    .filter-tab.active { background: #5B8FB9; color: white; border-color: #5B8FB9; }
    .story-row {
      background: white; border-radius: 16px; padding: 24px; margin-bottom: 16px;
      border: 1px solid #E8E4DF; transition: box-shadow 0.2s;
    }
    .story-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .story-row-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
    .story-row h3 { font-family: 'DM Serif Display', serif; font-size: 20px; }
    .story-row-meta { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .story-tag {
      font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .tag-theme { background: #E8F1F8; color: #3A6B8C; }
    .tag-persona { background: #FFF0EC; color: #D4654D; }
    .tag-status { background: #FEFCBF; color: #975A16; }
    .story-row .original { font-size: 13px; color: #9A9A9A; margin-bottom: 8px; padding: 12px; background: #FAFAF7; border-radius: 8px; }
    .story-row .original strong { color: #6B6B6B; }
    .story-row .rewritten { font-size: 14px; color: #2C2C2C; line-height: 1.6; margin-bottom: 12px; }
    .story-row .rewritten strong { color: #6B6B6B; font-size: 12px; }
    .story-actions { display: flex; gap: 8px; }
    .btn-approve {
      padding: 10px 24px; background: #38A169; color: white; border: none;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: background 0.2s;
    }
    .btn-approve:hover { background: #2F855A; }
    .btn-reject {
      padding: 10px 24px; background: white; color: #E53E3E; border: 1.5px solid #FED7D7;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-reject:hover { background: #FFF5F5; border-color: #E53E3E; }
    .btn-publish {
      padding: 10px 24px; background: #5B8FB9; color: white; border: none;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: background 0.2s;
    }
    .btn-publish:hover { background: #3A6B8C; }
    .empty { text-align: center; padding: 60px; color: #9A9A9A; }
    .empty p { font-size: 16px; font-weight: 600; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card {
      background: white; border: 1px solid #E8E4DF; border-radius: 12px;
      padding: 16px 24px; flex: 1; min-width: 140px;
    }
    .stat-card .num { font-family: 'DM Serif Display', serif; font-size: 28px; }
    .stat-card .label { font-size: 12px; color: #9A9A9A; font-weight: 500; }
    .timestamp { font-size: 11px; color: #9A9A9A; }
    .edit-field { width: 100%; padding: 10px 14px; border: 2px solid #E8E4DF; border-radius: 10px; font-size: 14px; font-family: inherit; margin-bottom: 8px; background: #FAFAF7; resize: vertical; }
    .edit-field:focus { outline: none; border-color: #5B8FB9; }
    .edit-label { font-size: 11px; font-weight: 700; color: #9A9A9A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .edit-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .edit-row .edit-field { flex: 1; }
    .btn-edit {
      padding: 10px 24px; background: white; color: #5B8FB9; border: 1.5px solid #BDD8EC;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-edit:hover { background: #E8F1F8; border-color: #5B8FB9; }
    .btn-save {
      padding: 10px 24px; background: #5B8FB9; color: white; border: none;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: background 0.2s;
    }
    .btn-save:hover { background: #3A6B8C; }
    .btn-cancel {
      padding: 10px 24px; background: white; color: #6B6B6B; border: 1.5px solid #E8E4DF;
      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-cancel:hover { background: #F5F5F0; }
  `;

  if (!authed) {
    return (
      <div>
        <style>{css}</style>
        <div className="login-card">
          <h1>DatingTales Admin</h1>
          <p>Enter your password to manage stories</p>
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") login(); }}
          />
          <button className="login-btn" onClick={login}>Log in</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{css}</style>
      <div className="admin-wrap">
        <div className="admin-header">
          <h1>DatingTales Admin</h1>
          <p>Review, approve, and manage story submissions</p>
        </div>

        <div className="filter-tabs">
          {["pending", "approved", "published", "rejected"].map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty"><p>Loading...</p></div>
        ) : stories.length === 0 ? (
          <div className="empty">
            <p>No {filter} stories</p>
          </div>
        ) : (
          stories.map(story => (
            <div className="story-row" key={story.id}>
              {editing === story.id ? (
                <>
                  <div className="edit-label">Title</div>
                  <input className="edit-field" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  <div className="edit-row">
                    <div style={{flex:1}}>
                      <div className="edit-label">Theme</div>
                      <select className="edit-field" value={editTheme} onChange={e => setEditTheme(e.target.value)}>
                        <option>First Dates</option>
                        <option>Meet Cutes</option>
                        <option>Dating App Disasters</option>
                        <option>Awkward Moments</option>
                        <option>Meeting the Family</option>
                        <option>Situationships</option>
                      </select>
                    </div>
                    <div style={{flex:1}}>
                      <div className="edit-label">Persona</div>
                      <input className="edit-field" value={editPersona} onChange={e => setEditPersona(e.target.value)} />
                    </div>
                  </div>
                  <div className="edit-label">Rewritten story</div>
                  <textarea className="edit-field" rows={5} value={editText} onChange={e => setEditText(e.target.value)} />
                  {story.original_text && (
                    <div className="original">
                      <strong>Original:</strong> {story.original_text}
                    </div>
                  )}
                  <div className="story-actions" style={{marginTop: 12}}>
                    <button className="btn-save" onClick={() => saveEdit(story.id)} disabled={actionLoading === story.id}>
                      {actionLoading === story.id ? "..." : "Save"}
                    </button>
                    <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="story-row-header">
                    <h3>{story.title || "Untitled"}</h3>
                    <span className="timestamp">
                      {new Date(story.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="story-row-meta">
                    {story.theme && <span className="story-tag tag-theme">{story.theme}</span>}
                    {story.author_persona && <span className="story-tag tag-persona">{story.author_persona}</span>}
                    <span className="story-tag tag-status">{story.status}</span>
                  </div>
                  {story.original_text && (
                    <div className="original">
                      <strong>Original:</strong> {story.original_text}
                    </div>
                  )}
                  {story.rewritten_text && (
                    <div className="rewritten">
                      <strong>AI rewritten:</strong><br />{story.rewritten_text}
                    </div>
                  )}
                  <div className="story-actions">
                    <button className="btn-edit" onClick={() => startEdit(story)}>Edit</button>
                    {filter === "pending" && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => updateStatus(story.id, "approved")}
                          disabled={actionLoading === story.id}
                        >
                          {actionLoading === story.id ? "..." : "Approve"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => updateStatus(story.id, "rejected")}
                          disabled={actionLoading === story.id}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {filter === "approved" && (
                      <button
                        className="btn-publish"
                        onClick={() => updateStatus(story.id, "published")}
                        disabled={actionLoading === story.id}
                      >
                        {actionLoading === story.id ? "..." : "Publish now"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
