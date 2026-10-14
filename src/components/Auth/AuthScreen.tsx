import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User as UserType } from '../../types';

interface AuthScreenProps {
  onOpenConfigGuide?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { login, signup, loginWithGoogle, resetPassword, projectId } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'guide'>('login');

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

  // States
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode(undefined);
    setIsLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
        setErrorCode(res.code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMsg('');
    setErrorCode(undefined);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google Sign-In failed.');
        setErrorCode(res.code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode(undefined);

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
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
        setErrorCode(res.code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setResetMessage(res.message);
      } else {
        setErrorMsg(res.error || 'Failed to send reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Brand Hero Lockup */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-900/40 mb-3 border border-blue-400/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">PakCall AI</h1>
        <p className="text-xs text-blue-400 font-urdu mt-0.5 text-base">
          پاکستانی اے آئی کال اسسٹنٹ
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Sign in to access your screened calls and personalized AI assistant
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-2xl backdrop-blur-md space-y-4">
        {/* Navigation Tabs if not forgot/guide */}
        {mode !== 'forgot' && mode !== 'guide' && (
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setErrorCode(undefined);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setErrorCode(undefined);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert with Firebase-Specific Guidance */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-1.5 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>

            {/* If operation not allowed, give immediate actionable solution */}
            {errorCode === 'auth/operation-not-allowed' && (
              <div className="pt-2 border-t border-rose-900/80 text-[11px] text-rose-300 space-y-1">
                <p>
                  <strong>How to enable:</strong> Go to the{' '}
                  <a
                    href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white font-bold"
                  >
                    Firebase Console Authentication Tab
                  </a>
                  , select <strong>Sign-in method</strong>, click <strong>Email/Password</strong>, and toggle <strong>Enable</strong>.
                </p>
                <p className="text-slate-300">
                  Or simply click <strong>"Continue with Google"</strong> below to sign in right now!
                </p>
              </div>
            )}
          </div>
        )}

        {/* MODE: SIGN IN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Authenticating with Firebase...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-mono">
                Or
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Google Fast Login */}
            <button
              type="button"
              onClick={handleGoogleSubmit}
              disabled={isLoading}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        )}

        {/* MODE: SIGN UP */}
        {mode === 'signup' && (
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Telecom Carrier
                </label>
                <select
                  value={signupCarrier}
                  onChange={(e) => setSignupCarrier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Jazz">Jazz (Mobilink)</option>
                  <option value="Zong">Zong 4G</option>
                  <option value="Telenor">Telenor PK</option>
                  <option value="Ufone">Ufone 4G</option>
                  <option value="SCOM">SCOM</option>
                  <option value="PTCL">PTCL</option>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Firebase Account...</span>
                </>
              ) : (
                <span>Register with PakCall</span>
              )}
            </button>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Reset Your Password</span>
            </h2>

            {resetMessage ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reset Email Sent</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{resetMessage}</p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetMessage('');
                  }}
                  className="mt-2 text-xs text-blue-400 hover:underline font-semibold block"
                >
                  ← Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered email address and Firebase will email you a secure link to choose a new password.
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="tariq@example.pk"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Sending Reset Email...' : 'Send Password Reset Email'}
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

        {/* MODE: CONFIG GUIDE */}
        {mode === 'guide' && (
          <div className="space-y-3 text-xs text-slate-300">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Firebase Configuration Details</span>
            </h2>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Firebase Project:</span>
                <span className="font-mono text-blue-400 font-bold">{projectId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Database:</span>
                <span className="font-mono text-emerald-400">Cloud Firestore Active</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Security Rules:</span>
                <span className="font-mono text-slate-200">Deployed (Zero-Trust ABAC)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 space-y-1.5 text-[11px]">
              <div className="font-bold text-blue-300">Enabling Email/Password in Console:</div>
              <p className="text-slate-300">
                1. Visit the{' '}
                <a
                  href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline font-semibold"
                >
                  Firebase Authentication Providers
                </a>{' '}
                page.
              </p>
              <p className="text-slate-300">
                2. Click on <strong>Email/Password</strong> and toggle <strong>Enable</strong>, then click Save.
              </p>
              <p className="text-slate-300">
                3. Your users will be able to register and sign in with email and password without restriction!
              </p>
            </div>

            <button
              onClick={() => setMode('login')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Footer info & security badge */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Passwords securely salted & hashed</span>
          </div>

          <button
            onClick={() => setMode('guide')}
            className="text-blue-400 hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Firebase Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
