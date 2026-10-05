import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, AlertCircle, UserPlus, LogIn, Pill, RefreshCw } from 'lucide-react';
import { login, registerCustomer, googleLogin } from '../services/supabaseService';
import PhoneHint from './PhoneHint';
import { phoneError } from '../lib/phone';

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "458326249784-qekor0do0peojbsrpc2rh47m4h5366fi.apps.googleusercontent.com";

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess
}) {
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regNic, setRegNic] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regAllergies, setRegAllergies] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [isBusy, setIsBusy] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  // The Google callback is registered once, so it reads the latest handler through a ref.
  const successRef = useRef(onLoginSuccess);
  useEffect(() => {
    successRef.current = onLoginSuccess;
  });

  // Google sign-in: the credential is verified by the database with Google before
  // any account is opened. Nothing about the Google account is trusted in the browser.
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return undefined;

    const handleGoogleCredential = async (response) => {
      if (!response?.credential) return;
      setGoogleSigningIn(true);
      setLoginError("");
      const { data, error } = await googleLogin(response.credential);
      setGoogleSigningIn(false);
      if (error) {
        setLoginError(error.message);
        return;
      }
      successRef.current(data);
    };

    const renderGoogleWidget = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false
        });
        const btnContainer = document.getElementById("googleOfficialGsiButton");
        if (btnContainer) {
          btnContainer.innerHTML = "";
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill"
          });
        }
      } catch (err) {
        console.warn("Google sign-in unavailable:", err);
      }
    };

    renderGoogleWidget();
    const timer = setTimeout(renderGoogleWidget, 500);
    return () => clearTimeout(timer);
  }, [isOpen, authMode]);

  if (!isOpen) return null;

  const switchMode = (mode) => {
    setAuthMode(mode);
    setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    setLoginError("");
    setIsBusy(true);
    const { data, error } = await login(loginEmail.trim(), loginPassword);
    setIsBusy(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    setLoginPassword("");
    onLoginSuccess(data);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    setLoginError("");
    if (!regName.trim() || !regNic.trim() || !regEmail.trim() || !regPassword) {
      setLoginError("Please fill in all required fields.");
      return;
    }
    if (regPassword.length < 8) {
      setLoginError("Passwords must be at least 8 characters.");
      return;
    }
    if (phoneError(regPhone)) {
      setLoginError(phoneError(regPhone));
      return;
    }
    setIsBusy(true);
    const { data, error } = await registerCustomer({
      name: regName,
      nic: regNic,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      allergies: regAllergies,
      password: regPassword
    });
    setIsBusy(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    setRegPassword("");
    onLoginSuccess(data);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans"
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92dvh] sm:max-h-[85dvh] shadow-2xl ring-1 ring-slate-200/70 overflow-hidden flex flex-col my-auto relative animate-rise">
        
        {/* Top Header Banner */}
        <div className="px-5 pt-6 pb-2 sm:px-7 sm:pt-7 relative shrink-0">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0B2545] hover:bg-slate-100 z-30"
            aria-label="Close"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/25 shrink-0">
              <Pill className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#0B2545]">Welcome to PHARMART</h2>
              <p className="text-sm text-slate-500">Sign in or create an account</p>
            </div>
          </div>

          {/* Mode Tabs (Login vs Register) */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-5 text-sm font-medium">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px] ${
                authMode === "login" ? "bg-white text-[#0B2545] shadow-sm" : "text-slate-500 hover:text-[#0B2545]"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px] ${
                authMode === "register" ? "bg-white text-[#0B2545] shadow-sm" : "text-slate-500 hover:text-[#0B2545]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body with Smooth Touch Scroll */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">

          <>
              {/* OFFICIAL GOOGLE GIS SDK CONTAINER & FALLBACK */}
              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center min-h-[44px]">
                  <div id="googleOfficialGsiButton" className="w-full flex justify-center"></div>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest absolute">or</span>
                </div>
              </div>

              {googleSigningIn && (
                <div role="status" className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-[#2563EB]" />
                  <span>Checking your Google account...</span>
                </div>
              )}

              {loginError && (
                <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* UNIFIED SINGLE LOGIN FORM */}
              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
                  
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="text"
                        required
                        placeholder="Enter email or username..."
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-hidden min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-hidden min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-[#2563EB]/20 text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[46px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isBusy ? "Signing in..." : "Sign In to Account"}</span>
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM (MOBILE RESPONSIVE GRID) */
                <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. K. A. Sunil Shantha"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-hidden min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NIC Number *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 199012345678"
                        value={regNic}
                        onChange={(e) => setRegNic(e.target.value)}
                        className="w-full px-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input 
                          type="tel" inputMode="tel"
                          placeholder="+94 77 123 4567"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="peer w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                        />
                        <PhoneHint value={regPhone} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="email"
                        required
                        placeholder="sunil.s@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="text"
                        placeholder="e.g. 12/A, High Level Road, Nugegoda"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Drug Allergies / Medical Notes</label>
                    <input 
                      type="text"
                      placeholder="e.g. Penicillin, Sulfa drugs (Leave blank if none)"
                      value={regAllergies}
                      onChange={(e) => setRegAllergies(e.target.value)}
                      className="w-full px-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="password"
                        required
                        placeholder="At least 8 characters"
                        minLength={8}
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 active:scale-[0.99] text-white font-semibold rounded-xl shadow-md text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[46px]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isBusy ? "Creating account..." : "Create Customer Account & Sign In"}</span>
                  </button>
                </form>
              )}
          </>

        </div>

      </div>
    </div>
  );
}
