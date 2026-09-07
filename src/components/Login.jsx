import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { clearFeed } from "../utils/feedSlice";
import { removeConnections } from "../utils/connectionSlice";
import { clearRequests } from "../utils/requestSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  LuCodeXml, 
  LuMail, 
  LuLock, 
  LuUser, 
  LuEye, 
  LuEyeOff, 
  LuArrowRight, 
  LuSparkles,
  LuCheck,
  LuShieldCheck,
  LuCircleAlert
} from "react-icons/lu";

// Password strength evaluator based on OWASP & NIST standard
const evaluatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "", textColor: "", checks: [], isStrong: false };

  const checks = [
    { label: "At least 8 characters", met: pwd.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(pwd) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(pwd) },
    { label: "One number (0-9)", met: /[0-9]/.test(pwd) },
    { label: "One special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const metCount = checks.filter((c) => c.met).length;

  let label = "Weak";
  let color = "bg-rose-500";
  let textColor = "text-rose-400";

  if (metCount === 5) {
    label = "Very Strong";
    color = "bg-emerald-400";
    textColor = "text-emerald-400";
  } else if (metCount === 4) {
    label = "Strong";
    color = "bg-teal-400";
    textColor = "text-teal-400";
  } else if (metCount === 3) {
    label = "Fair";
    color = "bg-amber-400";
    textColor = "text-amber-400";
  } else if (metCount >= 1) {
    label = "Weak";
    color = "bg-rose-500";
    textColor = "text-rose-400";
  }

  return {
    score: metCount,
    label,
    color,
    textColor,
    checks,
    isStrong: metCount === 5,
  };
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSignUpUrl = location.pathname === "/signup";
  const [isLoginForm, setIsLoginForm] = useState(!isSignUpUrl);

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state whenever URL changes between /login and /signup
  useEffect(() => {
    setIsLoginForm(location.pathname !== "/signup");
    setError("");
  }, [location.pathname]);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { emailId, password });
      dispatch(clearFeed());
      dispatch(removeConnections());
      dispatch(clearRequests());
      dispatch(addUser(res.data));
      toast.success(`Welcome back, ${res?.data?.firstName || "developer"}!`);
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || (typeof err?.response?.data === "string" ? err.response.data : "Invalid credentials. Please try again.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setError("");

    // Strict client-side password strength gate
    if (!passwordStrength.isStrong) {
      const msg = "Please ensure your password satisfies all 5 security requirements.";
      setError(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/signup", {
        firstName,
        lastName,
        emailId,
        password,
      });
      dispatch(clearFeed());
      dispatch(removeConnections());
      dispatch(clearRequests());
      dispatch(addUser(res.data.data));
      toast.success("Account created successfully! Welcome to DevDate.");
      navigate("/profile");
    } catch (err) {
      const msg = err?.response?.data?.message || (typeof err?.response?.data === "string" ? err.response.data : "Failed to create account.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-6rem)] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Glow backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

        {/* Card */}
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-2xl text-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
              <LuCodeXml className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isLoginForm ? "Welcome Back" : "Join the Dev Community"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              {isLoginForm
                ? "Connect with passionate developers worldwide."
                : "Build your dev profile and discover matching collaborators."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLoginForm ? handleLogin : handleSignUp} className="space-y-4">
            {!isLoginForm && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <LuUser className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="First Name"
                    maxLength={25}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value.slice(0, 25))}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <LuUser className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    maxLength={25}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.slice(0, 25))}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <LuMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="developer@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <LuLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time Password Strength Meter & Checklist (Only during Sign Up) */}
            {!isLoginForm && password.length > 0 && (
              <div className="space-y-3 pt-1">
                {/* Segmented Strength Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <LuShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Security Strength</span>
                    </span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const active = passwordStrength.score >= (level === 4 ? 5 : level + 1);
                      return (
                        <div
                          key={level}
                          className={`rounded-full transition-all duration-300 ${
                            active ? passwordStrength.color : "bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Requirements Checklist */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {passwordStrength.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs transition-colors duration-200"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                            check.met
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-slate-800/60 text-slate-500 border border-slate-700/50"
                          }`}
                        >
                          {check.met ? (
                            <LuCheck className="w-2.5 h-2.5 stroke-[3]" />
                          ) : (
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                          )}
                        </div>
                        <span
                          className={
                            check.met ? "text-slate-200 font-medium" : "text-slate-400"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed flex items-start gap-2">
                <LuCircleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : isLoginForm ? "Sign In" : "Create Account"}</span>
              <LuArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="text-center mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              {isLoginForm ? "New to DevDate?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  navigate(isLoginForm ? "/signup" : "/login");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-4 ml-1"
              >
                {isLoginForm ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
