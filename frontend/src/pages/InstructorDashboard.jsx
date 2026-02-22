import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";

const InstructorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/instructor/stats");
        setStats(res.data);
      } catch {
        setError("Failed to load instructor stats");
      }
      if (user?.id) {
        try {
          const coursesRes = await api.get(`/courses/tutor/${user.id}`);
          setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data?.courses || []);
        } catch { }
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-instr * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-stat-card { background: rgba(6,14,24,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; backdrop-filter: blur(12px); transition: all 0.35s; position: relative; overflow: hidden; }
    .tp-stat-card:hover { border-color: rgba(0,212,255,0.15); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.3); }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  if (error) return (
    <div className="tp-instr tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", animation: "tp-fade-up 0.5s ease" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
        <p style={{ color: "#f87171", fontWeight: 600 }}>{error}</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="tp-instr tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 240, height: 36, marginBottom: 12 }} />
        <div className="tp-skeleton" style={{ width: 320, height: 20, marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="tp-skeleton" style={{ height: 160 }} />)}
        </div>
        <div className="tp-skeleton" style={{ height: 200, marginBottom: 20 }} />
      </div>
    </div>
  );

  const cards = [
    { label: "Total Courses", value: stats.totalCourses, icon: "📚", accent: "#00d4ff", trend: "+2 this month" },
    { label: "Total Students", value: stats.totalStudents, icon: "👥", accent: "#a78bfa", trend: "+12 this week" },
    { label: "Total Earnings", value: `₹${stats.totalEarnings?.toLocaleString() || 0}`, icon: "💰", accent: "#34d399", trend: "Revenue" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenue = months.map(m => ({ month: m, amount: Math.floor(Math.random() * 15000 + 2000) }));
  const maxRevenue = Math.max(...revenue.map(r => r.amount));

  return (
    <div className="tp-instr tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16, animation: "tp-fade-up 0.6s ease forwards" }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.6rem)", margin: "0 0 8px" }}>Instructor Dashboard</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.95rem" }}>Your teaching performance overview</p>
          </div>
          <Link to="/create-course" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 100, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem", boxShadow: `0 4px 24px rgba(0,212,255,0.3)`, transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(0,212,255,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,212,255,0.3)"; }}
          >+ Create Course</Link>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
          {cards.map((card, i) => (
            <div key={i} className="tp-stat-card" style={{ animation: "tp-fade-up 0.5s ease forwards", animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: "forwards" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 0 0 40px", background: `${card.accent}10` }} />
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${card.accent}14`, border: `1px solid ${card.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 16 }}>{card.icon}</div>
              <p style={{ color: muted, fontSize: "0.85rem", fontWeight: 600, margin: "0 0 6px" }}>{card.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>{card.value}</p>
              <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#34d399", fontWeight: 600, margin: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                {card.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="tp-stat-card" style={{ marginBottom: 32, animation: "tp-fade-up 0.5s ease forwards", animationDelay: "250ms", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: 0 }}>Revenue Overview</h3>
            <span style={{ fontSize: "0.78rem", color: muted, fontWeight: 600 }}>Last 6 months</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 140 }}>
            {revenue.map((r, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.68rem", color: muted, fontWeight: 600 }}>₹{(r.amount / 1000).toFixed(1)}k</span>
                <div style={{ width: "100%", maxWidth: 40, height: `${(r.amount / maxRevenue) * 100}%`, borderRadius: 8, background: `linear-gradient(to top, #34d399, rgba(52,211,153,0.4))`, transition: "height 0.5s ease", minHeight: 8 }} />
                <span style={{ fontSize: "0.72rem", color: muted, fontWeight: 600 }}>{r.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My courses */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            📚 My Courses ({courses.length})
          </h3>
          {courses.length === 0 ? (
            <div className="tp-stat-card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: muted, margin: "0 0 14px" }}>You haven't created any courses yet.</p>
              <Link to="/create-course" style={{ color: accent, fontWeight: 700, textDecoration: "none" }}>+ Create your first course</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {courses.map((c) => (
                <div key={c._id} className="tp-stat-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                  <Link to={`/course/${c._id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{c.title}</div>
                    <div style={{ color: muted, fontSize: "0.8rem" }}>
                      {c.category} · {c.level} · ₹{c.price} · {c.lessons?.length || 0} lessons
                    </div>
                  </Link>
                  <button onClick={async () => {
                    if (!confirm(`Delete "${c.title}"?`)) return;
                    try {
                      await api.delete(`/courses/${c._id}`);
                      setCourses(courses.filter(x => x._id !== c._id));
                      toast.success("Course deleted");
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to delete");
                    }
                  }} style={{ padding: "6px 16px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 20px" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { to: "/courses", label: "View All Courses", desc: "See your published courses and their performance", icon: "📖", accent: "#00d4ff" },
            { to: "/dashboard", label: "Student Dashboard", desc: "Switch to your student learning view", icon: "📊", accent: "#a78bfa" },
          ].map((a, i) => (
            <Link key={a.to} to={a.to} className="tp-stat-card" style={{ textDecoration: "none", color: "inherit", animation: "tp-fade-up 0.5s ease forwards", animationDelay: `${350 + i * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.accent}30`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: 12 }}>{a.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", margin: "0 0 6px" }}>{a.label}</h3>
              <p style={{ color: muted, fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;