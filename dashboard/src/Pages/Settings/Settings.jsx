import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Bell, Shield, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  // Account Profile State
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.rivera@bodyaxis.io');
  const fileInputRef = useRef(null);

  // Notifications State
  const [emailNotif, setEmailNotif] = useState(true);
  const [subAlerts, setSubAlerts] = useState(true);

  // Security State
  const [twoFactor, setTwoFactor] = useState(true);
  const [recentLogin, setRecentLogin] = useState(true);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imgUrl);
    }
  };

  // Toggle Component
  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-[#0F766E]' : 'bg-[#1E293B]'}`}
      onClick={onChange}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-4.5 bg-[#2DD4BF]' : 'translate-x-0 bg-[#94A3B8]'}`}
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-[#0A0D14] text-white font-sans">
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">

        <h1 className="text-[28px] font-bold tracking-tight mb-8">Settings</h1>

        {/* Account Profile Card */}
        <div className="bg-[#131B2F] rounded-2xl p-8 border border-[#1E293B] shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#94A3B8]">
              <User size={20} />
            </div>
            <h2 className="text-white text-xl font-medium">Account Profile</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-[#0A0D14] border border-[#1E293B] overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-[#334155]" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#2DD4BF] flex items-center justify-center text-[#042F2E] hover:scale-110 transition-transform shadow-lg border-[4px] border-[#131B2F]"
              >
                <Camera size={18} strokeWidth={2.5} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#94A3B8] text-[13px] font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-[13px] font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Notifications Card */}
          <div className="bg-[#131B2F] rounded-2xl p-8 border border-[#1E293B] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/20 flex items-center justify-center text-[#2DD4BF]">
                <Bell size={20} />
              </div>
              <h2 className="text-white text-xl font-medium">Notifications</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-[15px] font-medium mb-1">Email Notifications</p>
                  <p className="text-[#64748B] text-[12px]">Receive weekly summary reports</p>
                </div>
                <ToggleSwitch checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </div>
              <div className="h-[1px] w-full bg-[#1E293B]"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-[15px] font-medium mb-1">Subscription Alerts</p>
                  <p className="text-[#64748B] text-[12px]">Alerts for plan renewals & changes</p>
                </div>
                <ToggleSwitch checked={subAlerts} onChange={() => setSubAlerts(!subAlerts)} />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-[#131B2F] rounded-2xl p-8 border border-[#1E293B] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#9F1239]/20 flex items-center justify-center text-[#FB7185]">
                <Shield size={20} />
              </div>
              <h2 className="text-white text-xl font-medium">Security</h2>
            </div>

            <div className="bg-[#042F2E]/30 border border-[#0F766E]/50 rounded-xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#2DD4BF]" />
                <p className="text-white text-[14px] font-medium">Two-Factor Authentication</p>
              </div>
              <ToggleSwitch checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-[13px] font-medium">Recent Login Activity</h3>
                <ToggleSwitch checked={recentLogin} onChange={() => {
                  setRecentLogin(!recentLogin);
                  navigate("/sign-in");
                }} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between relative pl-4">
                  <p className="text-[#94A3B8] text-[12px]">Chrome on MacOS</p>
                  <p className="text-[#94A3B8] text-[11px]">Today, 10:45 AM</p>
                </div>
                <div className="flex items-center justify-between relative pl-4">
                  <p className="text-[#64748B] text-[12px]">iPhone 15 Pro</p>
                  <p className="text-[#64748B] text-[11px]">Yesterday, 08:22 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
