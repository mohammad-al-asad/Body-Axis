import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Camera,
  CheckCircle2,
  LogOut,
  Save,
  Shield,
  User,
} from "lucide-react";
import {
  adminApi,
  clearAdminSession,
  getStoredAdmin,
} from "../../services/adminApi";

const DEFAULT_PROFILE = {
  id: "",
  name: "",
  email: "",
  avatar_url: null,
  notification_settings: {
    user_alerts: true,
    subscription_alerts: true,
  },
  two_factor_authentication: false,
  last_login_at: null,
};

const getStoredProfile = () => {
  const stored = getStoredAdmin();
  return stored ? { ...DEFAULT_PROFILE, ...stored } : DEFAULT_PROFILE;
};

const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`flex h-5 w-10 items-center rounded-full p-1 transition-colors ${
      checked ? "bg-[#0F766E]" : "bg-[#1E293B]"
    }`}
  >
    <span
      className={`h-3.5 w-3.5 rounded-full shadow-sm transition-transform duration-300 ${
        checked
          ? "translate-x-[18px] bg-[#2DD4BF]"
          : "translate-x-0 bg-[#94A3B8]"
      }`}
    />
  </button>
);

const LoadingSpinner = ({ className = "" }) => (
  <span
    className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#2DD4BF] ${className}`}
  />
);

const Settings = () => {
  const navigate = useNavigate();
  const initialProfile = useMemo(getStoredProfile, []);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [profileImage, setProfileImage] = useState(initialProfile.avatar_url);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [userAlerts, setUserAlerts] = useState(
    initialProfile.notification_settings.user_alerts,
  );
  const [subAlerts, setSubAlerts] = useState(
    initialProfile.notification_settings.subscription_alerts,
  );
  const [twoFactor, setTwoFactor] = useState(
    initialProfile.two_factor_authentication,
  );
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorAction, setTwoFactorAction] = useState(null);
  const [twoFactorChallengeId, setTwoFactorChallengeId] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim();
  const hasProfileChanges =
    normalizedName !== savedProfile.name ||
    normalizedEmail !== savedProfile.email ||
    Boolean(profileImageFile) ||
    userAlerts !== savedProfile.notification_settings.user_alerts ||
    subAlerts !== savedProfile.notification_settings.subscription_alerts;
  const canUpdate =
    hasProfileChanges &&
    !saving &&
    normalizedName.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const admin = await adminApi.getProfile();
        localStorage.setItem("admin", JSON.stringify(admin));
        setSavedProfile(admin);
        setFullName(admin.name);
        setEmail(admin.email);
        setProfileImage(admin.avatar_url);
        setProfileImageFile(null);
        setUserAlerts(admin.notification_settings.user_alerts);
        setSubAlerts(admin.notification_settings.subscription_alerts);
        setTwoFactor(admin.two_factor_authentication);
      } catch (requestError) {
        setError(requestError.message);
        if (requestError.message.includes("401")) {
          clearAdminSession();
          navigate("/sign-in", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleImageUpload = (event) => {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(selectedImage.type)) {
      setError("Profile image must be a PNG, JPG, or WEBP file.");
      event.target.value = "";
      return;
    }
    setError("");
    setProfileImageFile(selectedImage);
    setProfileImage(URL.createObjectURL(selectedImage));
  };

  const persistAdminProfile = (updatedAdmin) => {
    localStorage.setItem("admin", JSON.stringify(updatedAdmin));
    setSavedProfile(updatedAdmin);
    setFullName(updatedAdmin.name);
    setEmail(updatedAdmin.email);
    setProfileImage(updatedAdmin.avatar_url);
    setProfileImageFile(null);
    setUserAlerts(updatedAdmin.notification_settings.user_alerts);
    setSubAlerts(updatedAdmin.notification_settings.subscription_alerts);
    setTwoFactor(updatedAdmin.two_factor_authentication);
    window.dispatchEvent(
      new CustomEvent("admin-profile-updated", { detail: updatedAdmin }),
    );
  };

  const handleUpdate = async () => {
    if (!canUpdate) return;
    setSaving(true);
    setError("");
    try {
      const settingsChanged =
        normalizedName !== savedProfile.name ||
        normalizedEmail !== savedProfile.email ||
        userAlerts !== savedProfile.notification_settings.user_alerts ||
        subAlerts !== savedProfile.notification_settings.subscription_alerts;

      let updatedAdmin = savedProfile;
      if (settingsChanged) {
        updatedAdmin = await adminApi.updateProfile({
          name: normalizedName,
          email: normalizedEmail,
          notification_settings: {
            user_alerts: userAlerts,
            subscription_alerts: subAlerts,
          },
          two_factor_authentication: savedProfile.two_factor_authentication,
        });
      }
      if (profileImageFile) {
        updatedAdmin = await adminApi.updateAvatar(profileImageFile);
      }
      persistAdminProfile(updatedAdmin);
      setSavedMessage("Account profile updated.");
      window.setTimeout(() => setSavedMessage(""), 2500);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (loading || twoFactorBusy) return;

    const action = twoFactor ? "disable" : "enable";
    setTwoFactorBusy(true);
    setError("");
    setTwoFactorMessage("");
    setTwoFactorError("");
    setTwoFactorCode("");

    try {
      const challenge =
        action === "enable"
          ? await adminApi.requestEnable2fa()
          : await adminApi.requestDisable2fa();
      setTwoFactorAction(action);
      setTwoFactorChallengeId(challenge.challenge_id);
      setTwoFactorMessage(challenge.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const closeTwoFactorModal = () => {
    setTwoFactorAction(null);
    setTwoFactorChallengeId("");
    setTwoFactorCode("");
    setTwoFactorMessage("");
    setTwoFactorError("");
  };

  const handleVerifyTwoFactor = async (event) => {
    event.preventDefault();
    if (!twoFactorAction || !twoFactorChallengeId) {
      setError("Verification session expired. Please request a new code.");
      closeTwoFactorModal();
      return;
    }

    setTwoFactorBusy(true);
    setTwoFactorError("");
    try {
      const payload = {
        challenge_id: twoFactorChallengeId,
        otp_code: twoFactorCode.trim(),
      };
      const updatedAdmin =
        twoFactorAction === "enable"
          ? await adminApi.verifyEnable2fa(payload)
          : await adminApi.verifyDisable2fa(payload);
      persistAdminProfile(updatedAdmin);
      setSavedMessage(
        twoFactorAction === "enable"
          ? "Two-factor authentication enabled."
          : "Two-factor authentication disabled.",
      );
      window.setTimeout(() => setSavedMessage(""), 2500);
      closeTwoFactorModal();
    } catch (requestError) {
      setTwoFactorError(requestError.message);
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleSignOut = () => {
    clearAdminSession();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 font-sans text-white">
      <div className="mx-auto max-w-[1200px] animate-in fade-in duration-500">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
            {savedMessage && (
              <p className="mt-1 text-[12px] font-medium text-[#2DD4BF]">
                {savedMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!canUpdate}
            onClick={handleUpdate}
            className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#1E293B] disabled:text-[#64748B]"
          >
            <Save size={17} />
            {saving ? "Updating…" : "Update"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E293B] text-[#94A3B8]">
              <User size={20} />
            </div>
            <h2 className="text-xl font-medium text-white">Account Profile</h2>
          </div>

          <div className="flex flex-col gap-10 md:flex-row">
            <div className="shrink-0">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-[#1E293B] bg-[#0A0D14]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#334155]" />
                )}
                <button
                  type="button"
                  aria-label="Choose profile image"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#131B2F] bg-[#2DD4BF] text-[#042F2E] shadow-lg transition-transform hover:scale-105"
                >
                  <Camera size={16} strokeWidth={2.5} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <p className="mt-4 max-w-32 text-center text-[10px] leading-4 text-[#64748B]">
                PNG, JPG or WEBP
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-[13px] font-medium text-[#94A3B8]">
                  Full Name
                </span>
                <input
                  type="text"
                  value={fullName}
                  disabled={loading}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-[#38BDF8]"
                />
              </label>
              <label>
                <span className="mb-2 block text-[13px] font-medium text-[#94A3B8]">
                  Email Address
                </span>
                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-[#38BDF8]"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E]/20 text-[#2DD4BF]">
                <Bell size={20} />
              </div>
              <h2 className="text-xl font-medium text-white">Notifications</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="mb-1 text-[15px] font-medium text-white">
                    User Alerts
                  </p>
                  <p className="text-[12px] text-[#64748B]">
                    Alerts for new users and important user activity
                  </p>
                </div>
                <ToggleSwitch
                  label="User alerts"
                  checked={userAlerts}
                  onChange={() => !loading && setUserAlerts((current) => !current)}
                />
              </div>
              <div className="h-px w-full bg-[#1E293B]" />
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="mb-1 text-[15px] font-medium text-white">
                    Subscription Alerts
                  </p>
                  <p className="text-[12px] text-[#64748B]">
                    Alerts for plan renewals and changes
                  </p>
                </div>
                <ToggleSwitch
                  label="Subscription alerts"
                  checked={subAlerts}
                  onChange={() => !loading && setSubAlerts((current) => !current)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9F1239]/20 text-[#FB7185]">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-medium text-white">Security</h2>
            </div>

            <div className="mb-8 flex items-center justify-between rounded-xl border border-[#0F766E]/50 bg-[#042F2E]/30 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#2DD4BF]" />
                <p className="text-[14px] font-medium text-white">
                  Two-Factor Authentication
                </p>
              </div>
              {twoFactorBusy && !twoFactorAction ? (
                <div className="flex h-5 w-10 items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ToggleSwitch
                  label="Two-factor authentication"
                  checked={twoFactor}
                  onChange={handleTwoFactorToggle}
                />
              )}
            </div>

            <div>
              <h3 className="mb-4 text-[13px] font-medium text-white">
                Recent Login Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-4">
                  <p className="text-[12px] text-[#94A3B8]">Current admin session</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {savedProfile.last_login_at
                      ? new Date(savedProfile.last_login_at).toLocaleString()
                      : "No recorded login"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-[#1E293B] pt-6">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border border-[#EF4444]/50 bg-[#EF4444]/10 px-6 py-3 text-[13px] font-bold text-[#F87171] transition-colors hover:bg-[#EF4444] hover:text-white"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </div>

      {twoFactorAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[440px] rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 shadow-2xl">
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                Email Verification
              </p>
              <h2 className="text-xl font-bold text-white">
                {twoFactorAction === "enable"
                  ? "Enable Two-Factor Authentication"
                  : "Disable Two-Factor Authentication"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                {twoFactorMessage ||
                  `Enter the verification code sent to ${savedProfile.email}.`}
              </p>
            </div>

            <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
              {twoFactorError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {twoFactorError}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Verification Code
                </span>
                <input
                  value={twoFactorCode}
                  onChange={(event) => {
                    setTwoFactorCode(event.target.value.replace(/\D/g, ""));
                    setTwoFactorError("");
                  }}
                  inputMode="numeric"
                  minLength="4"
                  maxLength="8"
                  autoComplete="one-time-code"
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-white outline-none focus:border-[#38BDF8]"
                  placeholder="1234"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTwoFactorModal}
                  disabled={twoFactorBusy}
                  className="rounded-xl border border-[#334155] px-5 py-2.5 text-sm font-bold text-[#94A3B8] hover:bg-[#0A0D14] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFactorBusy || twoFactorCode.trim().length < 4}
                  className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {twoFactorBusy ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
