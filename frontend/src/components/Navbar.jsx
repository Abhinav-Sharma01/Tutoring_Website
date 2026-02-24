import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/auth-context";
import api from "../api/axios";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  const logout = async () => { try { await api.post("/auth/logout"); } finally { setUser(null); setProfileOpen(false); } };

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname]);
  useEffect(() => { const fn = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); }; document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn); }, []);

  const isActive = (p) => location.pathname === p;
  const accent = "#00d4ff";
  const muted = "#6b8fa0";
  const bg = "#030912";
  const initial = user?.username?.charAt(0)?.toUpperCase() || "?";

  const roleMap = {
    admin: { text: "Admin", color: "#f87171" },
    tutor: { text: "Instructor", color: "#a78bfa" },
    student: { text: "Student", color: accent },
  };
  const role = roleMap[user?.role] || roleMap.student;

  const navStyle = (path) => ({
    padding: "7px 16px", borderRadius: 10,
    fontSize: "0.88rem", fontWeight: 600,
    color: isActive(path) ? accent : "#9bbeca",
    background: isActive(path) ? "rgba(0,212,255,0.07)" : "transparent",
    textDecoration: "none", transition: "all 0.25s",
    fontFamily: "'Cabinet Grotesk', sans-serif",
  });

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(3,9,18,0.88)" : "rgba(3,9,18,0.95)",
      backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      borderBottom: `1px solid ${scrolled ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)"}`,
      transition: "all 0.3s",
      fontFamily: "'Cabinet Grotesk', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>

        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px rgba(0,212,255,0.3)`, transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ color: "#001820", fontWeight: 900, fontSize: "0.85rem" }}>T</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.35rem", color: "#e2f5f5" }}>
            Tutor<span style={{ color: accent }}>Pro</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="tp-nav-desktop">
          <Link to="/courses" style={navStyle("/courses")}
            onMouseEnter={e => { if (!isActive("/courses")) e.target.style.color = accent; }}
            onMouseLeave={e => { if (!isActive("/courses")) e.target.style.color = "#9bbeca"; }}
          >Courses</Link>
          {user && (
            <>
              <Link to="/my-courses" style={navStyle("/my-courses")}
                onMouseEnter={e => { if (!isActive("/my-courses")) e.target.style.color = accent; }}
                onMouseLeave={e => { if (!isActive("/my-courses")) e.target.style.color = "#9bbeca"; }}
              >My Courses</Link>
              <Link to="/dashboard" style={navStyle("/dashboard")}
                onMouseEnter={e => { if (!isActive("/dashboard")) e.target.style.color = accent; }}
                onMouseLeave={e => { if (!isActive("/dashboard")) e.target.style.color = "#9bbeca"; }}
              >Dashboard</Link>
              {(user.role === "tutor" || user.role === "admin") && (
                <Link to="/instructor" style={navStyle("/instructor")}
                  onMouseEnter={e => { if (!isActive("/instructor")) e.target.style.color = accent; }}
                  onMouseLeave={e => { if (!isActive("/instructor")) e.target.style.color = "#9bbeca"; }}
                >Instructor</Link>
              )}
              {user.role === "admin" && (
                <Link to="/admin" style={navStyle("/admin")}
                  onMouseEnter={e => { if (!isActive("/admin")) e.target.style.color = accent; }}
                  onMouseLeave={e => { if (!isActive("/admin")) e.target.style.color = "#9bbeca"; }}
                >Admin</Link>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="tp-nav-right">
          {user && (
            <button style={{ position: "relative", width: 38, height: 38, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,212,255,0.2)`; e.currentTarget.style.color = accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = muted; }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#f87171", border: `2px solid ${bg}` }} />
            </button>
          )}

          {user ? (
            <div ref={profileRef} style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", borderRadius: 12, background: "transparent", border: "none", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 12px rgba(0,212,255,0.3)" }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontWeight: 800, fontSize: "0.8rem", boxShadow: "0 2px 12px rgba(0,212,255,0.3)" }}>{initial}</div>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {profileOpen && (
                <div style={{ position: "absolute", right: 0, marginTop: 8, width: 280, borderRadius: 16, background: "rgba(6,14,24,0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,255,0.05)", zIndex: 50, animation: "tp-fade-up 0.25s ease forwards", overflow: "hidden" }}>
                  {/* User info */}
                  <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 16px rgba(0,212,255,0.3)" }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontWeight: 800, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,212,255,0.3)" }}>{initial}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e2f5f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.username}</div>
                        <div style={{ fontSize: "0.78rem", color: muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                      </div>
                    </div>
                    <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, color: role.color, background: `${role.color}15`, border: `1px solid ${role.color}30`, letterSpacing: "0.06em" }}>{role.text}</span>
                  </div>

                  {/* Links */}
                  <div style={{ padding: "6px 0" }}>
                    {[
                      { to: "/dashboard", label: "Dashboard", icon: "⊞" },
                      { to: "/settings", label: "Settings", icon: "⚙️" },
                      { to: "/my-courses", label: "My Courses", icon: "📚" },
                      { to: "/payment-history", label: "Payments", icon: "💳" },
                    ].map((item) => (
                      <Link key={item.to} to={item.to} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", fontSize: "0.88rem", fontWeight: 500, color: "#9bbeca", textDecoration: "none", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.05)"; e.currentTarget.style.color = "#e2f5f5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9bbeca"; }}
                      >
                        <span style={{ fontSize: "0.95rem" }}>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6px 0" }}>
                    <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 18px", fontSize: "0.88rem", fontWeight: 600, color: "#f87171", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: "0.95rem" }}>⏻</span>Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link to="/login" style={{ padding: "8px 18px", fontSize: "0.88rem", fontWeight: 600, color: "#9bbeca", textDecoration: "none", borderRadius: 10, transition: "all 0.25s" }}
                onMouseEnter={e => e.currentTarget.style.color = accent}
                onMouseLeave={e => e.currentTarget.style.color = "#9bbeca"}
              >Log in</Link>
              <Link to="/register" style={{ padding: "9px 22px", fontSize: "0.88rem", fontWeight: 800, color: "#001820", background: `linear-gradient(135deg, ${accent}, #0094ff)`, borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,212,255,0.3)", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(0,212,255,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,255,0.3)"; }}
              >Sign up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", width: 38, height: 38, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", alignItems: "center", justifyContent: "center", color: "#9bbeca" }} className="tp-mobile-toggle">
            {menuOpen
              ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(3,9,18,0.98)", padding: "16px 32px 24px", display: "flex", flexDirection: "column", gap: 4 }} className="tp-mobile-menu">
          <Link to="/courses" style={{ ...navStyle("/courses"), display: "block", padding: "12px 16px" }}>Courses</Link>
          {user && (
            <>
              <Link to="/my-courses" style={{ ...navStyle("/my-courses"), display: "block", padding: "12px 16px" }}>My Courses</Link>
              <Link to="/dashboard" style={{ ...navStyle("/dashboard"), display: "block", padding: "12px 16px" }}>Dashboard</Link>
              <Link to="/payment-history" style={{ ...navStyle("/payment-history"), display: "block", padding: "12px 16px" }}>Payments</Link>
            </>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 8, paddingTop: 12 }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontWeight: 800, fontSize: "0.75rem" }}>{initial}</div>
                  )}
                  <span style={{ fontWeight: 700, color: "#e2f5f5", fontSize: "0.9rem" }}>{user.username}</span>
                </div>
                <button onClick={logout} style={{ padding: "6px 16px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>Log out</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <Link to="/login" style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", color: "#9bbeca", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" }}>Log in</Link>
                <Link to="/register" style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem" }}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
        @keyframes tp-fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .tp-nav-desktop { display: none !important; }
          .tp-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .tp-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;