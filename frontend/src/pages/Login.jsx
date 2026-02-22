import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "tp-login-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');

      .tp-login * { box-sizing: border-box; }

      @keyframes tp-fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      @keyframes tp-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
      @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes tp-float-in-left { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes tp-slide-right { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      
      .tp-login-input {
        width: 100%; padding: 14px 16px 14px 48px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none;
        transition: all 0.3s ease;
      }
      .tp-login-input::placeholder { color: rgba(107,143,160,0.6); }
      .tp-login-input:focus {
        border-color: rgba(0,212,255,0.45);
        background: rgba(0,212,255,0.04);
        box-shadow: 0 0 0 4px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.06);
      }
      
      .tp-social-btn {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 13px 20px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        color: #c5dde8; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.9rem; font-weight: 600; cursor: pointer;
        transition: all 0.3s ease;
      }
      .tp-social-btn:hover { background: rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.2); color: #e2f5f5; transform: translateY(-2px); }
      
      .tp-submit-btn {
        width: 100%; padding: 15px;
        background: linear-gradient(135deg, #00d4ff, #0094ff);
        border: none; border-radius: 12px;
        color: #001820; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 1rem; font-weight: 800; cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 30px rgba(0,212,255,0.3);
        display: flex; align-items: center; justify-content: center; gap: 8px;
        position: relative; overflow: hidden;
      }
      .tp-submit-btn::before {
        content: ''; position: absolute; top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        transition: left 0.5s ease;
      }
      .tp-submit-btn:hover::before { left: 100%; }
      .tp-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,212,255,0.45); }
      .tp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      
      .tp-gradient-text {
        background: linear-gradient(135deg, #00d4ff, #a78bfa);
        background-size: 200% auto;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        animation: tp-shimmer 3s linear infinite;
      }
      
      .tp-grid-bg {
        background-image: linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
        background-size: 52px 52px;
      }
      
      .tp-feature-item { 
        display: flex; align-items: center; gap: 14px;
        animation: tp-float-in-left 0.6s ease forwards; opacity: 0;
      }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById("tp-login-styles"); if (el) el.remove(); };
  }, []);

  const login = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) { toast.error("Email and password are required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const bg = "#030912";
  const text = "#e2f5f5";
  const muted = "#6b8fa0";

  const panelFeatures = [
    { icon: "🎯", title: "Personalized learning", desc: "Smart learning tailored to your pace" },
    { icon: "📊", title: "Real-time progress tracking", desc: "Beautiful dashboards to stay on course" },
    { icon: "🏆", title: "Verified certificates", desc: "Credentials employers actually value" },
  ];

  return (
    <div className="tp-login" style={{ display: "flex", minHeight: "calc(100vh - 64px)", background: bg, fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>

      {/* Left panel */}
      <div style={{ width: "48%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px" }} className="tp-grid-bg">
        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #001828 0%, #000f1a 60%, #001220 100%)", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", top: "-80px", right: "-80px", pointerEvents: "none", animation: "tp-glow-pulse 7s ease-in-out infinite", zIndex: 1 }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)", bottom: "-60px", left: "-40px", pointerEvents: "none", animation: "tp-glow-pulse 9s ease-in-out infinite reverse", zIndex: 1 }} />

        {/* Decorative corner accent */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent, #00d4ff, #a78bfa, transparent)", opacity: 0.4, zIndex: 2 }} />

        <div style={{ position: "relative", zIndex: 3 }}>
          {/* Brand */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2rem", marginBottom: 4 }}>
              Tutor<span style={{ color: "#00d4ff" }}>Pro</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "tp-blink 2s infinite" }} />
              <span style={{ fontSize: "0.78rem", color: "#5aafb8", letterSpacing: "0.08em" }}>50,000+ learners growing daily</span>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", lineHeight: 1.1, marginBottom: 24 }}>
            Welcome back to<br />your <em className="tp-gradient-text" style={{ fontStyle: "normal" }}>learning journey</em>
          </h2>
          <p style={{ color: muted, lineHeight: 1.75, fontSize: "0.98rem", marginBottom: 52, maxWidth: 380 }}>
            Pick up right where you left off. Your progress, your courses, your certificates — all waiting for you.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {panelFeatures.map((f, i) => (
              <div key={i} className="tp-feature-item" style={{ animationDelay: `${i * 120 + 300}ms` }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 2 }}>{f.title}</div>
                  <div style={{ color: muted, fontSize: "0.82rem" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof avatars */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex" }}>
              {["#00d4ff", "#a78bfa", "#34d399", "#f87171"].map((c, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, marginRight: -8, border: "2px solid #000f1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#001" }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span style={{ fontSize: "0.83rem", color: muted }}>Join 50,000+ ambitious learners</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px", background: "#040c16", position: "relative" }}>
        {/* Subtle center glow */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative", animation: "tp-slide-right 0.6s ease forwards" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2.1rem", margin: "0 0 10px", letterSpacing: "-0.01em" }}>Sign in</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.92rem" }}>
              New here?{" "}
              <Link to="/register" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>Create a free account →</Link>
            </p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await api.post("/auth/google", { credential: credentialResponse.credential });
                  setUser(res.data.user);
                  toast.success("Welcome back!");
                  navigate("/dashboard");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Google sign-in failed");
                }
              }}
              onError={() => toast.error("Google sign-in failed")}
              theme="filled_black"
              size="large"
              width="380"
              text="signin_with"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ color: muted, fontSize: "0.8rem", letterSpacing: "0.04em" }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Form */}
          <form onSubmit={login}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 700, color: focused === "email" ? "#00d4ff" : "#8ab0bf", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.3s" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#00d4ff" : muted, transition: "color 0.3s" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input type="email" className="tp-login-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: "0.83rem", fontWeight: 700, color: focused === "pwd" ? "#00d4ff" : "#8ab0bf", letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.3s" }}>Password</label>
                <span style={{ fontSize: "0.82rem", color: "#00d4ff", cursor: "pointer", fontWeight: 600 }}>Forgot?</span>
              </div>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: focused === "pwd" ? "#00d4ff" : muted, transition: "color 0.3s" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input type={showPassword ? "text" : "password"} className="tp-login-input" style={{ paddingRight: 52 }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused("pwd")} onBlur={() => setFocused("")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif", padding: "4px 8px", borderRadius: 6, transition: "color 0.3s" }} onMouseEnter={e => e.target.style.color = text} onMouseLeave={e => e.target.style.color = muted}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <input type="checkbox" id="remember" style={{ width: 16, height: 16, accentColor: "#00d4ff", cursor: "pointer" }} />
              <label htmlFor="remember" style={{ fontSize: "0.87rem", color: muted, cursor: "pointer" }}>Remember me for 30 days</label>
            </div>

            {/* Submit */}
            <button type="submit" className="tp-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,24,32,0.3)", borderTopColor: "#001820", animation: "tp-spin 0.8s linear infinite", display: "inline-block" }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: "0.9rem", color: muted }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>Sign up free</Link>
          </p>

          {/* Trust signals */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {["🔒 Secure login", "✓ No spam", "⚡ Instant access"].map((t, i) => (
              <span key={i} style={{ fontSize: "0.75rem", color: muted }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
