import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Users, 
  Inbox, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ChevronRight, 
  TrendingUp, 
  Tag,
  Clock,
  AlertTriangle
} from 'lucide-react';
import StatsCards from '../components/StatsCards';
import SubjectSearchBox from '../components/SubjectSearchBox';
import MessageItem from '../components/MessageItem';
import MessageModal from '../components/MessageModal';
import { mailApi } from '../services/api';
import { extractRegistrationDeadline } from '../utils/deadlineParser';

export default function DashboardPage({ 
  user, 
  isDemo, 
  onNavigateToMessages,
  activeSubject,
  setActiveSubject
}) {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchDashboardData = async (subject = activeSubject || 'Campus Recruitment') => {
    try {
      setLoading(true);
      const [statsRes, searchRes, groupsRes] = await Promise.all([
        mailApi.getStats(subject),
        mailApi.search({ subject, maxResults: 20 }),
        mailApi.getGroups()
      ]);

      if (statsRes.data && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }

      if (searchRes.data && searchRes.data.messages) {
        setRecentMessages(searchRes.data.messages);
      }

      if (groupsRes.data && groupsRes.data.groups) {
        setGroups(groupsRes.data.groups);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter messages whose registration deadline is within 1 day (urgent)
  const oneDayMessages = useMemo(() => {
    return recentMessages.filter((msg) => {
      const d = extractRegistrationDeadline(msg);
      return d && d.remaining && d.remaining.daysLeft <= 1 && !d.remaining.isExpired;
    });
  }, [recentMessages]);

  useEffect(() => {
    fetchDashboardData(activeSubject || 'Campus Recruitment');
  }, [activeSubject]);

  const handleSearch = (filters) => {
    setActiveSubject(filters.subject);
    fetchDashboardData(filters.subject);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Unified Subject Inbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.givenName || user?.name || 'Scholar'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Monitor all incoming emails matching specific subjects across both your personal Gmail mailbox and joined Google Groups mailing lists in one single unified feed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateToMessages()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-[#1A73E8] rounded-xl font-semibold text-xs sm:text-sm hover:bg-blue-50 transition shadow"
            >
              <Inbox className="w-4 h-4" />
              <span>Open Unified Inbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white opacity-10 rounded-full pointer-events-none"></div>
      </div>

      {/* 4 Stats Cards Required by Prompt */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#202124]">
            Overview Metrics for Subject: <span className="text-[#1A73E8]">"{activeSubject || 'Campus Recruitment'}"</span>
          </h2>
          <button
            onClick={() => fetchDashboardData(activeSubject || 'Campus Recruitment')}
            disabled={loading}
            className="text-xs text-[#1A73E8] hover:underline flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>
        <StatsCards stats={stats} loading={loading} />
      </div>

      {/* Subject Search Bar */}
      <SubjectSearchBox 
        onSearch={handleSearch} 
        initialSubject={activeSubject || 'Campus Recruitment'} 
        loading={loading} 
      />

      {/* ========================================================= */}
      {/* SECTION: BEFORE ONE DAY APPLICATIONS (CLOSING IN 1 DAY) */}
      {/* ========================================================= */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-4 h-4 animate-pulse text-amber-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#202124] flex items-center">
                <span>Before 1 Day Applications</span>
                <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {oneDayMessages.length} Urgent
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Placement drives closing within 1 day (tomorrow / today)
              </p>
            </div>
          </div>

          {oneDayMessages.length > 0 && (
            <button
              onClick={() => onNavigateToMessages()}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center space-x-1"
            >
              <span>View in Inbox</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {oneDayMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oneDayMessages.map((msg) => {
              const d = extractRegistrationDeadline(msg);
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                        {msg.eligibilityCriteria?.['Company Name'] || 'Placement Notification'}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#1A73E8] transition line-clamp-1">
                        {msg.subject}
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs animate-pulse flex-shrink-0">
                      ⏳ {d?.remaining?.text || 'Only 1 day left'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-amber-200/60 mt-2">
                    <span className="font-semibold text-gray-800">
                      Deadline: <span className="text-amber-900 font-bold">{d?.rawDeadline || 'Within 1 day'}</span>
                    </span>
                    <span className="text-[#1A73E8] font-bold group-hover:translate-x-1 transition flex items-center">
                      <span>View &amp; Apply</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">No applications closing within 1 day.</span>
              <p className="text-emerald-700 mt-0.5">All your active recruitment drives have more than 1 day remaining.</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Recent Matching Messages Preview & Google Groups widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Matching Messages Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dadce0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-[#1A73E8]" />
              <h3 className="font-bold text-[#202124] text-base">
                Latest Matching Messages
              </h3>
            </div>
            <button
              onClick={() => onNavigateToMessages()}
              className="text-xs font-semibold text-[#1A73E8] hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All ({stats?.matchingMessages || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#f1f3f4] flex-1">
            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onClick={(m) => setSelectedMessage(m)}
                  searchTerm={activeSubject}
                />
              ))
            ) : (
              <div className="p-8 text-center text-[#5f6368]">
                <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No messages found matching "{activeSubject}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try searching for another subject like "Exam", "Timetable", or "Results".
                </p>
              </div>
            )}
          </div>

          {recentMessages.length > 0 && (
            <div className="p-3 bg-[#f8f9fa] border-t border-[#f1f3f4] text-center">
              <button
                onClick={() => onNavigateToMessages()}
                className="text-xs text-[#1A73E8] font-semibold hover:underline"
              >
                Go to Full Unified Inbox with Advanced Filters &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Google Groups & Architecture Overview */}
        <div className="space-y-6">
          {/* Detected Google Groups Card */}
          <div className="bg-white rounded-2xl border border-[#dadce0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#673AB7]" />
                <h3 className="font-bold text-[#202124] text-sm sm:text-base">
                  Detected Google Groups
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#673AB7]">
                {groups.length} Groups
              </span>
            </div>

            <p className="text-xs text-[#5f6368] mb-3">
              Mailing lists detected delivering messages to your Gmail inbox:
            </p>

            <div className="space-y-2.5">
              {groups.slice(0, 4).map((grp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition cursor-pointer"
                  onClick={() => onNavigateToMessages({ group: grp.email })}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#512DA8] truncate max-w-[170px]">
                      {grp.name || grp.email}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                      {grp.messageCount} msgs
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-1">
                    {grp.email}
                  </p>
                </div>
              ))}

              {groups.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                  No active Google Group mailing lists detected yet.
                </div>
              )}
            </div>
          </div>

          {/* Architecture Pipeline Explanation Box */}
          <div className="bg-gradient-to-br from-[#f8fafd] to-white rounded-2xl border border-blue-100 p-5 shadow-sm text-xs text-[#5f6368]">
            <h4 className="font-bold text-[#202124] text-xs uppercase tracking-wider mb-2 flex items-center">
              <Layers className="w-4 h-4 text-[#1A73E8] mr-1.5" />
              Unified Flow
            </h4>
            <p className="mb-3 leading-relaxed">
              Google Account &rarr; Gmail API &rarr; Subject Filter &rarr; Unified Inbox.
            </p>
            <div className="bg-white p-3 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-700 space-y-1">
              <div>&bull; Gmail Messages &rarr; Subject Filter</div>
              <div>&bull; Google Group Messages &rarr; Subject Filter</div>
              <div className="text-[#1A73E8] font-bold">&rarr; Unified Inbox Display</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}

