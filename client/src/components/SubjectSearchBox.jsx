import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, RotateCcw, Tag, History, Terminal } from 'lucide-react';

export default function SubjectSearchBox({ 
  onSearch, 
  initialSubject = 'Campus Recruitment', 
  loading = false,
  compact = false 
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [matchType, setMatchType] = useState('contains'); // 'contains', 'exact', 'starts_with'
  const [sender, setSender] = useState('');
  const [group, setGroup] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [source, setSource] = useState('all'); // 'all', 'gmail', 'group'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smv_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {
      // ignore
    }
  }, []);

  // Keyboard shortcut: Pressing '/' or 'Ctrl+K' focuses the subject search box
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is already typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    try {
      const existing = recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...existing].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('smv_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('smv_recent_searches');
  };

  const quickSubjects = [
    'Campus Recruitment',
    'Online Test',
    'CRMIT Solutions',
    'Trikaal Tech',
    'Internship',
    'Registration',
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (subject.trim()) {
      saveRecentSearch(subject);
    }
    onSearch({
      subject,
      matchType,
      sender,
      group,
      fromDate,
      toDate,
      source
    });
  };

  const handleReset = () => {
    setSubject('');
    setMatchType('contains');
    setSender('');
    setGroup('');
    setFromDate('');
    setToDate('');
    setSource('all');
    onSearch({
      subject: '',
      matchType: 'contains',
      sender: '',
      group: '',
      fromDate: '',
      toDate: '',
      source: 'all'
    });
  };

  const handleQuickSubject = (s) => {
    setSubject(s);
    saveRecentSearch(s);
    onSearch({
      subject: s,
      matchType,
      sender,
      group,
      fromDate,
      toDate,
      source
    });
  };

  // Preview the Gmail query
  const buildQueryPreview = () => {
    const parts = [];
    if (subject) parts.push(`subject:(${subject})`);
    if (sender) parts.push(`from:(${sender})`);
    if (group) parts.push(`(to:(${group}) OR list:(${group}))`);
    if (fromDate) parts.push(`after:${fromDate.replace(/-/g, '/')}`);
    if (toDate) parts.push(`before:${toDate.replace(/-/g, '/')}`);
    return parts.join(' ') || 'subject:(*)';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#dadce0] p-4 sm:p-5 shadow-sm mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5f6368]">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject to search (e.g. Exam, Timetable, Results)..."
              className="w-full pl-11 pr-16 py-3 bg-[#f1f3f4] focus:bg-white text-[#202124] placeholder-gray-500 rounded-xl border border-transparent focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base outline-none"
            />
            
            {/* Shortcut hint badge */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1.5 pointer-events-none">
              {subject ? (
                <button
                  type="button"
                  onClick={() => setSubject('')}
                  className="pointer-events-auto text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200 border border-gray-300 rounded shadow-xs">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Match Mode Selector */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              title="Subject Match Logic"
              className="px-3 py-3 bg-white border border-[#dadce0] rounded-xl text-xs sm:text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] focus:ring-2 focus:ring-blue-100 focus:border-[#1A73E8] outline-none"
            >
              <option value="contains">Partial Match (Contains)</option>
              <option value="exact">Exact Subject Match</option>
              <option value="starts_with">Starts With</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-1.5 px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition ${
                showAdvanced || sender || group || fromDate || toDate || source !== 'all'
                  ? 'border-[#1A73E8] bg-[#e8f0fe] text-[#1A73E8]'
                  : 'border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#1A73E8] hover:bg-[#1557b0] text-white rounded-xl font-medium text-sm transition shadow-sm hover:shadow disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#f1f3f4]">
          <span className="text-xs text-[#5f6368] flex items-center mr-1">
            <Tag className="w-3 h-3 mr-1" />
            Quick Examples:
          </span>
          {quickSubjects.map((qs) => (
            <button
              key={qs}
              type="button"
              onClick={() => handleQuickSubject(qs)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                subject.toLowerCase() === qs.toLowerCase()
                  ? 'bg-blue-100 border-[#1A73E8] text-[#1A73E8] font-medium'
                  : 'bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
              }`}
            >
              {qs}
            </button>
          ))}
        </div>

        {/* Recent Search History if available */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-dashed border-[#f1f3f4]">
            <span className="text-xs text-gray-400 flex items-center mr-1">
              <History className="w-3 h-3 mr-1" />
              Recent:
            </span>
            {recentSearches.map((rs, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickSubject(rs)}
                className="text-xs px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                {rs}
              </button>
            ))}
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-[11px] text-gray-400 hover:text-gray-600 ml-1 underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Advanced Filter Options Drawer */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[#dadce0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            {/* Sender filter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                  Sender (from:)
                </label>
                <button
                  type="button"
                  onClick={() => setSender('sathyabamaplacement@gmail.com')}
                  className="text-[10px] text-[#1A73E8] hover:underline"
                >
                  + Sathyabama
                </button>
              </div>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="sathyabamaplacement@gmail.com"
                className="w-full px-3 py-2 text-sm bg-white border border-[#dadce0] rounded-lg focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Google Group address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                  Group (to: / list:)
                </label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setGroup('sathyabama-pc-2027-engg@googlegroups.com')}
                    className="text-[10px] text-[#673AB7] hover:underline"
                    title="sathyabama-pc-2027-engg@googlegroups.com"
                  >
                    + PC 2027
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroup('Sathyabama-2027-Engg@googlegroups.com')}
                    className="text-[10px] text-[#673AB7] hover:underline"
                    title="Sathyabama-2027-Engg@googlegroups.com"
                  >
                    + 2027 Engg
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="sathyabama-pc-2027-engg@googlegroups.com"
                className="w-full px-3 py-2 text-sm bg-white border border-[#dadce0] rounded-lg focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-1">
                From Date (after:)
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#dadce0] rounded-lg focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-1">
                To Date (before:)
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#dadce0] rounded-lg focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Source Selection & Reset */}
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between pt-2 border-t border-[#f1f3f4] gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#5f6368] uppercase">Source:</span>
                <div className="inline-flex rounded-lg border border-[#dadce0] p-0.5 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setSource('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                      source === 'all' ? 'bg-white shadow text-[#1A73E8] font-semibold' : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    All Messages
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource('gmail')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                      source === 'gmail' ? 'bg-white shadow text-[#1A73E8] font-semibold' : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    Gmail Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource('group')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                      source === 'group' ? 'bg-white shadow text-[#673AB7] font-semibold' : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    Google Groups Only
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>

            {/* Live Gmail API Query Syntax Preview */}
            <div className="sm:col-span-2 lg:col-span-4 bg-gray-900 text-green-400 p-2.5 rounded-xl font-mono text-xs flex items-center space-x-2 overflow-x-auto">
              <Terminal className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-400">Gmail Query:</span>
              <span className="text-green-300 font-semibold">{buildQueryPreview()}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
