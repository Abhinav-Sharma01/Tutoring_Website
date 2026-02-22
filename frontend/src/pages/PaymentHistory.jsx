import { useEffect, useState } from "react";
import api from "../api/axios";

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/payment-history");
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-pay * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }
    .tp-table-row { display: grid; grid-template-columns: 1.5fr 0.8fr 0.8fr 1fr; gap: 16px; padding: 14px 24px; align-items: center; transition: background 0.2s; }
    .tp-table-row:hover { background: rgba(0,212,255,0.03); }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  const statusConfig = {
    success: { label: "Paid", color: "#34d399" },
    pending: { label: "Pending", color: "#fbbf24" },
    failed: { label: "Failed", color: "#f87171" },
  };

  const totalPaid = history.filter(h => h.paymentStatus === "success").reduce((sum, h) => sum + (h.amount || h.courseId?.price || 0), 0);

  if (loading) return (
    <div className="tp-pay tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 220, height: 36, marginBottom: 12 }} />
        <div className="tp-skeleton" style={{ width: 300, height: 18, marginBottom: 48 }} />
        <div className="tp-skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );

  return (
    <div className="tp-pay tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16, animation: "tp-fade-up 0.6s ease forwards" }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.6rem)", margin: "0 0 8px" }}>Payment History</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.95rem" }}>Your transaction records and receipts</p>
          </div>
          {history.length > 0 && (
            <div style={{ background: "rgba(6,14,24,0.8)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 16, padding: "14px 24px", backdropFilter: "blur(12px)" }}>
              <p style={{ fontSize: "0.72rem", color: muted, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Spent</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: accent, letterSpacing: "-0.03em" }}>₹{totalPaid.toLocaleString()}</p>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>💳</div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.6rem", margin: "0 0 10px" }}>No payments yet</h3>
            <p style={{ color: muted, margin: 0 }}>Payments will appear here when you enroll in courses.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", animation: "tp-fade-up 0.5s ease forwards" }}>
            <div className="tp-table-row" style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Course", "Amount", "Status", "Date"].map(h => <span key={h} style={{ fontSize: "0.72rem", fontWeight: 800, color: "#5aafb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>)}
            </div>
            {history.map((item, i) => {
              const config = statusConfig[item.paymentStatus] || statusConfig.pending;
              const amount = item.amount || item.courseId?.price || 0;
              return (
                <div key={item._id} className="tp-table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", animation: "tp-fade-up 0.4s ease forwards", animationDelay: `${i * 40}ms`, opacity: 0, animationFillMode: "forwards" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,212,255,0.09)", border: "1px solid rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>📘</div>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.courseId?.title ?? "Course"}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "0.92rem" }}>₹{amount.toLocaleString()}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, background: `${config.color}12`, border: `1px solid ${config.color}28`, color: config.color, width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.color }} />{config.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: muted, fontSize: "0.82rem" }}>{new Date(item.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {item.paymentStatus === "success" && <span style={{ color: accent, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Receipt</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
