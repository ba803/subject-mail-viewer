import React, { useState } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../services/api';

export default function GoogleSignInCard({ onLoginSuccess, isOAuthConfigured }) {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState(null);

  // Official Google OAuth 2.0 flow
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.getAuthUrl();
      if (res.data && res.data.url) {
        // Redirect browser to Google's official login & consent screen
        window.location.href = res.data.url;
      } else {
        throw new Error('OAuth authorization URL was not returned.');
      }
    } catch (err) {
      console.error('Google sign-in initiate error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to start Google sign-in';
      setError(msg);
      setLoading(false);
    }
  };

  // Instant Demo Mode Preview
  const handleTryDemo = async () => {
    try {
      setDemoLoading(true);
      setError(null);
      const res = await authApi.startDemo();
      if (res.data && res.data.success) {
        onLoginSuccess(res.data.user, true, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to launch demo mode');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#dadce0] p-6 sm:p-8 text-center animate-in fade-in duration-300">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1A73E8] to-[#673AB7] flex items-center justify-center text-white mx-auto shadow-lg mb-4">
          <Mail className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
          Subject Mail Viewer
        </h1>
        <p className="text-xs sm:text-sm text-[#5f6368] mt-2 mb-6">
          Unify all Gmail and Google Group messages matching any subject into one single inbox.
        </p>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-left">
            <p className="font-semibold flex items-center mb-1">
              <AlertCircle className="w-4 h-4 mr-1 text-red-600 flex-shrink-0" />
              Sign-in Notice:
            </p>
            <p>{error}</p>
          </div>
        )}

        {/* PRIMARY ACTION: CONTINUE WITH GOOGLE ACCOUNT */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-5 bg-white border-2 border-[#dadce0] hover:border-[#1A73E8] hover:bg-[#f8fafd] text-[#3c4043] rounded-2xl font-semibold text-sm sm:text-base transition-all shadow-sm hover:shadow-md focus:ring-4 focus:ring-blue-100 disabled:opacity-60 group"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-[#202124] group-hover:text-[#1A73E8] transition">
              {loading ? 'Connecting to Google...' : 'Continue with Google Account'}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A73E8] group-hover:translate-x-0.5 transition ml-auto" />
          </button>

          <p className="text-xs text-[#5f6368] text-center">
            Sign in with your Google account &bull; Click "Allow" on the Google permission screen
          </p>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
            </div>
          </div>

          {/* Instant Demo Preview Button */}
          <button
            type="button"
            onClick={handleTryDemo}
            disabled={demoLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 text-[#1A73E8] rounded-2xl font-semibold text-xs sm:text-sm transition shadow-xs disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-[#673AB7]" />
            <span>{demoLoading ? 'Loading Preview...' : 'Try Demo Preview (Instant Offline Mode)'}</span>
          </button>
        </div>

        {/* Security & Privacy Guarantees */}
        <div className="mt-8 pt-6 border-t border-[#f1f3f4] text-left space-y-2.5">
          <p className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-2">
            How It Works
          </p>
          <div className="flex items-center space-x-2 text-xs text-[#5f6368]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Click <strong>Continue with Google</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#5f6368]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Select your Gmail account and click <strong>Allow</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#5f6368]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Unified inbox opens immediately with all matching emails</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#5f6368]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Read-only permissions &bull; Never asks for your password</span>
          </div>
        </div>
      </div>
    </div>
  );
}
