import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const s = document.createElement("style");
        s.id = "tp-forgot-styles";
        s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
      .tp-fp * { box-sizing: border-box; }
      @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .tp-fp-input {
        width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
        color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none; transition: all 0.3s ease;
      }
      .tp-fp-input::placeholder { color: rgba(107,143,160,0.55); }
      .tp-fp-input:focus { border-color: rgba(0,212,255,0.45); background: rgba(0,212,255,0.04); box-shadow: 0 0 0 4px rgba(0,212,255,0.08); }
      .tp-grid-bg {
        background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px);
        background-size: 52px 52px;
      }
    `;
        document.head.appendChild(s);
        return () => { const el = document.getElementById("tp-forgot-styles"); if (el) el.remove(); };
    }, []);

    const accent = "#00d4ff";
    const muted = "#6b8fa0";

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Enter your email");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword) return toast.error("Fill in all fields");
        if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { email, otp, newPassword, confirmPassword });
            toast.success("Password reset! You can now log in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        if (!newPassword) return { level: 0, label: "", color: "" };
        let s = 0;
        if (newPassword.length >= 6) s++;
        if (newPassword.length >= 8) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        if (s <= 1) return { level: 1, label: "Weak", color: "#f87171" };
        if (s <= 3) return { level: 2, label: "Medium", color: "#fbbf24" };
        return { level: 3, label: "Strong", color: "#34d399" };
    })();

    return (
        <div className="tp-fp tp-grid-bg" style={{ background: "#030912", minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: "#e2f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
            <div style={{ width: "100%", maxWidth: 440, animation: "tp-fade-up 0.6s ease" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>{step === 1 ? "🔐" : "🔑"}</div>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2rem", margin: "0 0 8px" }}>
                        {step === 1 ? "Forgot Password?" : "Reset Your Password"}
                    </h1>
                    <p style={{ color: muted, fontSize: "0.92rem", margin: 0 }}>
                        {step === 1
                            ? "Enter your email and we'll send you a verification code"
                            : `Enter the 6-digit code sent to ${email}`}
                    </p>
                </div>

                <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "36px 32px", backdropFilter: "blur(12px)" }}>
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Email Address</label>
                            <input className="tp-fp-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 24 }} />
                            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "rgba(0,212,255,0.3)" : `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.95rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", boxShadow: loading ? "none" : "0 4px 24px rgba(0,212,255,0.3)" }}>
                                {loading ? "Sending..." : "Send Verification Code →"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Verification Code</label>
                            <input className="tp-fp-input" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} style={{ marginBottom: 20, textAlign: "center", fontSize: "1.4rem", letterSpacing: "8px", fontWeight: 800 }} />

                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>New Password</label>
                            <div style={{ position: "relative", marginBottom: 4 }}>
                                <input className="tp-fp-input" type={showPass ? "text" : "password"} placeholder="Create a strong password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{showPass ? "Hide" : "Show"}</button>
                            </div>
                            {newPassword && (
                                <div style={{ display: "flex", gap: 4, marginBottom: 16, marginTop: 8 }}>
                                    {[1, 2, 3].map(l => (
                                        <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: l <= strength.level ? strength.color : "rgba(255,255,255,0.06)", transition: "all 0.3s" }} />
                                    ))}
                                    <span style={{ fontSize: "0.72rem", color: strength.color, fontWeight: 600, marginLeft: 8 }}>{strength.label}</span>
                                </div>
                            )}

                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, marginTop: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>Confirm Password</label>
                            <input className="tp-fp-input" type={showPass ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ marginBottom: newPassword && confirmPassword && newPassword !== confirmPassword ? 4 : 24 }} />
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p style={{ color: "#f87171", fontSize: "0.78rem", margin: "4px 0 16px", fontWeight: 600 }}>Passwords don't match</p>
                            )}

                            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "rgba(0,212,255,0.3)" : `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.95rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", boxShadow: loading ? "none" : "0 4px 24px rgba(0,212,255,0.3)" }}>
                                {loading ? "Resetting..." : "Reset Password →"}
                            </button>

                            <button type="button" onClick={() => { setStep(1); setOtp(""); setNewPassword(""); setConfirmPassword(""); }} style={{ width: "100%", padding: "12px", marginTop: 12, background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: muted, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                                ← Back to email
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <a href="/login" style={{ color: accent, fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" }}>← Back to Sign In</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
