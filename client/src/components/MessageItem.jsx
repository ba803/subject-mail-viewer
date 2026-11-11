import React, { useMemo } from 'react';
import { Mail, Users, Paperclip, ChevronRight, Calendar, Clock } from 'lucide-react';
import { extractRegistrationDeadline } from '../utils/deadlineParser';

export default function MessageItem({ message, onClick, searchTerm = '' }) {
  const isGroup = message.source === 'Google Group' || message.isGroup;

  const deadlineInfo = useMemo(() => {
    return extractRegistrationDeadline(message);
  }, [message]);

  // Format date
  const formatDate = (dateStr, timestamp) => {
    try {
      const d = timestamp ? new Date(timestamp) : new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Extract clean sender name
  const parseSender = (fromStr = '') => {
    const match = fromStr.match(/^"?([^"<]+)"?\s*(?:<([^>]+)>)?$/);
    if (match) {
      return {
        name: match[1].trim() || match[2] || fromStr,
        email: match[2] || match[1] || ''
      };
    }
    return { name: fromStr, email: '' };
  };

  const sender = parseSender(message.from);

  // Highlight search term in subject
  const renderSubject = (text, term) => {
    if (!term || !term.trim()) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={i} className="bg-yellow-100 text-yellow-900 font-semibold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onClick={() => onClick(message)}
      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-[#f1f3f4] hover:bg-[#f8fafd] hover:border-l-4 hover:border-l-[#1A73E8] cursor-pointer transition-all duration-150"
    >
      <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto flex-1 min-w-0">
        {/* Source Icon / Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
            isGroup
              ? 'bg-[#F3E5F5] text-[#512DA8] border border-[#D1C4E9]'
              : 'bg-[#E8F0FE] text-[#1A73E8] border border-[#C2E7FF]'
          }`}
          title={isGroup ? 'Received via Google Group' : 'Direct Gmail Message'}
        >
          {isGroup ? <Users className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        </div>

        {/* Sender and Source Badge */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[#202124] truncate max-w-[220px]" title={message.from}>
              {sender.name}
            </span>

            {/* Clear Source Badge as requested */}
            {isGroup ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F3E5F5] text-[#512DA8] border border-[#D1C4E9]">
                <Users className="w-3 h-3 mr-1" />
                Google Group{message.groupDetails?.name ? `: ${message.groupDetails.name}` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#E8F0FE] text-[#1A73E8] border border-[#C2E7FF]">
                <Mail className="w-3 h-3 mr-1" />
                Gmail
              </span>
            )}

            {message.hasAttachments && (
              <span className="inline-flex items-center text-xs text-gray-500" title="Has attachment(s)">
                <Paperclip className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Registration Deadline Pill */}
            {deadlineInfo && deadlineInfo.remaining && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  deadlineInfo.remaining.color === 'red'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : deadlineInfo.remaining.color === 'amber'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
                title={`Registration Deadline: ${deadlineInfo.rawDeadline}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {deadlineInfo.remaining.badge}
              </span>
            )}
          </div>

          {/* Subject & Snippet */}
          <div className="text-sm">
            <span className="font-medium text-[#202124]">
              {renderSubject(message.subject, searchTerm)}
            </span>
            <span className="text-gray-400 mx-1.5 hidden sm:inline">&ndash;</span>
            <span className="text-gray-500 line-clamp-1 sm:inline text-xs sm:text-sm">
              {message.snippet}
            </span>
          </div>
        </div>
      </div>

      {/* Date & Action */}
      <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pl-12 sm:pl-4 flex-shrink-0">
        <span className="text-xs text-[#5f6368] font-medium whitespace-nowrap">
          {formatDate(message.date, message.internalDate)}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1A73E8] group-hover:translate-x-0.5 transition ml-2 hidden sm:block" />
      </div>
    </div>
  );
}

