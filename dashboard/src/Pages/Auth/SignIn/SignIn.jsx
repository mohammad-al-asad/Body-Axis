import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginLogo from "../../../assets/image/login-logo.png";
import mainBg from "../../../assets/image/main-bg.png";
import { adminApi, storeAdminSession } from "../../../services/adminApi";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.login(email.trim(), password);
      storeAdminSession(response);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat p-6 font-sans"
      style={{ backgroundImage: `url(${mainBg})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#030712]/30" />
      <div className="relative z-10 flex h-[550px] w-full max-w-[850px] flex-col overflow-hidden rounded-[24px] border border-[#1E293B]/50 bg-[#0A0D14]/90 shadow-[0_0_60px_rgba(30,58,138,0.15)] backdrop-blur-xl md:flex-row">
        <div className="relative flex w-full items-center justify-center p-8 md:w-1/2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)]" />
          <img
            src={loginLogo}
            alt="Body Axis"
            className="z-10 w-48 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="flex w-full items-center justify-center p-8 md:w-1/2 md:p-12">
          <div className="relative w-full max-w-[320px] rounded-2xl border border-[#1E293B] bg-[#131B2F]/60 p-8 shadow-[0_0_30px_rgba(37,99,235,0.08)] backdrop-blur-md">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-[18px] font-bold tracking-wide text-white">
                Secure Authentication
              </h2>
              <p className="px-2 text-[11px] leading-relaxed text-[#94A3B8]">
                Enter your administrative credentials to access the control center.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-5">
              <label className="block space-y-1.5">
                <span className="block pl-1 text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Admin Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@bodyaxis.com"
                  className="w-full rounded-lg border border-[#334155]/50 bg-[#1E293B]/50 px-4 py-3 text-[13px] font-medium text-white outline-none transition-all placeholder:text-[#64748B] focus:border-[#38BDF8]/50 focus:bg-[#1E293B]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block pl-1 text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength="8"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#334155]/50 bg-[#1E293B]/50 px-4 py-3 text-[13px] font-bold tracking-widest text-white outline-none transition-all placeholder:text-[#64748B] focus:border-[#38BDF8]/50 focus:bg-[#1E293B]"
                />
              </label>

              <div className="flex justify-end pt-1">
                <Link
                  to="/forgate-password"
                  className="text-[10px] font-bold tracking-wide text-[#06B6D4] transition-colors hover:text-white"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#2563EB] py-3 text-[13px] font-bold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#3B82F6] disabled:opacity-70"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
