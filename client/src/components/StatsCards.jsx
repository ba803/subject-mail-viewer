import React from 'react';
import { Mail, Users, Inbox, Calendar } from 'lucide-react';

export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      title: 'Matching Messages',
      value: stats ? stats.matchingMessages : 0,
      icon: Inbox,
      color: 'bg-blue-50 text-[#1A73E8] border-blue-200',
      iconBg: 'bg-[#1A73E8] text-white',
      description: 'Matching current subject filter',
    },
    {
      title: 'Gmail Messages',
      value: stats ? stats.gmailMessages : 0,
      icon: Mail,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      description: 'Direct & personal inbox emails',
    },
    {
      title: 'Google Group Messages',
      value: stats ? stats.googleGroupMessages : 0,
      icon: Users,
      color: 'bg-purple-50 text-[#673AB7] border-purple-200',
      iconBg: 'bg-[#673AB7] text-white',
      description: 'Delivered from mailing lists',
    },
    {
      title: 'Latest Message',
      value: stats ? stats.latestMessageDate : 'N/A',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      description: 'Most recent matching email',
      isDate: true
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-[#dadce0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#5f6368]">
                  {card.title}
                </p>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
                ) : (
                  <h3 className={`text-2xl font-bold mt-1 ${card.isDate ? 'text-lg sm:text-xl text-[#202124]' : 'text-3xl text-[#202124]'}`}>
                    {card.value}
                  </h3>
                )}
                <p className="text-xs text-[#5f6368] mt-1 truncate">
                  {card.description}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${card.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

