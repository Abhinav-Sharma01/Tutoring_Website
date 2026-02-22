import { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

function StatItem({ target, suffix, label }) {
  const [count, ref] = useCountUp(target);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, fontFamily: "'Cabinet Grotesk', sans-serif", color: "#e2f5f5", letterSpacing: "-0.03em" }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#5aafb8", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "6px", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const statsData = [
  { target: 50000, suffix: "+", label: "Active Learners" },
  { target: 800, suffix: "+", label: "Expert Courses" },
  { target: 200, suffix: "+", label: "Instructors" },
  { target: 99, suffix: "%", label: "Satisfaction" },
];

const features = [
  { icon: "⚡", title: "Smart Learning Paths", desc: "Our system analyzes your pace and crafts personalized roadmaps that evolve as you grow.", accent: "#00d4ff" },
  { icon: "🎓", title: "Elite Instructors", desc: "Learn from verified experts at Google, MIT, and Y Combinator with proven real-world results.", accent: "#a78bfa" },
  { icon: "🏆", title: "Verified Certificates", desc: "Earn blockchain-verified credentials that employers worldwide recognize and trust.", accent: "#34d399" },
  { icon: "🔴", title: "Live Cohorts", desc: "Join live sessions, office hours, and peer groups that keep you accountable and inspired.", accent: "#f87171" },
  { icon: "📊", title: "Progress Analytics", desc: "Beautiful dashboards track your streaks, scores, and momentum with surgical precision.", accent: "#fbbf24" },
  { icon: "💬", title: "Community Network", desc: "Build your professional circle in curated Slack groups, forums, and mentorship circles.", accent: "#00d4ff" },
];

const testimonials = [
  { name: "Abhinav Sharma", role: "Full Stack Developer", text: "TutorPro took me from zero to job-ready in 4 months. The depth of instruction is unlike anything else on the market.", initials: "AS", grad: "linear-gradient(135deg, #00d4ff, #0094ff)" },
  { name: "Rahul Verma", role: "Backend Developer", text: "I've tried every platform. TutorPro is operating on a completely different tier — the instructors, the production quality, everything.", initials: "RV", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  { name: "Sneha Gupta", role: "Product Designer", text: "Finally a platform that respects learners. Clean, focused, no fluff. The certificate boosted my career in ways I didn't expect.", initials: "SG", grad: "linear-gradient(135deg, #34d399, #059669)" },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.courses || res.data || []);
        if (user) {
          const my = await api.get("/enrollments/my-enrollments");
          setMyCourses(my.data.enrollments || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
      
      .tp-home * { box-sizing: border-box; }
      
      @keyframes tp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes tp-pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
      @keyframes tp-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      @keyframes tp-fade-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      @keyframes tp-spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes tp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @keyframes tp-slide-in-right { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      
      .tp-animate-fade-up { animation: tp-fade-up 0.7s ease forwards; opacity: 0; }
      .tp-animate-slide-right { animation: tp-slide-in-right 0.7s ease forwards; opacity: 0; }
      
      .tp-btn-primary {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 15px 36px; border-radius: 100px;
        background: linear-gradient(135deg, #00d4ff, #0094ff);
        color: #001820; font-family: 'Cabinet Grotesk', sans-serif;
        font-weight: 800; font-size: 0.95rem; text-decoration: none;
        border: none; cursor: pointer;
        box-shadow: 0 0 40px rgba(0,212,255,0.35), 0 4px 20px rgba(0,148,255,0.25);
        transition: all 0.3s ease; letter-spacing: 0.01em;
        position: relative; overflow: hidden;
      }
      .tp-btn-primary::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
        opacity: 0; transition: opacity 0.3s;
      }
      .tp-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 60px rgba(0,212,255,0.55), 0 8px 30px rgba(0,148,255,0.4); }
      .tp-btn-primary:hover::after { opacity: 1; }
      
      .tp-btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 14px 32px; border-radius: 100px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.12);
        color: rgba(226,245,245,0.85); font-family: 'Cabinet Grotesk', sans-serif;
        font-weight: 600; font-size: 0.95rem; text-decoration: none;
        cursor: pointer; transition: all 0.3s ease;
      }
      .tp-btn-ghost:hover { background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.3); color: #00d4ff; transform: translateY(-2px); }
      
      .tp-feature-card {
        background: rgba(10,20,30,0.6);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px; padding: 36px 32px;
        transition: all 0.4s ease;
        position: relative; overflow: hidden;
        backdrop-filter: blur(12px);
      }
      .tp-feature-card::before {
        content: ''; position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--card-accent, #00d4ff), transparent);
        opacity: 0; transition: opacity 0.4s;
      }
      .tp-feature-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.12); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
      .tp-feature-card:hover::before { opacity: 1; }
      
      .tp-course-card {
        background: rgba(8,16,26,0.8);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 20px; overflow: hidden;
        transition: all 0.4s ease;
        backdrop-filter: blur(10px);
        text-decoration: none; color: inherit;
        display: block;
      }
      .tp-course-card:hover { transform: translateY(-8px); border-color: rgba(0,212,255,0.2); box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.06); }
      
      .tp-testimonial-card {
        background: rgba(8,16,26,0.7);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 20px; padding: 36px;
        backdrop-filter: blur(12px);
        transition: all 0.3s ease;
      }
      .tp-testimonial-card:hover { border-color: rgba(0,212,255,0.15); transform: translateY(-4px); }
      
      .tp-section-tag {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 16px; border-radius: 100px;
        background: rgba(0,212,255,0.08);
        border: 1px solid rgba(0,212,255,0.2);
        font-size: 0.76rem; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: #00d4ff; font-family: 'Cabinet Grotesk', sans-serif;
        margin-bottom: 20px;
      }
      
      .tp-gradient-text {
        background: linear-gradient(135deg, #00d4ff 0%, #a78bfa 50%, #34d399 100%);
        background-size: 200% auto;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: tp-shimmer 4s linear infinite;
      }
      
      .tp-grid-bg {
        background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
        background-size: 48px 48px;
      }
      
      .tp-reveal { opacity: 0; transform: translateY(24px); transition: all 0.7s ease; }
      .tp-revealed { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("tp-revealed"); });
    }, { threshold: 0.08 });
    document.querySelectorAll(".tp-reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#030912", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(0,212,255,0.15)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00d4ff", animation: "tp-spin-slow 1s linear infinite" }} />
        </div>
        <p style={{ color: "#5aafb8", fontSize: "0.88rem", fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: "0.08em" }}>Preparing your experience…</p>
      </div>
    </div>
  );

  const bg = "#030912";
  const surf = "rgba(8,16,28,0.9)";
  const text = "#e2f5f5";
  const muted = "#6b8fa0";

  return (
    <div className="tp-home" style={{ background: bg, color: text, fontFamily: "'Cabinet Grotesk', sans-serif", overflowX: "hidden", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", overflow: "hidden" }} className="tp-grid-bg">

        {/* Background orbs */}
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)", top: "-100px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", animation: "tp-glow-pulse 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)", bottom: "5%", left: "-5%", pointerEvents: "none", animation: "tp-glow-pulse 8s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", bottom: "10%", right: "-3%", pointerEvents: "none", animation: "tp-glow-pulse 10s ease-in-out infinite" }} />

        {/* Decorative ring */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.05)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.03)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        {/* Live badge */}
        <div className="tp-animate-fade-up" style={{ animationDelay: "0ms", display: "flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: "100px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)", marginBottom: 32 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "tp-blink 2s infinite", boxShadow: "0 0 8px #34d399" }} />
          <span style={{ fontSize: "0.8rem", color: "#7de8f5", fontWeight: 600, letterSpacing: "0.06em" }}>Personalized learning experience — now live</span>
        </div>

        {/* Hero title */}
        <h1 className="tp-animate-fade-up" style={{ animationDelay: "100ms", fontFamily: "'Instrument Serif', serif", fontSize: "clamp(3.2rem, 8vw, 7rem)", lineHeight: 1, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 28, maxWidth: 900, position: "relative" }}>
          {user ? (
            <>Welcome back,{" "}<em className="tp-gradient-text">{user.username}</em></>
          ) : (
            <>Master the Skills<br />That <em className="tp-gradient-text">Define Futures</em></>
          )}
        </h1>

        <p className="tp-animate-fade-up" style={{ animationDelay: "200ms", fontSize: "1.1rem", color: "#8ab0bf", lineHeight: 1.75, maxWidth: 560, textAlign: "center", marginBottom: 48 }}>
          TutorPro connects ambitious learners with world-class instructors and expert-led courses — turning ambition into expertise, beautifully.
        </p>

        <div className="tp-animate-fade-up" style={{ animationDelay: "300ms", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/courses" className="tp-btn-primary">
            Start Learning Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          {!user && <Link to="/register" className="tp-btn-ghost">Explore Courses</Link>}
        </div>

        {/* Stats strip */}
        <div className="tp-animate-fade-up" style={{ animationDelay: "450ms", display: "flex", gap: 0, marginTop: 80, background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)", borderRadius: 20, padding: "28px 48px", backdropFilter: "blur(16px)", flexWrap: "wrap", justifyContent: "center" }}>
          {statsData.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <StatItem {...s} />
              {i < statsData.length - 1 && <div style={{ width: 1, height: 40, background: "rgba(0,212,255,0.1)", margin: "0 48px" }} />}
            </div>
          ))}
        </div>

        {/* Floating social proof */}
        <div className="tp-animate-slide-right" style={{ animationDelay: "500ms", position: "absolute", right: "5%", top: "42%", background: "rgba(8,18,30,0.9)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 16, padding: "16px 20px", backdropFilter: "blur(20px)", display: "window.innerWidth > 1100 ? flex : none" }}>
          <div style={{ display: "flex", marginBottom: 8 }}>
            {["#00d4ff", "#a78bfa", "#34d399", "#f87171"].map((c, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, marginRight: -7, border: "2px solid #030912", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, color: "#001" }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.78rem", color: "#5aafb8", margin: 0 }}>1,200+ joined this week</p>
          <p style={{ fontSize: "0.82rem", color: "#e2f5f5", fontWeight: 700, margin: "4px 0 0" }}>⭐ 4.9 rated</p>
        </div>
      </section>

      {/* Continue learning */}
      {user && myCourses.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }} className="tp-reveal">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", margin: "0 0 6px" }}>Continue Learning</h2>
              <p style={{ color: muted, margin: 0, fontSize: "0.92rem" }}>Pick up where you left off</p>
            </div>
            <Link to="/my-courses" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 4 }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {myCourses.slice(0, 3).map((enrollment) => {
              const c = enrollment.courseId || enrollment;
              const progress = enrollment.status === "completed" ? 100 : Math.floor(Math.random() * 60 + 25);
              return (
                <div key={enrollment._id} style={{ background: "rgba(8,16,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px", backdropFilter: "blur(12px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0, flex: 1, marginRight: 12, lineHeight: 1.4, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{c.title}</h3>
                    <span style={{ background: progress === 100 ? "rgba(52,211,153,0.12)" : "rgba(0,212,255,0.1)", color: progress === 100 ? "#34d399" : "#00d4ff", padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>{progress === 100 ? "✓ Done" : `${progress}%`}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 100, height: 4, marginBottom: 16 }}>
                    <div style={{ height: "100%", borderRadius: 100, background: progress === 100 ? "linear-gradient(90deg, #34d399, #059669)" : "linear-gradient(90deg, #00d4ff, #0094ff)", width: `${progress}%`, transition: "width 1s ease" }} />
                  </div>
                  <Link to={`/course/${c._id}`} style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>{progress === 100 ? "Review →" : "Continue →"}</Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 32px" }} className="tp-reveal">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="tp-section-tag" style={{ margin: "0 auto 20px" }}>✦ Why TutorPro</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", margin: "0 0 20px", lineHeight: 1.1 }}>
            Everything built for your{" "}
            <em className="tp-gradient-text" style={{ fontStyle: "normal" }}>success</em>
          </h2>
          <p style={{ color: muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.75, fontSize: "1rem" }}>
            A platform engineered around results — from your first lesson to career transformation.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="tp-feature-card" style={{ "--card-accent": f.accent, animationDelay: `${i * 80}ms` }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 20, border: `1px solid ${f.accent}22` }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 12px", color: text }}>{f.title}</h3>
              <p style={{ color: muted, fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular courses */}
      {courses.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 100px" }} className="tp-reveal">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="tp-section-tag">🔥 Trending Now</div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", margin: "0 0 10px", lineHeight: 1.1 }}>Popular Courses</h2>
              <p style={{ color: muted, margin: 0, fontSize: "0.95rem" }}>Join thousands already on these paths</p>
            </div>
            <Link to="/courses" className="tp-btn-ghost" style={{ padding: "10px 24px", fontSize: "0.88rem" }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 22 }}>
            {courses.slice(0, 6).map((course, i) => (
              <Link key={course._id} to={`/course/${course._id}`} className="tp-course-card" style={{ animationDelay: `${i * 70}ms` }}>
                <div style={{ height: 190, background: `linear-gradient(135deg, ${["#0d1f3c", "#0a1628", "#0f1e3a", "#0b1930", "#091523", "#0d1f35"][i % 6]}, ${["#1a3a7c", "#162e5e", "#1f3d76", "#162e6e", "#0e2750", "#1a3a70"][i % 6]})`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>{"📘📗📙📕📓📔"[i % 6]}</span>
                  )}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(3,9,18,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,212,255,0.2)", padding: "4px 12px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 700, color: "#00d4ff" }}>
                    {course.price ? `₹${course.price}` : "Free"}
                  </div>
                </div>
                <div style={{ padding: "20px 22px 24px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(0,212,255,0.09)", color: "#00d4ff", fontSize: "0.71rem", fontWeight: 700, letterSpacing: "0.04em" }}>{course.category || "General"}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(255,255,255,0.06)", color: "#8ab0bf", fontSize: "0.71rem", fontWeight: 600, textTransform: "capitalize" }}>{course.level || "All levels"}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", margin: "0 0 10px", lineHeight: 1.35, color: text, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{course.title}</h3>
                  <p style={{ color: muted, fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>
                  {course.tutorId && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #0094ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#001" }}>
                        {(course.tutorId.username || "I")[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: muted }}>{course.tutorId.username || "Instructor"}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #001a26 0%, #00121c 50%, #001520 100%)", borderTop: "1px solid rgba(0,212,255,0.08)", borderBottom: "1px solid rgba(0,212,255,0.08)" }} className="tp-reveal">
        <div style={{ position: "absolute", inset: 0 }} className="tp-grid-bg" />
        <div style={{ position: "absolute", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 48, position: "relative" }}>
          {statsData.map((s, i) => <StatItem key={i} {...s} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 32px" }} className="tp-reveal">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="tp-section-tag" style={{ margin: "0 auto 20px" }}>♥ Student Stories</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0 0 16px" }}>
            What our learners <em className="tp-gradient-text" style={{ fontStyle: "normal" }}>say</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
          {testimonials.map((t, i) => (
            <div key={i} className="tp-testimonial-card">
              <div style={{ fontSize: "4rem", color: "rgba(0,212,255,0.2)", lineHeight: 1, marginBottom: 16, fontFamily: "serif" }}>"</div>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#fbbf24", fontSize: "0.95rem" }}>★</span>)}
              </div>
              <p style={{ color: "#9bbeca", lineHeight: 1.75, marginBottom: 28, fontSize: "0.94rem" }}>{t.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#001", fontSize: "0.85rem", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{t.name}</div>
                  <div style={{ color: muted, fontSize: "0.78rem", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 32px" }} className="tp-reveal">
          <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", padding: "80px 64px", background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(167,139,250,0.05) 100%)", border: "1px solid rgba(0,212,255,0.12)", textAlign: "center" }}>
            <div style={{ position: "absolute", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2.2rem, 4vw, 3.5rem)", margin: "0 0 20px", lineHeight: 1.1 }}>
                Start your journey<br /><em className="tp-gradient-text" style={{ fontStyle: "normal" }}>today — for free</em>
              </h2>
              <p style={{ color: muted, margin: "0 auto 40px", maxWidth: 440, lineHeight: 1.7 }}>No credit card. No commitment. Just thousands of hours of world-class learning.</p>
              <Link to="/register" className="tp-btn-primary" style={{ fontSize: "1rem", padding: "16px 44px" }}>
                Create Free Account
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 32px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.6rem", marginBottom: 8 }}>
              Tutor<span style={{ color: "#00d4ff" }}>Pro</span>
            </div>
            <p style={{ color: muted, fontSize: "0.85rem", maxWidth: 280, lineHeight: 1.6 }}>Empowering learners worldwide with expert-led, adaptive education.</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["About", "Courses", "Blog", "Careers", "Privacy", "Terms"].map(link => (
              <a key={link} href="#" style={{ color: muted, textDecoration: "none", fontSize: "0.88rem", transition: "color 0.3s" }} onMouseEnter={e => e.target.style.color = "#00d4ff"} onMouseLeave={e => e.target.style.color = muted}>{link}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 40, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: muted, fontSize: "0.8rem", margin: 0 }}>© {new Date().getFullYear()} TutorPro Inc. All rights reserved.</p>
          <p style={{ color: muted, fontSize: "0.8rem", margin: 0 }}>Made with ❤️ for learners everywhere</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
