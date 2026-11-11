import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Building2, 
  GraduationCap, 
  Banknote, 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { mailApi } from '../services/api';
import { extractRegistrationDeadline } from '../utils/deadlineParser';
import MessageModal from '../components/MessageModal';

export default function UrgentPage({ user, isDemo, onNavigateToMessages }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgentFilter, setUrgentFilter] = useState('all_urgent'); // 'all_urgent' | 'one_day' | 'two_days' | 'all_active'
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchUrgentMessages = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await mailApi.search({
        subject: 'Campus Recruitment',
        maxResults: 50
      });

      if (res.data && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch urgent placement messages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUrgentMessages();
  }, []);

  // Compute deadline info and filter drives
  const driveItems = useMemo(() => {
    return messages.map(msg => {
      const deadline = extractRegistrationDeadline(msg);
      return {
        message: msg,
        deadline,
        companyName: msg.eligibilityCriteria?.['Company Name'] || 
          msg.subject.replace(/^.*?(?:notification|drive|recruitment)\s*[:|–-]?\s*/i, '').replace(/\|.*$/, '').trim(),
        branches: msg.eligibilityCriteria?.['Eligible branches'] || '',
        ctc: msg.eligibilityCriteria?.['CTC'] || '',
        stipend: msg.eligibilityCriteria?.['Internship Stipend'] || '',
        placementLink: (msg.links || []).find(l => 
          l.label.toLowerCase().includes('placement') || l.url.toLowerCase().includes('placement')
        )?.url
      };
    });
  }, [messages]);

  // Urgent drives categorization
  const urgentDrives = useMemo(() => {
    return driveItems.filter(item => {
      if (!item.deadline || !item.deadline.remaining) return false;
      return !item.deadline.remaining.isExpired && item.deadline.remaining.daysLeft <= 3;
    }).sort((a, b) => {
      const daysA = a.deadline.remaining.daysLeft ?? 99;
      const daysB = b.deadline.remaining.daysLeft ?? 99;
      return daysA - daysB;
    });
  }, [driveItems]);

  const oneDayDrives = useMemo(() => {
    return driveItems.filter(item => {
      if (!item.deadline || !item.deadline.remaining) return false;
      return !item.deadline.remaining.isExpired && item.deadline.remaining.daysLeft <= 1;
    });
  }, [driveItems]);

  const twoDaysDrives = useMemo(() => {
    return driveItems.filter(item => {
      if (!item.deadline || !item.deadline.remaining) return false;
      return !item.deadline.remaining.isExpired && (item.deadline.remaining.daysLeft === 2 || item.deadline.remaining.daysLeft === 3);
    });
  }, [driveItems]);

  const allActiveDrives = useMemo(() => {
    return driveItems.filter(item => {
      if (!item.deadline || !item.deadline.remaining) return false;
      return !item.deadline.remaining.isExpired;
    }).sort((a, b) => {
      const daysA = a.deadline.remaining.daysLeft ?? 99;
      const daysB = b.deadline.remaining.daysLeft ?? 99;
      return daysA - daysB;
    });
  }, [driveItems]);

  // Filter based on active filter tab and search query
  const filteredDrives = useMemo(() => {
    let list = urgentDrives;
    if (urgentFilter === 'one_day') list = oneDayDrives;
    else if (urgentFilter === 'two_days') list = twoDaysDrives;
    else if (urgentFilter === 'all_active') list = allActiveDrives;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(item => {
      return (
        item.companyName.toLowerCase().includes(q) ||
        item.message.subject.toLowerCase().includes(q) ||
        item.branches.toLowerCase().includes(q)
      );
    });
  }, [urgentDrives, oneDayDrives, twoDaysDrives, allActiveDrives, urgentFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>High Priority Action Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Urgent Recruitment Drives
            </h1>
            <p className="text-sm sm:text-base text-red-100 max-w-2xl">
              Campus placement drives with registration deadlines closing within 1–2 days. Register before links close!
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center min-w-[90px]">
              <span className="text-2xl sm:text-3xl font-black block">{oneDayDrives.length}</span>
              <span className="text-[11px] font-bold text-red-100 uppercase tracking-wider block">Closing 1 Day</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center min-w-[90px]">
              <span className="text-2xl sm:text-3xl font-black block">{urgentDrives.length}</span>
              <span className="text-[11px] font-bold text-red-100 uppercase tracking-wider block">Total Urgent</span>
            </div>
            <button
              onClick={() => fetchUrgentMessages(true)}
              disabled={refreshing || loading}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition border border-white/20"
              title="Refresh drives"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#dadce0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setUrgentFilter('all_urgent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              urgentFilter === 'all_urgent'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>All Urgent ({urgentDrives.length})</span>
          </button>

          <button
            onClick={() => setUrgentFilter('one_day')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              urgentFilter === 'one_day'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>⏰ Before 1 Day ({oneDayDrives.length})</span>
          </button>

          <button
            onClick={() => setUrgentFilter('two_days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              urgentFilter === 'two_days'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>⏳ In 2–3 Days ({twoDaysDrives.length})</span>
          </button>

          <button
            onClick={() => setUrgentFilter('all_active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              urgentFilter === 'all_active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>All Active ({allActiveDrives.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Scanning for urgent campus drives...</p>
        </div>
      ) : filteredDrives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredDrives.map(({ message, deadline, companyName, branches, ctc, stipend, placementLink }) => {
            const isCritical = deadline?.remaining?.daysLeft <= 1;

            return (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all cursor-pointer hover:shadow-lg group flex flex-col justify-between ${
                  isCritical
                    ? 'border-amber-300 hover:border-amber-500 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20'
                    : 'border-red-200 hover:border-red-400'
                }`}
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isCritical ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Company</span>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#1A73E8] transition">
                          {companyName}
                        </h3>
                      </div>
                    </div>

                    {/* Countdown Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-xs flex-shrink-0 ${
                      isCritical
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                        : 'bg-red-600 text-white'
                    }`}>
                      <span className="mr-1 text-sm">⏳</span>
                      {deadline?.remaining?.text || 'Urgent'}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 line-clamp-2 mb-4 leading-snug">
                    {message.subject}
                  </p>

                  {/* Deadline Callout Box (Exact style matching user preference) */}
                  <div className="bg-[#fef3c7] p-3.5 rounded-xl border-l-4 border-[#f59e0b] shadow-2xs mb-4">
                    <span className="text-[11px] font-bold text-gray-950 uppercase tracking-wider block">
                      Registration Deadline:
                    </span>
                    <span className="text-sm font-black text-gray-950">
                      {deadline?.rawDeadline || 'Check email'}
                    </span>
                  </div>

                  {/* Eligibility Snippet */}
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    {branches && (
                      <div className="flex items-start space-x-2">
                        <GraduationCap className="w-4 h-4 text-[#673AB7] shrink-0 mt-0.5" />
                        <span className="line-clamp-1"><strong className="text-gray-800">Branches:</strong> {branches}</span>
                      </div>
                    )}
                    {ctc && (
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-[#1A73E8] shrink-0" />
                        <span><strong className="text-gray-800">CTC:</strong> {ctc}</span>
                      </div>
                    )}
                    {stipend && (
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong className="text-gray-800">Stipend:</strong> {stipend}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#1A73E8] font-bold group-hover:translate-x-1 transition flex items-center">
                    <span>View Notice</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>

                  {placementLink && (
                    <a
                      href={placementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xs"
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-200 shadow-xs max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Urgent Drives Found</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {searchQuery
              ? `No urgent recruitment drives match "${searchQuery}".`
              : 'All your campus drives have plenty of time remaining before deadlines close.'}
          </p>
        </div>
      )}

      {/* Modal View using the User's Preferred Template */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
