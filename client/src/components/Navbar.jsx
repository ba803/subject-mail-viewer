import React, { useState } from 'react';
import { 
  Mail, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  ShieldAlert, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  Search,
  Flame
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  isDemo, 
  urgentCount = 0,
  onLogout, 
  onDisconnect 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'urgent', label: 'Urgent', icon: Flame, badge: urgentCount },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#673AB7] flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-[#202124] tracking-tight">Subject Mail Viewer</span>
                {isDemo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5f6368] hidden sm:block">Unified Gmail & Google Groups</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isUrgent = item.id === 'urgent';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? isUrgent
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'bg-[#e8f0fe] text-[#1A73E8] font-semibold'
                      : isUrgent
                      ? 'text-red-600 hover:bg-red-50/70 hover:text-red-700 font-semibold'
                      : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? isUrgent ? 'text-red-600' : 'text-[#1A73E8]' 
                      : isUrgent ? 'text-red-500' : 'text-[#5f6368]'
                  }`} />
                  <span className="hidden md:inline">{item.label}</span>
                  {isUrgent && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-red-600 text-white rounded-full animate-pulse shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Shortcut & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('messages')}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-[#f1f3f4] hover:bg-[#e8f0fe] hover:text-[#1A73E8] rounded-xl text-xs text-[#5f6368] transition border border-transparent hover:border-blue-200"
              title="Focus subject search"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Subject</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
                /
              </kbd>
            </button>

            <div className="relative">
              {user ? (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[#f1f3f4] transition focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-sm">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#202124] hidden lg:inline max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#dadce0] py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-[#dadce0]">
                      <p className="text-xs text-[#5f6368]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#202124] truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-[#5f6368] truncate">{user.email}</p>
                      {isDemo && (
                        <p className="mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Using local simulated Gmail mailbox
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4] flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4 text-[#5f6368]" />
                        <span>Account & Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4] flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4 text-[#5f6368]" />
                        <span>Sign Out</span>
                      </button>

                      {!isDemo && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onDisconnect();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-[#f1f3f4] mt-1"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          <span>Disconnect Google Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-[#5f6368]">Not connected</span>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

