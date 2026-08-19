import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Pill, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle,
  Key,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  UserCheck,
  Info
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, staffList = [], customers = [] }) {
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [userType, setUserType] = useState("customer"); // "customer" | "staff"
  
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

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your email/username and password.");
      return;
    }

    const inputTerm = loginEmail.trim().toLowerCase();

    if (userType === "staff") {
      // Find staff in database matching email or username
      const foundStaff = staffList.find(s => 
        (s.email && s.email.toLowerCase() === inputTerm) || 
        (s.username && s.username.toLowerCase() === inputTerm)
      );

      // Known passwords mapping for pre-configured staff
      const validPasswords = {
        "owner@pharmart.lk": "admin123",
        "admin_chathurangika": "admin123",
        "mendis@pharmart.lk": "pharm123",
        "pharmacist_mendis": "pharm123",
        "pathiraja@pharmart.lk": "cashier123",
        "cashier_pathiraja": "cashier123",
        "madushanka@pharmart.lk": "pharm123",
        "heshan@pharmart.lk": "cashier123"
      };

      const expectedPassword = foundStaff ? (validPasswords[foundStaff.email] || validPasswords[foundStaff.username] || "staff123") : "admin123";

      if (foundStaff && loginPassword === expectedPassword) {
        const userData = {
          id: foundStaff.id,
          name: foundStaff.name,
          username: foundStaff.username,
          email: foundStaff.email,
          userType: "staff",
          role: foundStaff.role, // "Owner/Admin" | "Pharmacist" | "Cashier"
          permissions: foundStaff.permissions || []
        };
        onLoginSuccess(userData);
      } else if (inputTerm === "owner@pharmart.lk" || inputTerm === "admin" || inputTerm === "admin@pharmart.lk") {
        // Fallback for Admin
        if (loginPassword === "admin123" || loginPassword === "admin") {
          onLoginSuccess({
            id: "STF-001",
            name: "Ms. Chathurangika Kahandawaarachchi",
            username: "admin_chathurangika",
            email: "owner@pharmart.lk",
            userType: "staff",
            role: "Owner/Admin"
          });
        } else {
          setLoginError("Invalid password for Admin account. Try 'admin123'.");
        }
      } else {
        setLoginError("Invalid staff credentials or role not assigned by Admin. Access Denied.");
      }

    } else {
      // Customer authentication
      const foundCust = customers.find(c => c.email && c.email.toLowerCase() === inputTerm);

      const customerUser = {
        id: foundCust ? foundCust.id : "CUST-301",
        name: foundCust ? foundCust.name : (loginEmail.split('@')[0] || "Registered Customer"),
        email: loginEmail,
        userType: "customer",
        role: "Customer"
      };

      onLoginSuccess(customerUser);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regNic || !regEmail || !regPassword) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const newCustomer = {
      id: `CUST-${Math.floor(300 + Math.random() * 700)}`,
      name: regName,
      nic: regNic,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      allergies: regAllergies,
      userType: "customer",
      role: "Customer"
    };

    alert(`Account created successfully! Welcome to PHARMART Pharmacy, ${regName}.`);
    onLoginSuccess(newCustomer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col my-8">
        
        {/* Top Header Banner */}
        <div className="bg-[#00A86B] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
              <Pill className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-heading">PHARMART Portal</h2>
              <p className="text-xs text-emerald-100 font-medium">Secure Role-Based Authentication</p>
            </div>
          </div>

          {/* Mode Tabs (Login vs Register) */}
          <div className="flex bg-white/15 p-1 rounded-xl mt-4 border border-white/20 text-xs font-bold">
            <button
              onClick={() => { setAuthMode("login"); setLoginError(""); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMode === "login" ? "bg-white text-emerald-900 shadow-xs font-bold" : "text-emerald-100 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setAuthMode("register"); setLoginError(""); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMode === "register" ? "bg-white text-emerald-900 shadow-xs font-bold" : "text-emerald-100 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Customer Account</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* User Type Switcher (Customer vs Pharmacy Staff) */}
          {authMode === "login" && (
            <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setUserType("customer"); setLoginError(""); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  userType === "customer" ? "bg-[#00A86B] text-white font-bold shadow-xs" : "text-slate-600"
                }`}
              >
                Customer Portal
              </button>
              <button
                type="button"
                onClick={() => { setUserType("staff"); setLoginError(""); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  userType === "staff" ? "bg-[#00A86B] text-white font-bold shadow-xs" : "text-slate-600"
                }`}
              >
                Pharmacy Staff Login
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {userType === "customer" ? "Customer Email or Phone" : "Staff Email or Username"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text"
                    required
                    placeholder={userType === "customer" ? "sunil.s@gmail.com" : "owner@pharmart.lk"}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00A86B] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00A86B] outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00A86B] hover:bg-[#00925d] text-white font-bold rounded-xl shadow-md shadow-[#00A86B]/20 text-xs transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Authenticate Account</span>
              </button>

              {/* Staff Credentials Reference Guide */}
              {userType === "staff" && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
                  <div className="font-bold text-slate-800 flex items-center text-xs">
                    <Info className="w-3.5 h-3.5 text-[#00A86B] mr-1.5" />
                    Authorized Staff Credentials Reference:
                  </div>
                  <div className="space-y-1 text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span>👑 Owner/Admin: <strong className="text-slate-900">owner@pharmart.lk</strong></span>
                      <span className="text-slate-500">Pass: admin123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🩺 Pharmacist: <strong className="text-slate-900">mendis@pharmart.lk</strong></span>
                      <span className="text-slate-500">Pass: pharm123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>💳 Cashier: <strong className="text-slate-900">pathiraja@pharmart.lk</strong></span>
                      <span className="text-slate-500">Pass: cashier123</span>
                    </div>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* REGISTER FORM FOR CUSTOMERS */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. K. A. Sunil Shantha"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">National ID (NIC) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="781290348V"
                    value={regNic}
                    onChange={(e) => setRegNic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input 
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input 
                  type="email"
                  required
                  placeholder="sunil.s@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Address</label>
                <input 
                  type="text"
                  placeholder="12/A, High Level Road, Nugegoda"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Drug Allergies</label>
                <input 
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs (or None)"
                  value={regAllergies}
                  onChange={(e) => setRegAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-rose-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00A86B] hover:bg-[#00925d] text-white font-bold rounded-xl shadow-md text-xs transition-all"
              >
                Register Customer Account
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
