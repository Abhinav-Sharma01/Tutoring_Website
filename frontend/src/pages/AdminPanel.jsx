import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/courses"),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-admin * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-pill { padding: 8px 18px; border-radius: 100px; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.25s; border: 1.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(107,143,160,0.9); font-family: 'Cabinet Grotesk', sans-serif; }
    .tp-pill:hover { border-color: rgba(0,212,255,0.25); color: #00d4ff; }
    .tp-pill.active { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.4); color: #00d4ff; box-shadow: 0 0 16px rgba(0,212,255,0.12); }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }
    .tp-search { width: 100%; padding: 10px 16px 10px 40px; background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.07); border-radius: 12px; color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif; font-size: 0.88rem; outline: none; transition: all 0.3s; }
    .tp-search::placeholder { color: rgba(107,143,160,0.5); }
    .tp-search:focus { border-color: rgba(0,212,255,0.35); background: rgba(0,212,255,0.03); box-shadow: 0 0 0 3px rgba(0,212,255,0.07); }
    .tp-table-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 14px 24px; align-items: center; transition: background 0.2s; }
    .tp-table-row:hover { background: rgba(0,212,255,0.03); }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const deleteCourse = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success("Course deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredUsers = searchQuery ? users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())) : users;
  const filteredCourses = searchQuery ? courses.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.category?.toLowerCase().includes(searchQuery.toLowerCase())) : courses;

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  const roleColors = { admin: "#f87171", tutor: "#a78bfa", student: "#00d4ff" };

  if (loading) return (
    <div className="tp-admin tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 200, height: 36, marginBottom: 12 }} />
        <div className="tp-skeleton" style={{ width: 280, height: 18, marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>{[...Array(4)].map((_, i) => <div key={i} className="tp-skeleton" style={{ height: 100 }} />)}</div>
        <div className="tp-skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );

  const summaryCards = [
    { label: "Total Users", value: users.length, icon: "👥", accent: "#00d4ff" },
    { label: "Students", value: users.filter(u => u.role === "student").length, icon: "🎓", accent: "#34d399" },
    { label: "Tutors", value: users.filter(u => u.role === "tutor").length, icon: "👨‍🏫", accent: "#a78bfa" },
    { label: "Courses", value: courses.length, icon: "📚", accent: "#fbbf24" },
  ];

  return (
    <div className="tp-admin tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16, animation: "tp-fade-up 0.6s ease forwards" }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.6rem)", margin: "0 0 8px" }}>Admin Panel</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.95rem" }}>Manage users and courses</p>
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", color: "#9bbeca", fontWeight: 700, fontSize: "0.86rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9bbeca"; }}
          >📥 Export Data</button>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
          {summaryCards.map((s, i) => (
            <div key={i} style={{ background: "rgba(6,14,24,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", transition: "all 0.3s", animation: "tp-fade-up 0.5s ease forwards", animationDelay: `${i * 60}ms`, opacity: 0, animationFillMode: "forwards" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.accent}30`; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "1.3rem", marginBottom: 10 }}>{s.icon}</div>
              <p style={{ color: muted, fontSize: "0.78rem", fontWeight: 600, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ key: "users", label: "Users", count: users.length }, { key: "courses", label: "Courses", count: courses.length }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearchQuery(""); }} className={`tp-pill ${tab === t.key ? "active" : ""}`}>
                {t.label} <span style={{ marginLeft: 6, opacity: 0.6 }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={{ position: "relative", width: 260 }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" className="tp-search" placeholder={`Search ${tab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Users table */}
        {tab === "users" && (
          <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", animation: "tp-fade-up 0.5s ease forwards" }}>
            <div className="tp-table-row" style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["User", "Email", "Role", "Status"].map(h => <span key={h} style={{ fontSize: "0.72rem", fontWeight: 800, color: "#5aafb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>)}
            </div>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>👥</div>
                <p style={{ color: muted }}>No users found.</p>
              </div>
            ) : filteredUsers.map(u => {
              const rc = roleColors[u.role] || roleColors.student;
              return (
                <div key={u._id} className="tp-table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{u.username?.charAt(0)?.toUpperCase() || "?"}</div>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</span>
                  </div>
                  <span style={{ color: muted, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, background: `${rc}12`, border: `1px solid ${rc}28`, color: rc, textTransform: "capitalize", width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc }} />{u.role}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 600, color: u.status === "active" ? "#34d399" : "#f87171" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: u.status === "active" ? "#34d399" : "#f87171" }} />{u.status || "active"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Courses table */}
        {tab === "courses" && (
          <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", animation: "tp-fade-up 0.5s ease forwards" }}>
            <div className="tp-table-row" style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Title", "Category", "Price", "Action"].map(h => <span key={h} style={{ fontSize: "0.72rem", fontWeight: 800, color: "#5aafb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>)}
            </div>
            {filteredCourses.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📚</div>
                <p style={{ color: muted }}>No courses found.</p>
              </div>
            ) : filteredCourses.map(c => (
              <div key={c._id} className="tp-table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                <span style={{ color: muted, fontSize: "0.85rem" }}>{c.category || "—"}</span>
                <span style={{ fontWeight: 800, color: accent, fontSize: "0.92rem" }}>₹{c.price}</span>
                <button onClick={() => deleteCourse(c._id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.25s", width: "fit-content" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                >🗑️ Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;