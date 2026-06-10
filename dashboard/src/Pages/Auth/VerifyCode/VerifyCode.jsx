import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import loginLogo from "../../../assets/image/login-logo.png";
import mainBg from "../../../assets/image/main-bg.png";

const VerifyCode = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/new-password");
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${mainBg})` }}
    >
      
      {/* Subtle overlay to ensure good contrast */}
      <div className="absolute inset-0 bg-[#030712]/30 pointer-events-none" />

      {/* Main Container Container */}
      <div className="w-full max-w-[850px] h-[550px] bg-[#0A0D14]/90 backdrop-blur-xl rounded-[24px] border border-[#1E293B]/50 shadow-[0_0_60px_rgba(30,58,138,0.15)] relative z-10 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column - Logo Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)]" />
          <img 
            src={loginLogo} 
            alt="Body Axis" 
            className="w-48 object-contain filter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10 hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Column - Form Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
          
          {/* Inner Form Card */}
          <div className="w-full max-w-[320px] bg-[#131B2F]/60 backdrop-blur-md rounded-2xl p-8 border border-[#1E293B] shadow-[0_0_30px_rgba(37,99,235,0.08)] relative">
            
            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-white font-bold text-[18px] mb-2 tracking-wide">Verify Your Code</h2>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed px-2">
                We sent a 5-digit code to your email. Enter it below to continue.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              
              {/* OTP Inputs */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={code[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-lg font-bold text-center text-white bg-[#1E293B]/50 border border-[#334155]/50 focus:border-[#38BDF8]/50 focus:bg-[#1E293B] rounded-lg outline-none transition-all"
                    maxLength={1}
                    inputMode="numeric"
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={loading || code.some(c => !c)}
                  className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-lg py-3 font-bold text-[13px] tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-[11px] font-bold text-[#94A3B8]">
                    Didn't receive the email?{" "}
                    <button type="button" className="text-[#06B6D4] hover:text-white transition-colors">Resend Code</button>
                  </p>
                </div>
              </div>
              
            </form>

            <div className="mt-6 text-center">
              <Link to="/sign-in" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#06B6D4] hover:text-white transition-colors tracking-wide">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
