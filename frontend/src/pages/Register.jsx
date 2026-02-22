import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", agree: false, role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [step, setStep] = useState(1); // Multi-step visual effect

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "tp-register-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
      .tp-register * { box-sizing: border-box; }
      @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      @keyframes tp-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
      @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes tp-slide-right { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      @keyframes tp-float-in-left { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
      @keyframes tp-check-pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }

      .tp-reg-input {
        width: 100%; padding: 14px 16px 14px 48px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
        color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none; transition: all 0.3s ease;
      }
      .tp-reg-input::placeholder { color: rgba(107,143,160,0.55); }
      .tp-reg-input:focus {
        border-color: rgba(167,139,250,0.45);
        background: rgba(167,139,250,0.04);
        box-shadow: 0 0 0 4px rgba(167,139,250,0.08), 0 0 20px rgba(167,139,250,0.06);
      }

      .tp-reg-submit {
        width: 100%; padding: 15px;
        background: linear-gradient(135deg, #a78bfa, #7c3aed);
        border: none; border-radius: 12px; color: #fff;
        font-family: 'Cabinet Grotesk', sans-serif; font-size: 1rem; font-weight: 800;
        cursor: pointer; transition: all 0.3s ease;
        box-shadow: 0 4px 30px rgba(124,58,237,0.35);
        display: flex; align-items: center; justify-content: center; gap: 8px;
        position: relative; overflow: hidden;
      }
      .tp-reg-submit::before {
        content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        transition: left 0.5s;
      }
      .tp-reg-submit:hover::before { left: 100%; }
      .tp-reg-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(124,58,237,0.5); }
      .tp-reg-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      .tp-social-btn {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 13px; background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
        color: #c5dde8; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
      }
      .tp-social-btn:hover { background: rgba(167,139,250,0.07); border-color: rgba(167,139,250,0.25); color: #e2f5f5; transform: translateY(-2px); }

      .tp-gradient-text {
        background: linear-gradient(135deg, #a78bfa, #00d4ff);
        background-size: 200% auto; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: tp-shimmer 3s linear infinite;
      }
      .tp-grid-bg {
        background-image: linear-gradient(rgba(167,139,250,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167,139,250,0.025) 1px, transparent 1px);
        background-size: 52px 52px;
      }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById("tp-register-styles"); if (el) el.remove(); };
  }, []);

  const getStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length > 10 && /[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p))
      return { label: "Strong 🔥", color: "#34d399", width: "100%", textColor: "#34d399" };
    if (p.length >= 8 && (/[A-Z]/.test(p) || /\d/.test(p)))
      return { label: "Good", color: "#00d4ff", width: "66%", textColor: "#00d4ff" };
    if (p.length >= 6)
      return { label: "Fair", color: "#fbbf24", width: "40%", textColor: "#fbbf24" };
    return { label: "Weak", color: "#f87171", width: "20%", textColor: "#f87171" };
  };
  const strength = getStrength();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (name === "name" && value.length > 1) setStep(2);
    if (name === "email" && value.includes("@")) setStep(3);
    if (name === "password" && value.length >= 6) setStep(4);
  };

  const register = async (e) => {
    e.preventDefault();
    if (!form.agree) { setError("Please accept the terms to continue"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/register", { username: form.name, email: form.email, password: form.password, role: form.role });
      setUser(res.data.user);
      toast.success("🎉 Account created! Welcome to TutorPro.");
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  const bg = "#030912";
  const text = "#e2f5f5";
  const muted = "#6b8fa0";
  const accent = "#a78bfa";

  const perks = [
    "Access to all free courses instantly",
    "Personalized learning roadmap",
    "Track progress with beautiful dashboards",
    "Earn verifiable certificates",
    "Join 50,000+ ambitious learners",
  ];

  return (
    <div className="tp-register" style={{ display: "flex", minHeight: "calc(100vh - 64px)", background: bg, fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>

      {/* Left panel */}
      <div style={{ width: "48%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px" }} className="tp-grid-bg">
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #0e0018 0%, #0a0016 60%, #0d001e 100%)", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", top: "-60px", right: "-60px", pointerEvents: "none", animation: "tp-glow-pulse 7s ease-in-out infinite", zIndex: 1 }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)", bottom: "-40px", left: "-40px", pointerEvents: "none", animation: "tp-glow-pulse 9s ease-in-out infinite reverse", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent, #a78bfa, #00d4ff, transparent)", opacity: 0.45, zIndex: 2 }} />

        <div style={{ position: "relative", zIndex: 3 }}>
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2rem", marginBottom: 8 }}>
              Tutor<span style={{ color: "#a78bfa" }}>Pro</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "tp-blink 2s infinite" }} />
              <span style={{ fontSize: "0.78rem", color: "#8b6fc9", letterSpacing: "0.08em" }}>Free forever · No credit card</span>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", lineHeight: 1.1, marginBottom: 20 }}>
            Start your learning<br /><em className="tp-gradient-text" style={{ fontStyle: "normal" }}>journey today</em>
          </h2>
          <p style={{ color: muted, lineHeight: 1.75, fontSize: "0.96rem", marginBottom: 44, maxWidth: 360 }}>
            Create your free account and get instant access to hundreds of expert-led courses.
          </p>

          {/* Progress indicator */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: "0.78rem", color: muted, letterSpacing: "0.06em" }}>SETUP PROGRESS</span>
              <span style={{ fontSize: "0.78rem", color: accent, fontWeight: 700 }}>{Math.min(step - 1, 4)} / 4</span>
            </div>
            <div style={{ height: 4, background: "rgba(167,139,250,0.12)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #a78bfa, #00d4ff)", borderRadius: 100, width: `${((step - 1) / 4) * 100}%`, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["Name", "Email", "Password", "Done"].map((s, i) => (
                <span key={i} style={{ fontSize: "0.72rem", color: i < step - 1 ? accent : muted, fontWeight: i < step - 1 ? 700 : 400, transition: "color 0.3s" }}>{i < step - 1 ? "✓ " : ""}{s}</span>
              ))}
            </div>
          </div>

          {/* Perks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {perks.map((perk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, animation: "tp-float-in-left 0.5s ease forwards", animationDelay: `${i * 100 + 200}ms`, opacity: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <span style={{ fontSize: "0.9rem", color: "#9bbeca" }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px", background: "#04080f", position: "relative" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative", animation: "tp-slide-right 0.6s ease forwards" }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2.1rem", margin: "0 0 10px" }}>Create your account</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.92rem" }}>
              Already have one?{" "}
              <Link to="/login" style={{ color: accent, textDecoration: "none", fontWeight: 700 }}>Sign in →</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: 24, animation: "tp-fade-up 0.3s ease" }}>
              <span style={{ fontSize: "1rem" }}>⚠️</span>
              <span style={{ color: "#f87171", fontSize: "0.88rem", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await api.post("/auth/google", { credential: credentialResponse.credential });
                  setUser(res.data.user);
                  toast.success("Account created! Welcome to TutorPro.");
                  navigate("/dashboard");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Google sign-up failed");
                }
              }}
              onError={() => toast.error("Google sign-up failed")}
              theme="filled_black"
              size="large"
              width="380"
              text="signup_with"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ color: muted, fontSize: "0.8rem", letterSpacing: "0.04em" }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <form onSubmit={register}>
            {/* Role selector */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#8ab0bf", marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>I want to join as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { value: "student", icon: "🎓", label: "Student", desc: "Learn & grow" },
                  { value: "tutor", icon: "📚", label: "Tutor", desc: "Teach & earn" },
                ].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })} style={{
                    padding: "16px 14px", borderRadius: 14,
                    background: form.role === r.value ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.02)",
                    border: `2px solid ${form.role === r.value ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer", textAlign: "center", transition: "all 0.3s ease",
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    boxShadow: form.role === r.value ? "0 0 20px rgba(167,139,250,0.15)" : "none",
                  }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ color: form.role === r.value ? accent : "#e2f5f5", fontWeight: 700, fontSize: "0.95rem" }}>{r.label}</div>
                    <div style={{ color: "#6b8fa0", fontSize: "0.75rem", marginTop: 2 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: focused === "name" ? accent : "#8ab0bf", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.3s" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: focused === "name" ? accent : muted, transition: "color 0.3s" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input name="name" className="tp-reg-input" placeholder="Jane Smith" value={form.name} onChange={handleChange} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} required />
                {form.name.length > 1 && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#34d399", animation: "tp-check-pop 0.3s ease" }}>✓</span>}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: focused === "email" ? accent : "#8ab0bf", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.3s" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: focused === "email" ? accent : muted, transition: "color 0.3s" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input name="email" type="email" className="tp-reg-input" placeholder="you@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} required />
                {form.email.includes("@") && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#34d399" }}>✓</span>}
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: focused === "pwd" ? accent : "#8ab0bf", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.3s" }}>Password</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: focused === "pwd" ? accent : muted, transition: "color 0.3s" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input name="password" type={showPassword ? "text" : "password"} className="tp-reg-input" style={{ paddingRight: 52 }} placeholder="Create a strong password" value={form.password} onChange={handleChange} onFocus={() => setFocused("pwd")} onBlur={() => setFocused("")} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: strength.color, borderRadius: 100, width: strength.width, transition: "width 0.4s ease, background 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: "0.78rem", color: strength.textColor, fontWeight: 600 }}>{strength.label}</span>
                    <span style={{ fontSize: "0.76rem", color: muted }}>Use 8+ chars, a number & symbol</span>
                  </div>
                </div>
              )}
            </div>

            {/* Agreement */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 28, cursor: "pointer" }}>
              <div style={{ position: "relative", flexShrink: 0, marginTop: 2 }}>
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} style={{ display: "none" }} />
                <div onClick={() => setForm({ ...form, agree: !form.agree })} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.agree ? accent : "rgba(255,255,255,0.15)"}`, background: form.agree ? `${accent}20` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", cursor: "pointer" }}>
                  {form.agree && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><path d="M4.5 12.75l6 6 9-13.5" /></svg>}
                </div>
              </div>
              <span style={{ fontSize: "0.87rem", color: muted, lineHeight: 1.6 }}>
                I agree to the{" "}
                <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }}>Terms of Service</span>
                {" "}and{" "}
                <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
              </span>
            </label>

            <button type="submit" className="tp-reg-submit" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "tp-spin 0.8s linear infinite", display: "inline-block" }} />
                  Creating account…
                </>
              ) : (
                <>
                  Create My Account
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: "0.9rem", color: muted }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: accent, textDecoration: "none", fontWeight: 700 }}>Log in</Link>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {["🔒 Encrypted", "✓ Free forever", "🚀 Start instantly"].map((t, i) => (
              <span key={i} style={{ fontSize: "0.74rem", color: muted }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
