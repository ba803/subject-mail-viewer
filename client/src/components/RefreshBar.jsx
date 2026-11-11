import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export default function RefreshBar({ 
  lastUpdated, 
  onRefresh, 
  refreshing, 
  autoRefreshInterval, 
  setAutoRefreshInterval 
}) {
  const [secondsLeft, setSecondsLeft] = useState(autoRefreshInterval || 0);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(autoRefreshInterval);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onRefresh();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, onRefresh]);

  const formatTime = (date) => {
    if (!date) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-white border border-[#dadce0] rounded-xl px-4 py-2.5 mb-4 shadow-sm text-xs sm:text-sm">
      {/* Last Updated Timestamp */}
      <div className="flex items-center space-x-2 text-[#5f6368]">
        <Clock className="w-4 h-4 text-gray-400" />
        <span>
          Last updated: <strong className="text-[#202124]">{formatTime(lastUpdated)}</strong>
        </span>
      </div>

      {/* Refresh Controls & Auto-refresh Selector */}
      <div className="flex items-center space-x-3 mt-2 sm:mt-0">
        <div className="flex items-center space-x-1.5 text-xs text-[#5f6368]">
          <span>Auto-refresh:</span>
          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            className="bg-[#f1f3f4] text-[#202124] border-0 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-[#1A73E8] outline-none"
          >
            <option value={0}>Off</option>
            <option value={30}>Every 30s</option>
            <option value={60}>Every 1 min</option>
            <option value={120}>Every 2 min</option>
            <option value={300}>Every 5 min</option>
          </select>
          {autoRefreshInterval > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-[#1A73E8] border border-blue-200">
              {secondsLeft}s
            </span>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1A73E8] rounded-lg font-medium transition shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
}

