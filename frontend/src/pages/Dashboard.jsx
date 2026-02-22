import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-dash * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-stat-card { background: rgba(6,14,24,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; backdrop-filter: blur(12px); transition: all 0.35s; }
    .tp-stat-card:hover { border-color: rgba(0,212,255,0.15); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.3); }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/enrollments/my-enrollments");
        setEnrollments(res.data.enrollments || []);
      } catch { setEnrollments([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const completed = enrollments.filter(e => e.status === "completed").length;
  const inProgress = enrollments.length - completed;
  const overallProgress = enrollments.length ? Math.round((completed / enrollments.length) * 100) : 0;

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  if (loading) return (
    <div className="tp-dash tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "64px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="tp-skeleton" style={{ width: 280, height: 40, marginBottom: 12 }} />
        <div className="tp-skeleton" style={{ width: 340, height: 20, marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="tp-skeleton" style={{ height: 140 }} />)}
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: "Total Courses", value: enrollments.length, icon: "📚", accent: "#00d4ff", desc: "Enrolled courses" },
    { label: "Completed", value: completed, icon: "✅", accent: "#34d399", desc: "Finished courses" },
    { label: "In Progress", value: inProgress, icon: "⏳", accent: "#fbbf24", desc: "Currently learning" },
    { label: "Overall Progress", value: `${overallProgress}%`, icon: "📊", accent: "#a78bfa", desc: "Completion rate" },
  ];

  const weeklyData = [30, 65, 45, 80, 55, 90, 70];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="tp-dash tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ animation: "tp-fade-up 0.6s ease forwards" }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", margin: "0 0 8px" }}>
            Welcome back, <span style={{ color: accent }}>{user?.username || "Learner"}</span>
          </h1>
          <p style={{ color: muted, fontSize: "1rem", margin: "0 0 48px" }}>Here's your learning snapshot</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40, animation: "tp-fade-up 0.6s ease forwards", animationDelay: "100ms", opacity: 0, animationFillMode: "forwards" }}>
          {stats.map((s, i) => (
            <div key={i} className="tp-stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: `${s.accent}12`, border: `1px solid ${s.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{s.icon}</div>
                <span style={{ fontSize: "0.72rem", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>{s.desc}</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: text, letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: "0.82rem", color: s.accent, fontWeight: 700, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "tp-fade-up 0.6s ease forwards", animationDelay: "200ms", opacity: 0, animationFillMode: "forwards" }}>
          {/* Weekly Activity */}
          <div className="tp-stat-card">
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 24px" }}>Weekly Activity</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
              {weeklyData.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ width: "100%", maxWidth: 36, height: `${val}%`, borderRadius: 8, background: `linear-gradient(to top, ${accent}, rgba(0,212,255,0.4))`, transition: "height 0.5s ease", minHeight: 8 }} />
                  <span style={{ fontSize: "0.72rem", color: muted, fontWeight: 600 }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Streak */}
          <div className="tp-stat-card" style={{ background: `linear-gradient(135deg, rgba(0,212,255,0.08), rgba(167,139,250,0.05))`, border: "1px solid rgba(0,212,255,0.12)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔥</div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.5rem", margin: "0 0 8px" }}>7-Day Streak!</h3>
            <p style={{ color: muted, fontSize: "0.9rem", margin: "0 0 20px", lineHeight: 1.6 }}>You're on fire! Keep it going to unlock exclusive badges.</p>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg, ${accent}, #a78bfa)`, width: "70%", transition: "width 1s ease" }} />
            </div>
            <p style={{ fontSize: "0.78rem", color: muted, marginTop: 8 }}>7 of 10 days toward your next badge</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 40, animation: "tp-fade-up 0.6s ease forwards", animationDelay: "300ms", opacity: 0, animationFillMode: "forwards" }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 20px" }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { to: "/courses", label: "Browse Courses", icon: "🔍" },
              { to: "/my-courses", label: "My Courses", icon: "📖" },
              { to: "/payment-history", label: "Payment History", icon: "💳" },
            ].map((a) => (
              <Link key={a.to} to={a.to} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.07)", color: "#9bbeca", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,212,255,0.25)`; e.currentTarget.style.color = accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#9bbeca"; e.currentTarget.style.transform = "translateY(0)"; }}
              ><span>{a.icon}</span>{a.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;