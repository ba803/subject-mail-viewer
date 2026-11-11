import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GoogleSignInCard from './components/GoogleSignInCard';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import GroupsPage from './pages/GroupsPage';
import SettingsPage from './pages/SettingsPage';
import { authApi } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('subject_mail_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isDemo, setIsDemo] = useState(() => {
    try {
      return localStorage.getItem('subject_mail_is_demo') === 'true';
    } catch {
      return false;
    }
  });
  const [isOAuthConfigured, setIsOAuthConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubject, setActiveSubject] = useState('Campus Recruitment');
  const [messagesFilters, setMessagesFilters] = useState({});
  const [notification, setNotification] = useState(null);

  // Check auth state and query params on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for URL callback query parameters from Google OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          try {
            localStorage.setItem('subject_mail_token', urlToken);
          } catch {}
        }

        if (urlParams.get('auth_success')) {
          setNotification({ type: 'success', message: 'Successfully signed in with Google!' });
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('auth_error')) {
          setNotification({ 
            type: 'error', 
            message: `Sign-in error: ${decodeURIComponent(urlParams.get('auth_error'))}` 
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const savedToken = localStorage.getItem('subject_mail_token');
        const savedUserStr = localStorage.getItem('subject_mail_user');
        const savedIsDemo = localStorage.getItem('subject_mail_is_demo') === 'true';
        let savedUser = null;
        try {
          if (savedUserStr) savedUser = JSON.parse(savedUserStr);
        } catch {}

        const res = await authApi.restoreSession({
          token: savedToken,
          user: savedUser,
          isDemo: savedIsDemo
        });

        if (res.data) {
          setIsOAuthConfigured(res.data.isOAuthConfigured);
          if (res.data.isAuthenticated && res.data.user) {
            setUser(res.data.user);
            setIsDemo(Boolean(res.data.isDemo));
            try {
              localStorage.setItem('subject_mail_user', JSON.stringify(res.data.user));
              localStorage.setItem('subject_mail_is_demo', String(Boolean(res.data.isDemo)));
              if (res.data.token) {
                localStorage.setItem('subject_mail_token', res.data.token);
              }
            } catch {}
          } else if (!savedUser) {
            setUser(null);
            setIsDemo(false);
            try {
              localStorage.removeItem('subject_mail_user');
              localStorage.removeItem('subject_mail_token');
              localStorage.removeItem('subject_mail_is_demo');
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to verify session status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData, isDemoMode = false, token = null) => {
    setUser(userData);
    setIsDemo(isDemoMode);
    try {
      localStorage.setItem('subject_mail_user', JSON.stringify(userData));
      localStorage.setItem('subject_mail_is_demo', String(Boolean(isDemoMode)));
      if (token) {
        localStorage.setItem('subject_mail_token', token);
      }
    } catch {}
    setActiveTab('dashboard');
    setNotification({
      type: 'success',
      message: isDemoMode ? 'Demo Mode activated with simulated Gmail & Google Groups data!' : 'Connected successfully!'
    });
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsDemo(false);
      try {
        localStorage.removeItem('subject_mail_user');
        localStorage.removeItem('subject_mail_token');
        localStorage.removeItem('subject_mail_is_demo');
      } catch {}
      setActiveTab('dashboard');
      setNotification({ type: 'info', message: 'You have been signed out.' });
    }
  };

  const handleDisconnect = async () => {
    try {
      await authApi.disconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setUser(null);
      setIsDemo(false);
      try {
        localStorage.removeItem('subject_mail_user');
        localStorage.removeItem('subject_mail_token');
        localStorage.removeItem('subject_mail_is_demo');
      } catch {}
      setActiveTab('dashboard');
      setNotification({ 
        type: 'info', 
        message: 'Google Account disconnected and OAuth token revoked.' 
      });
    }
  };

  const handleFilterByGroup = (groupEmail) => {
    setMessagesFilters({ group: groupEmail });
    setActiveTab('messages');
  };

  const handleNavigateToMessages = (customFilters = {}) => {
    if (Object.keys(customFilters).length > 0) {
      setMessagesFilters(customFilters);
    }
    setActiveTab('messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1A73E8] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#202124]">Loading Subject Mail Viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fc]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isDemo={isDemo}
        onLogout={handleLogout}
        onDisconnect={handleDisconnect}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full">
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border ${
              notification.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs ml-4 underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {!user ? (
          <GoogleSignInCard
            onLoginSuccess={handleLoginSuccess}
            isOAuthConfigured={isOAuthConfigured}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                user={user}
                isDemo={isDemo}
                onNavigateToMessages={handleNavigateToMessages}
                activeSubject={activeSubject}
                setActiveSubject={setActiveSubject}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesPage
                initialFilters={messagesFilters}
                activeSubject={activeSubject}
                setActiveSubject={setActiveSubject}
              />
            )}

            {activeTab === 'groups' && (
              <GroupsPage
                onFilterByGroup={handleFilterByGroup}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                user={user}
                isDemo={isDemo}
                isOAuthConfigured={isOAuthConfigured}
                onLogout={handleLogout}
                onDisconnect={handleDisconnect}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#dadce0] py-4 text-center text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Subject Mail Viewer &bull; Unified Gmail & Google Groups API</span>
          <span>Google OAuth 2.0 &bull; Read-only minimum privileges</span>
        </div>
      </footer>
    </div>
  );
}

