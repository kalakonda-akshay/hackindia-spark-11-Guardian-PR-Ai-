import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { ShieldCheck, Eye, EyeOff, Loader2, Lock, Mail, User, AlertCircle, ArrowRight, Github } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        {/* Left panel - branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-inner">
            <div className="auth-logo">
              <ShieldCheck className="auth-logo-icon" />
            </div>
            <h1 className="auth-brand-title">Mutagent</h1>
            <p className="auth-brand-subtitle">AI-Powered PR Security Review</p>

            <div className="auth-features">
              {[
                { icon: "🛡️", title: "Zero-Trust Security", desc: "Every PR analyzed by 7 specialized AI agents" },
                { icon: "⚡", title: "Real-time Analysis", desc: "Results in seconds, not hours" },
                { icon: "🤖", title: "Autonomous Agents", desc: "Triage, Security, Dependency, Reporter & more" },
                { icon: "📊", title: "Executive Reports", desc: "PDF reports with risk scores & fix guidance" },
              ].map((f) => (
                <div className="auth-feature-item" key={f.title}>
                  <span className="auth-feature-icon">{f.icon}</span>
                  <div>
                    <p className="auth-feature-title">{f.title}</p>
                    <p className="auth-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-brand-badge">
              <span className="auth-badge-dot" />
              HackIndia Spark 11 — Live Demo
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
                onClick={() => { setMode("register"); setError(""); }}
                type="button"
              >
                Create Account
              </button>
            </div>

            <div className="auth-form-header">
              <h2 className="auth-form-title">
                {mode === "login" ? "Welcome back" : "Get started free"}
              </h2>
              <p className="auth-form-subtitle">
                {mode === "login"
                  ? "Sign in to your Mutagent workspace"
                  : "Create your account in seconds"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {mode === "register" && (
                <div className="auth-field">
                  <label htmlFor="auth-name" className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Akshay Kalakonda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email" className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password" className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input auth-input-password"
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
                id="auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="auth-divider"><span>or continue with</span></div>

              <button
                type="button"
                className="auth-github-btn"
                onClick={() => setError("GitHub OAuth requires a deployed backend. Use email/password for the demo.")}
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>

              <p className="auth-switch">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
