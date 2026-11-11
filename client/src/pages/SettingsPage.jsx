import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  LogOut, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Server,
  Terminal,
  Lock
} from 'lucide-react';

export default function SettingsPage({ 
  user, 
  isDemo, 
  isOAuthConfigured, 
  onLogout, 
  onDisconnect 
}) {
  const [showSetupGuide, setShowSetupGuide] = useState(!isOAuthConfigured);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-[#5f6368] mt-1">
          Manage your Google authentication, security permissions, and application configuration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Connected Account Card */}
        <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#202124] mb-4 flex items-center">
            <ShieldCheck className="w-5 h-5 text-[#1A73E8] mr-2" />
            Connected Google Account
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center space-x-4">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-xl">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-[#202124]">{user?.name || 'Account User'}</h3>
                  {isDemo && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Simulated Demo Profile
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#5f6368] font-mono">{user?.email}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Authenticated via Google OAuth 2.0
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 border border-[#dadce0] hover:bg-white text-[#3c4043] rounded-xl text-xs sm:text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4 text-[#5f6368]" />
                <span>Sign Out</span>
              </button>

              {!isDemo && (
                <button
                  type="button"
                  onClick={() => setDisconnectConfirm(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>

          {/* Disconnect Confirmation Prompt */}
          {disconnectConfirm && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-300 text-xs sm:text-sm text-red-900">
              <p className="font-bold mb-1">Confirm Google Account Disconnection</p>
              <p className="text-red-800 mb-3">
                This will immediately revoke this application's access token from Google OAuth servers and delete your active session. You will need to sign in again to browse emails.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={onDisconnect}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Yes, Revoke Access & Disconnect
                </button>
                <button
                  onClick={() => setDisconnectConfirm(false)}
                  className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Scopes Information Card */}
        <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#202124] mb-3 flex items-center">
            <Lock className="w-5 h-5 text-emerald-600 mr-2" />
            Security & OAuth Scopes
          </h2>
          <p className="text-xs sm:text-sm text-[#5f6368] mb-4">
            Subject Mail Viewer operates strictly under the principle of least privilege.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 font-mono">
                  https://www.googleapis.com/auth/gmail.readonly
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Allows reading emails, subjects, snippets, headers, and attachments. Cannot compose, delete, or send emails.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 font-mono">
                  https://www.googleapis.com/auth/userinfo.profile & userinfo.email
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Provides your display name, profile image, and primary Gmail address to identify the authenticated mailbox.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Cloud Console Setup Instructions */}
        <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
          >
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#1A73E8]" />
              <h2 className="text-base font-bold text-[#202124]">
                Google Cloud Setup Instructions
              </h2>
            </div>
            {showSetupGuide ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>

          {showSetupGuide && (
            <div className="mt-4 pt-4 border-t border-[#f1f3f4] text-xs sm:text-sm text-gray-700 space-y-4">
              <p>
                To enable live Google Sign-In with your real Gmail account, configure your OAuth credentials in the Google Cloud Console:
              </p>

              <ol className="list-decimal pl-5 space-y-2.5">
                <li>
                  Open <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-[#1A73E8] underline font-medium inline-flex items-center">Google Cloud Console <ExternalLink className="w-3 h-3 ml-0.5" /></a> and create or select a project.
                </li>
                <li>
                  Navigate to <strong>APIs &amp; Services &gt; Library</strong>, search for <strong>Gmail API</strong> and click <strong>Enable</strong>.
                </li>
                <li>
                  Go to <strong>APIs &amp; Services &gt; OAuth consent screen</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-600">
                    <li>Select User Type: <strong>External</strong></li>
                    <li>Enter App Name (e.g. <em>Subject Mail Viewer</em>) and your support email.</li>
                    <li>Add scope: <code className="bg-gray-100 px-1 py-0.5 rounded">.../auth/gmail.readonly</code></li>
                    <li>In <strong>Test Users</strong>, add your personal Gmail address.</li>
                  </ul>
                </li>
                <li>
                  Navigate to <strong>APIs &amp; Services &gt; Credentials</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-600">
                    <li>Click <strong>+ CREATE CREDENTIALS &gt; OAuth client ID</strong></li>
                    <li>Application type: <strong>Web application</strong></li>
                    <li>Authorized JavaScript origins: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:5173</code> (and your production frontend URL e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">https://username.github.io</code>)</li>
                    <li>Authorized redirect URIs: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:5050/api/auth/callback</code> (and your deployed backend URL e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">https://your-backend.onrender.com/api/auth/callback</code>)</li>
                  </ul>
                </li>
                <li>
                  Copy your <strong>Client ID</strong> and <strong>Client Secret</strong> into <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">server/.env</code>:
                  <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                    GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com{'\n'}
                    GOOGLE_CLIENT_SECRET=your_client_secret{'\n'}
                    GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/callback
                  </pre>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

