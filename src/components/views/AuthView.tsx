import React, { useState, useRef } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Button, AlertBanner, Modal } from '../common/UIComponents';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login } = useStockWise();

  // Pre-filled administrator credentials for college demonstration (hidden from UI text)
  const [email, setEmail] = useState('Admin@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Smooth transition into dashboard
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your administrator login.');
      }
    }, 200);
  };

  const handleGoogleLogin = () => {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 4500);
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotModalOpen(false);
    }, 2000);
  };

  const focusLoginForm = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#101B30] flex items-center justify-center p-3 sm:p-5 lg:p-6 font-sans selection:bg-[#2864E8] selection:text-white">
      {/* Centered White Rounded SaaS Container with Proportional Dimensions */}
      <div className="w-full max-w-[1080px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-2.5 sm:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 border border-slate-800/30">
        
        {/* ============================================================== */}
        {/* LEFT PANEL (~58% width): Blue Liquid-Style Gradient Design     */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 relative rounded-xl sm:rounded-2xl overflow-hidden p-5 sm:p-8 flex flex-col justify-between min-h-[460px] lg:min-h-[580px] bg-gradient-to-br from-[#07245B] via-[#0C4A9E] via-[#026EE6] to-[#00BAEC] text-white">
          
          {/* Subtle Organic Liquid Gradient Blur Effects */}
          <div className="absolute -top-20 -left-16 w-80 h-80 rounded-full bg-cyan-300/35 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-16 w-72 h-72 rounded-full bg-sky-400/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/4 w-80 h-80 rounded-full bg-indigo-700/40 blur-3xl pointer-events-none" />
          
          {/* Organic Fluid Wave Overlay (CSS SVG) */}
          <svg
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-overlay"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,250 C180,320 280,160 480,260 C680,360 720,180 800,220 L800,800 L0,800 Z"
              fill="rgba(255,255,255,0.4)"
            />
            <path
              d="M0,450 C220,380 340,520 540,430 C700,350 750,460 800,420 L800,800 L0,800 Z"
              fill="rgba(0,186,236,0.3)"
            />
          </svg>

          {/* Top-Left Branding with Vyapar Sathi Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/20">
              <img
                src="/logo.jpg"
                alt="Vyapar Sathi Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-white font-bold text-base sm:text-lg tracking-tight leading-none block">
                VyaparMitra
              </span>
              <span className="text-blue-100/80 text-[10px] font-medium tracking-wide mt-0.5 block">
                Distribution Intelligence
              </span>
            </div>
          </div>

          {/* Main Headline & Supporting Subtext in Lower-Middle Area */}
          <div className="relative z-10 my-auto py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-white tracking-tight leading-tight">
              Start Your Journey
            </h1>
            <p className="text-blue-50/90 text-xs sm:text-sm mt-1.5 max-w-md font-normal leading-relaxed">
              Follow these simple steps to access your account.
            </p>
          </div>

          {/* Two-Step Visual Cards (Horizontally Arranged) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            
            {/* Step 1: Access Your Account */}
            <div className="bg-white/20 backdrop-blur-md border border-white/35 rounded-xl p-3 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5.5 h-5.5 rounded-full bg-white text-[#2864E8] font-extrabold text-[11px] flex items-center justify-center shadow-xs shrink-0">
                  1
                </span>
                <h3 className="font-bold text-xs sm:text-[13px] tracking-tight text-white">
                  Access Your Account
                </h3>
              </div>
              <p className="text-[11px] text-blue-50/90 leading-snug pl-7.5">
                Sign in with your administrator credentials.
              </p>
            </div>

            {/* Step 2: Manage Your Business */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white/95 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5.5 h-5.5 rounded-full bg-white/30 text-white font-extrabold text-[11px] flex items-center justify-center border border-white/40 shrink-0">
                  2
                </span>
                <h3 className="font-bold text-xs sm:text-[13px] tracking-tight text-white">
                  Manage Your Business
                </h3>
              </div>
              <p className="text-[11px] text-blue-100/80 leading-snug pl-7.5">
                View stock, track products, and manage deliveries.
              </p>
            </div>

          </div>

        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL (~42% width): Clean White Login Form               */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 p-5 sm:p-7 lg:p-8 flex flex-col justify-between bg-white rounded-xl sm:rounded-2xl">
          
          <div>
            {/* Panel Heading */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#172B45] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-[#627A96] mt-0.5">
                Sign in to your VyaparMitra account.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-3.5">
                <AlertBanner variant="critical" message={errorMsg} />
              </div>
            )}

            {/* Google Notice Banner */}
            {googleNotice && (
              <div className="mb-3.5">
                <AlertBanner
                  variant="warning"
                  message="Google authentication is not configured for this enterprise administrator deployment. Please sign in using your administrator credentials."
                />
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Field 1: Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#172B45] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Admin@gmail.com"
                    className="w-full h-9 pl-8.5 pr-3 bg-[#F0F7FF]/70 border border-[#D5E5F7] rounded-lg text-xs text-[#172B45] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2864E8]/20 focus:border-[#2864E8] transition-all font-medium"
                  />
                  <Mail className="w-3.5 h-3.5 text-[#627A96] absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#172B45]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-[#2864E8] hover:text-[#1D4ED8] font-medium hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full h-9 pl-8.5 pr-9 bg-[#F0F7FF]/70 border border-[#D5E5F7] rounded-lg text-xs text-[#172B45] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2864E8]/20 focus:border-[#2864E8] transition-all font-medium"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#627A96] absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#627A96] hover:text-[#172B45] focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Prominent Blue Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 mt-1 bg-[#2864E8] hover:bg-[#1D4ED8] active:bg-[#1542A8] disabled:opacity-70 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Divider: "OR" */}
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-[#D5E5F7]" />
                <span className="flex-shrink mx-2.5 text-[#627A96] text-[10px] font-semibold tracking-wider uppercase">
                  OR
                </span>
                <div className="flex-grow border-t border-[#D5E5F7]" />
              </div>

              {/* Secondary Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-9 bg-white border border-[#D5E5F7] hover:bg-[#EAF4FF] text-[#172B45] font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                title="Google authentication option"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

            </form>
          </div>

          {/* Small Footer Text Below Form */}
          <div className="pt-4 mt-3 border-t border-[#D5E5F7]/60 text-center">
            <p className="text-[11px] text-[#627A96]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={focusLoginForm}
                className="text-[#2864E8] hover:text-[#1D4ED8] font-semibold hover:underline cursor-pointer"
              >
                Login here.
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* Admin Password Recovery Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Admin Password Recovery"
        subtitle="Password recovery for authorized administrators"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendReset}>
              Send Recovery Link
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendReset} className="space-y-3">
          {forgotSuccess && (
            <AlertBanner variant="healthy" message="Admin recovery instructions sent to registered administrator address." />
          )}
          <div>
            <label className="block text-xs font-semibold text-[#172B45] mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Admin@gmail.com"
              className="w-full h-8.5 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs text-[#172B45] focus:outline-none focus:border-[#2864E8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
