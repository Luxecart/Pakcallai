import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Radio,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User as UserType } from '../../types';

interface AuthModalProps {
  onClose: () => void;
  onOpenTelephonyGuide?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onOpenTelephonyGuide }) => {
  const {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'profile'>(
    isAuthenticated ? 'profile' : 'login'
  );

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+92 300 ');
  const [signupCity, setSignupCity] = useState('Lahore, Punjab');
  const [signupCarrier, setSignupCarrier] = useState<UserType['carrier']>('Jazz');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile edit
  const [editName, setEditName] = useState(user?.name || '');
  const [editCity, setEditCity] = useState(user?.city || 'Lahore');
  const [editCarrier, setEditCarrier] = useState(user?.carrier || 'Jazz');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await signup({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        city: signupCity,
        carrier: signupCarrier,
        password: signupPassword,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail);
      setResetMessage(res.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editName,
      city: editCity,
      carrier: editCarrier,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === 'profile'
                  ? 'User Account'
                  : mode === 'signup'
                  ? 'Create PakCall Account'
                  : mode === 'forgot'
                  ? 'Reset Password'
                  : 'PakCall AI Sign In'}
              </h2>
              <span className="text-[10px] text-slate-400">
                Pakistan Telecom Single Sign-On
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if not logged in */}
        {!isAuthenticated && mode !== 'forgot' && (
          <div className="flex p-1 bg-slate-950 border-b border-slate-800">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE: PROFILE */}
          {isAuthenticated && mode === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{user?.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Verified
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{user?.carrier} PK</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Phone Number:</span>
                  <span className="font-mono text-slate-200">{user?.phone}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Registered City:</span>
                  <span className="text-slate-200">{user?.city}</span>
                </div>
              </div>

              {/* Edit Details */}
              <form onSubmit={handleProfileSave} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Update Account Details
                </h4>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      City
                    </label>
                    <select
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Lahore, Punjab">Lahore</option>
                      <option value="Karachi, Sindh">Karachi</option>
                      <option value="Islamabad, ICT">Islamabad</option>
                      <option value="Rawalpindi, Punjab">Rawalpindi</option>
                      <option value="Peshawar, KPK">Peshawar</option>
                      <option value="Faisalabad, Punjab">Faisalabad</option>
                      <option value="Multan, Punjab">Multan</option>
                      <option value="Quetta, Balochistan">Quetta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Carrier
                    </label>
                    <select
                      value={editCarrier}
                      onChange={(e) => setEditCarrier(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Jazz">Jazz</option>
                      <option value="Zong">Zong</option>
                      <option value="Telenor">Telenor</option>
                      <option value="Ufone">Ufone</option>
                      <option value="PTCL">PTCL</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                  >
                    {profileSaved ? 'Profile Updated!' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE: LOGIN */}
          {!isAuthenticated && mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tariq.khan@pakcall.ai"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950 transition-colors mt-2"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In to PakCall'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Don't have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* MODE: SIGNUP */}
          {!isAuthenticated && mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Tariq Ahmed Khan"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.pk"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pakistani Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telecom Carrier
                  </label>
                  <select
                    value={signupCarrier}
                    onChange={(e) => setSignupCarrier(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Jazz">Jazz (Mobilink)</option>
                    <option value="Zong">Zong 4G</option>
                    <option value="Telenor">Telenor PK</option>
                    <option value="Ufone">Ufone 4G</option>
                    <option value="SCOM">SCOM (AJK/GB)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  City in Pakistan
                </label>
                <select
                  value={signupCity}
                  onChange={(e) => setSignupCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Lahore, Punjab">Lahore</option>
                  <option value="Karachi, Sindh">Karachi</option>
                  <option value="Islamabad, ICT">Islamabad</option>
                  <option value="Rawalpindi, Punjab">Rawalpindi</option>
                  <option value="Peshawar, KPK">Peshawar</option>
                  <option value="Faisalabad, Punjab">Faisalabad</option>
                  <option value="Multan, Punjab">Multan</option>
                  <option value="Quetta, Balochistan">Quetta</option>
                  <option value="Sialkot, Punjab">Sialkot</option>
                  <option value="Gujranwala, Punjab">Gujranwala</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat pass"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950 transition-colors mt-2"
              >
                {isSubmitting ? 'Registering...' : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT */}
          {!isAuthenticated && mode === 'forgot' && (
            <div className="space-y-4">
              {resetMessage ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Reset Instructions Sent
                  </div>
                  <p className="text-xs text-slate-300">{resetMessage}</p>
                  <button
                    onClick={() => {
                      setMode('login');
                      setResetMessage('');
                    }}
                    className="mt-2 text-xs text-blue-400 hover:underline font-semibold"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the email registered with your PakCall account. We will send a secure password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="yourname@domain.pk"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950 transition-colors"
                  >
                    {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg('');
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Architecture info strip */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Firebase Ready Architecture:</span>
              <span className="text-blue-400 font-mono">auth() & firestore</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              State is wired to persistent local storage and designed for drop-in Firebase Authentication with Firestore call record sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
