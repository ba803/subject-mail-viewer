import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Filter,
  ArrowRight,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { mailApi } from '../services/api';

export default function GroupsPage({ onFilterByGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await mailApi.getGroups();
        if (res.data && res.data.groups) {
          setGroups(res.data.groups);
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          Google Groups Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#5f6368] mt-1">
          Google Groups and mailing lists that broadcast messages directly to your connected Gmail mailbox.
        </p>
      </div>

      {/* Limitation Notice Card as per Feature 10 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 mb-8 text-xs sm:text-sm text-purple-900 shadow-sm">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-[#673AB7] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-[#512DA8] text-sm">
              How Google Group Delivery Works in Subject Mail Viewer
            </h3>
            <p className="text-purple-800 leading-relaxed">
              Google Groups distributes discussion topics and announcements by delivering emails to group subscribers' personal Gmail inboxes. The Gmail API indexes messages that are present inside your mailbox.
            </p>
            <div className="mt-2 bg-white/80 p-2.5 rounded-lg border border-purple-200 text-xs">
              <strong>Gmail API Limitation Note:</strong> The Gmail API does not have direct access to private web-only Google Group web archives. If a message was sent to a Google Group but not delivered to your Gmail inbox (e.g. you joined after the message was sent or email delivery was muted), it will display:
              <span className="block mt-1 font-mono text-purple-950 font-medium">
                "This Google Group message is not available in your Gmail mailbox."
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-[#5f6368]">
            <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-[#673AB7] rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Scanning mailbox for Google Group headers...</p>
          </div>
        ) : groups.length > 0 ? (
          groups.map((group, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#dadce0] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E5F5] text-[#512DA8] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-[#512DA8]">
                    {group.messageCount} matching {group.messageCount === 1 ? 'message' : 'messages'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#202124] truncate" title={group.name}>
                  {group.name}
                </h3>
                <p className="text-xs text-[#5f6368] font-mono mt-0.5 truncate" title={group.email}>
                  {group.email}
                </p>

                {group.listId && (
                  <div className="mt-3 bg-gray-50 p-2 rounded-lg text-[11px] text-gray-500 font-mono truncate">
                    List-ID: {group.listId}
                  </div>
                )}

                {group.latestSubject && (
                  <div className="mt-3 text-xs text-gray-600">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase block">Latest Topic:</span>
                    <p className="line-clamp-2 italic mt-0.5">"{group.latestSubject}"</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#f1f3f4]">
                <button
                  type="button"
                  onClick={() => onFilterByGroup(group.email)}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] hover:text-[#1A73E8] text-[#3c4043] rounded-xl text-xs font-semibold transition"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>View Group Messages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-[#dadce0] p-12 text-center text-[#5f6368]">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-[#202124]">No Google Groups Detected</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              No messages with Google Groups headers (such as List-Id or X-Google-Loop) were found in your recent mailbox scan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

