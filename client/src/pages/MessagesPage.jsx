import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mail, 
  Users, 
  Inbox, 
  Filter, 
  Search, 
  Info, 
  AlertCircle, 
  FileQuestion, 
  ChevronDown, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Share2,
  Clock
} from 'lucide-react';
import SubjectSearchBox from '../components/SubjectSearchBox';
import MessageItem from '../components/MessageItem';
import MessageModal from '../components/MessageModal';
import RefreshBar from '../components/RefreshBar';
import { mailApi } from '../services/api';
import { extractRegistrationDeadline } from '../utils/deadlineParser';

export default function MessagesPage({ 
  initialFilters = {}, 
  activeSubject, 
  setActiveSubject 
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // 0 = off
  const [currentFilters, setCurrentFilters] = useState({
    subject: activeSubject || 'Campus Recruitment',
    matchType: 'contains',
    sender: '',
    group: '',
    fromDate: '',
    toDate: '',
    source: 'all',
    ...initialFilters
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeSourceTab, setActiveSourceTab] = useState('all'); // 'all', 'gmail', 'group'
  const [showExportMenu, setShowExportMenu] = useState(false);

  const executeSearch = useCallback(async (filters, isBackgroundRefresh = false) => {
    try {
      if (isBackgroundRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await mailApi.search({
        ...filters,
        source: filters.source || activeSourceTab
      });

      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSourceTab]);

  useEffect(() => {
    executeSearch(currentFilters);
  }, []);

  const handleSearchSubmit = (newFilters) => {
    const updated = { ...currentFilters, ...newFilters };
    setCurrentFilters(updated);
    if (newFilters.subject !== undefined) {
      setActiveSubject(newFilters.subject);
    }
    executeSearch(updated);
  };

  const handleSourceTabChange = (tab) => {
    setActiveSourceTab(tab);
    const updated = { ...currentFilters, source: tab };
    setCurrentFilters(updated);
    executeSearch(updated);
  };

  const handleManualRefresh = () => {
    executeSearch(currentFilters, true);
  };

  const oneDayMessagesCount = useMemo(() => {
    return messages.filter((m) => {
      const d = extractRegistrationDeadline(m);
      return d && d.remaining && d.remaining.daysLeft <= 1 && !d.remaining.isExpired;
    }).length;
  }, [messages]);

  // Filter messages based on activeSourceTab in UI
  const filteredMessages = messages.filter((msg) => {
    if (activeSourceTab === 'gmail') return msg.source === 'Gmail';
    if (activeSourceTab === 'group') return msg.source === 'Google Group';
    if (activeSourceTab === 'one-day') {
      const d = extractRegistrationDeadline(msg);
      return d && d.remaining && d.remaining.daysLeft <= 1 && !d.remaining.isExpired;
    }
    return true;
  });

  const gmailCount = messages.filter((m) => m.source === 'Gmail').length;
  const groupCount = messages.filter((m) => m.source === 'Google Group').length;

  // Export filtered messages as CSV
  const handleExportCSV = () => {
    if (filteredMessages.length === 0) return;
    const headers = ['ID', 'Subject', 'From', 'To', 'Source', 'Group', 'Date', 'Snippet'];
    const rows = filteredMessages.map((m) => [
      `"${m.id || ''}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${(m.from || '').replace(/"/g, '""')}"`,
      `"${(m.to || '').replace(/"/g, '""')}"`,
      `"${m.source || ''}"`,
      `"${(m.groupDetails?.email || '').replace(/"/g, '""')}"`,
      `"${(m.date || '').replace(/"/g, '""')}"`,
      `"${(m.snippet || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subject_mail_${(currentFilters.subject || 'export').replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export filtered messages as JSON
  const handleExportJSON = () => {
    if (filteredMessages.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredMessages, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `subject_mail_${(currentFilters.subject || 'export').replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
            Unified Inbox
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368]">
            All matching emails from your personal Gmail inbox and Google Group broadcasts combined in one stream.
          </p>
        </div>

        {/* Export / Share Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={filteredMessages.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#3c4043] rounded-xl text-xs sm:text-sm font-medium transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#5f6368]" />
            <span>Export Results</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" />
          </button>

          {showExportMenu && (
            <div 
              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#dadce0] py-1.5 z-20 animate-in fade-in"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full text-left px-3.5 py-2 text-xs text-[#202124] hover:bg-[#f1f3f4] flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export as CSV Spreadsheet</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full text-left px-3.5 py-2 text-xs text-[#202124] hover:bg-[#f1f3f4] flex items-center space-x-2"
              >
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Subject Filter & Combined Search Options */}
      <SubjectSearchBox
        onSearch={handleSearchSubmit}
        initialSubject={currentFilters.subject}
        loading={loading}
      />

      {/* Automatic Updates & Refresh Bar */}
      <RefreshBar
        lastUpdated={lastUpdated}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
      />

      {/* Unified Inbox Container */}
      <div className="bg-white rounded-2xl border border-[#dadce0] shadow-sm overflow-hidden">
        {/* Source Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#dadce0] px-4 pt-2 bg-[#f8fafd] flex-wrap gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => handleSourceTabChange('all')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition ${
                activeSourceTab === 'all'
                  ? 'border-[#1A73E8] text-[#1A73E8]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Unified All</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-gray-200 text-gray-700">
                {messages.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTabChange('gmail')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition ${
                activeSourceTab === 'gmail'
                  ? 'border-[#1A73E8] text-[#1A73E8]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gmail Only</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-blue-100 text-[#1A73E8]">
                {gmailCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTabChange('group')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition ${
                activeSourceTab === 'group'
                  ? 'border-[#673AB7] text-[#673AB7]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Google Groups Only</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-purple-100 text-[#673AB7]">
                {groupCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTabChange('one-day')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition ${
                activeSourceTab === 'one-day'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/70'
                  : 'border-transparent text-amber-800 hover:text-amber-950 hover:bg-amber-50/30'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Before 1 Day Applications</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-amber-200 text-amber-950 font-black border border-amber-300">
                {oneDayMessagesCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-[#5f6368] pb-2 sm:pb-0">
            Showing <strong className="text-[#202124]">{filteredMessages.length}</strong> matching emails
          </div>
        </div>

        {/* Banner for Before 1 Day Applications Tab */}
        {activeSourceTab === 'one-day' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse flex-shrink-0" />
              <span>
                Showing <strong>Before 1 Day Applications</strong> — recruitment drives whose deadline is closing within 1 day (tomorrow / today).
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSourceTabChange('all')}
              className="text-amber-800 underline font-semibold hover:text-amber-950 ml-2"
            >
              Show All Messages
            </button>
          </div>
        )}

        {/* Message List */}
        <div className="divide-y divide-[#f1f3f4] min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-[#1A73E8] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-[#5f6368]">
                Searching Gmail API for matching subject "{currentFilters.subject}"...
              </p>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onClick={(m) => setSelectedMessage(m)}
                searchTerm={currentFilters.subject}
              />
            ))
          ) : activeSourceTab === 'one-day' ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#202124] mb-1">
                No applications closing within 1 day
              </h3>
              <p className="text-xs sm:text-sm text-[#5f6368] max-w-md mx-auto mb-4">
                You have no placement drives closing tomorrow. All active deadlines have more time remaining.
              </p>
              <button
                type="button"
                onClick={() => handleSourceTabChange('all')}
                className="px-4 py-2 bg-[#1A73E8] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                View Unified All Messages
              </button>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#202124] mb-1">
                No matching messages found
              </h3>
              <p className="text-xs sm:text-sm text-[#5f6368] max-w-md mx-auto mb-4">
                No emails matched subject: <strong>"{currentFilters.subject}"</strong> with the selected filters.
              </p>

              {/* Specific message required by Feature 10 */}
              <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left">
                <p className="font-semibold flex items-center mb-1">
                  <Info className="w-4 h-4 mr-1 text-amber-700" />
                  Google Group Availability Notice:
                </p>
                <p className="text-amber-800">
                  This application retrieves Google Group messages when those Group messages are delivered to your authenticated Gmail mailbox.
                </p>
                <p className="italic font-mono text-[11px] text-amber-900 mt-1 bg-white p-2 rounded border border-amber-200">
                  This Google Group message is not available in your Gmail mailbox.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
