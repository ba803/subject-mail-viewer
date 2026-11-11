import React, { useState, useMemo } from 'react';
import { 
  X, 
  Mail, 
  Users, 
  Paperclip, 
  Download, 
  Calendar, 
  Clock, 
  Info, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Link2,
  Copy,
  Check,
  Building2,
  MapPin,
  GraduationCap,
  Banknote,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles
} from 'lucide-react';
import { mailApi } from '../services/api';
import { extractRegistrationDeadline } from '../utils/deadlineParser';

/**
 * Automatically extracts Eligibility Criteria key-value pairs from placement emails
 * e.g. Company Name, Date, Venue, Eligible branches, Eligibility, Internship Stipend, CTC
 */
function extractEligibilityCriteria(message) {
  if (!message) return null;

  if (message.eligibilityCriteria && typeof message.eligibilityCriteria === 'object' && Object.keys(message.eligibilityCriteria).length > 0) {
    const cleanCriteria = { ...message.eligibilityCriteria };
    delete cleanCriteria['Date'];
    delete cleanCriteria['date'];
    delete cleanCriteria['Drive Date'];
    delete cleanCriteria['Test Date'];
    return Object.keys(cleanCriteria).length > 0 ? cleanCriteria : null;
  }

  let text = message.textBody || '';
  if (!text && message.htmlBody) {
    text = message.htmlBody
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<[^>]*>/g, ' ');
  }

  const keys = [
    'Company Name',
    'Company',
    'Venue',
    'Location',
    'Eligible branches',
    'Eligible Branches',
    'Branches Eligible',
    'Eligibility',
    'Eligibility Criteria',
    'Internship Stipend',
    'Stipend',
    'CTC',
    'Package',
    'Salary',
    'Job Role',
    'Role',
    'Designation'
  ];

  const criteria = {};

  const pattern = new RegExp(
    `(${keys.join('|')})\\s*:\\s*([\\s\\S]*?)(?=(?:${keys.join('|')})\\s*:|\\n\\s*\\n|$)`,
    'gi'
  );

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const rawKey = match[1].trim();
    const rawVal = match[2].trim().replace(/\s+/g, ' ');

    const lowerKey = rawKey.toLowerCase();
    let standardKey = rawKey;

    if (lowerKey.includes('company')) standardKey = 'Company Name';
    else if (lowerKey.includes('venue') || lowerKey.includes('location')) standardKey = 'Venue';
    else if (lowerKey.includes('branch')) standardKey = 'Eligible branches';
    else if (lowerKey.includes('stipend')) standardKey = 'Internship Stipend';
    else if (lowerKey.includes('ctc') || lowerKey.includes('package') || lowerKey.includes('salary')) standardKey = 'CTC';
    else if (lowerKey === 'eligibility' || lowerKey.includes('criteria')) standardKey = 'Eligibility';
    else if (lowerKey.includes('role') || lowerKey.includes('designation')) standardKey = 'Role';

    if (rawVal && !criteria[standardKey]) {
      criteria[standardKey] = rawVal;
    }
  }

  return Object.keys(criteria).length > 0 ? criteria : null;
}

/**
 * Automatically extracts URLs and their corresponding labels from the email body.
 * Supports patterns like:
 *   company link: https://...
 *   placement link: https://...
 *   visit : https://...
 *   HTML <a href="...">anchor text</a>
 */
function extractLinksFromMessage(message) {
  if (!message) return [];

  const linksMap = new Map();

  if (Array.isArray(message.links)) {
    message.links.forEach(item => {
      if (item && item.url) {
        linksMap.set(item.url.trim(), item.label || 'Link');
      }
    });
  }

  const rawText = `${message.textBody || ''}\n${message.snippet || ''}`;
  const rawHtml = message.htmlBody || '';
  const fullTextToSearch = `${rawText}\n${rawHtml.replace(/<[^>]*>/g, ' ')}`;

  const labeledRegex = /([a-zA-Z0-9\s_-]{2,35})\s*:\s*(https?:\/\/[^\s<>"'\)]+)/gi;
  let match;
  while ((match = labeledRegex.exec(fullTextToSearch)) !== null) {
    const rawLabel = match[1].trim();
    let url = match[2].trim().replace(/[.,;!?]+$/, '');

    if (!/^(from|to|cc|bcc|date|subject|sent|reply-to|message-id|http|https)$/i.test(rawLabel)) {
      const cleanLabel = rawLabel
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .slice(-3)
        .join(' ');
      
      const formattedLabel = cleanLabel
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      linksMap.set(url, formattedLabel);
    }
  }

  if (rawHtml) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      const anchors = doc.querySelectorAll('a[href]');

      anchors.forEach(a => {
        let url = a.getAttribute('href');
        if (!url || !url.startsWith('http')) return;
        url = url.trim().replace(/[.,;!?]+$/, '');

        if (!linksMap.has(url)) {
          let label = (a.textContent || '').trim();

          const prevSibling = a.previousSibling;
          if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
            const prevMatch = prevSibling.textContent.match(/([a-zA-Z0-9\s_-]{2,25})\s*:\s*$/i);
            if (prevMatch) {
              label = prevMatch[1].trim();
            }
          }

          if (!label || label.startsWith('http') || label.length > 40) {
            try {
              const u = new URL(url);
              label = u.hostname.replace(/^www\./, '');
            } catch {
              label = 'Website Link';
            }
          }

          const cleanLabel = label.replace(/\s+/g, ' ').trim().slice(0, 30);
          linksMap.set(url, cleanLabel);
        }
      });
    } catch {
      // DOMParser fallback
    }
  }

  const urlRegex = /(https?:\/\/[^\s<>"'\)]+)/gi;
  while ((match = urlRegex.exec(fullTextToSearch)) !== null) {
    let url = match[1].trim().replace(/[.,;!?]+$/, '');
    if (!linksMap.has(url)) {
      try {
        const u = new URL(url);
        linksMap.set(url, u.hostname.replace(/^www\./, ''));
      } catch {
        linksMap.set(url, 'Link');
      }
    }
  }

  return Array.from(linksMap.entries())
    .map(([url, label]) => ({
      url,
      label: label || 'External Link'
    }))
    .filter(item => {
      const u = item.url.toLowerCase();
      const l = item.label.toLowerCase();
      // Remove Google Group links, mailing list footers, and unsubscribe links
      if (u.includes('groups.google.com') || u.includes('googlegroups.com')) return false;
      if (l.includes('google group') || l.includes('unsubscribe') || u.includes('unsubscribe')) return false;
      return true;
    });
}

export default function MessageModal({ message, onClose }) {
  const [showRawBody, setShowRawBody] = useState(false);
  const [rawViewMode, setRawViewMode] = useState('html');
  const [copiedLinkIdx, setCopiedLinkIdx] = useState(null);

  if (!message) return null;

  const isGroup = message.source === 'Google Group' || message.isGroup;

  // Extract Registration Deadline / End Date for Applying
  const deadlineInfo = useMemo(() => {
    return extractRegistrationDeadline(message);
  }, [message]);

  // 1. Extract Eligibility Criteria
  const eligibilityCriteria = useMemo(() => {
    return extractEligibilityCriteria(message);
  }, [message]);

  // 2. Extract Links
  const extractedLinks = useMemo(() => {
    return extractLinksFromMessage(message);
  }, [message]);

  // Check condition: if mail has placement link and also has visit link -> tell to register in NeoPat (NeoPad) app
  const hasPlacementLink = useMemo(() => {
    return extractedLinks.some(l => 
      l.label.toLowerCase().includes('placement') || l.url.toLowerCase().includes('placement')
    );
  }, [extractedLinks]);

  const hasVisitLink = useMemo(() => {
    return extractedLinks.some(l => 
      l.label.toLowerCase().includes('visit') || 
      l.url.toLowerCase().includes('neopat') || 
      l.url.toLowerCase().includes('neopad') ||
      l.label.toLowerCase().includes('portal')
    );
  }, [extractedLinks]);

  const requiresNeoPatRegistration = (hasPlacementLink && hasVisitLink) || 
    extractedLinks.some(l => l.url.toLowerCase().includes('neopat') || l.url.toLowerCase().includes('neopad')) ||
    Boolean(message.textBody && (message.textBody.toLowerCase().includes('neopat') || message.textBody.toLowerCase().includes('neopad')));

  const formatFileSize = (bytes = 0) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (att) => {
    const url = mailApi.getAttachmentUrl(message.id, att.attachmentId || att.id, att.filename);
    window.open(url, '_blank');
  };

  const handleCopyLink = (url, idx) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIdx(idx);
    setTimeout(() => setCopiedLinkIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dadce0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#dadce0] bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isGroup ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F3E5F5] text-[#512DA8] border border-[#D1C4E9]">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Source: Google Group
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#C2E7FF]">
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Source: Gmail
                  </span>
                )}
                <span className="text-xs text-[#5f6368] flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {message.date}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#202124] leading-snug">
                {message.subject}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sender & Recipient Details */}
          <div className="mt-3 pt-3 border-t border-[#f1f3f4] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5f6368]">
            <div>
              <span className="font-semibold text-[#202124]">From: </span>
              <span className="text-gray-800 break-all">{message.from}</span>
            </div>
            <div>
              <span className="font-semibold text-[#202124]">To: </span>
              <span className="text-gray-800 break-all">{message.to || '(Undisclosed recipients)'}</span>
            </div>
            {message.groupDetails && (
              <div className="sm:col-span-2 bg-[#F8F9FA] p-2 rounded-lg border border-[#e0e0e0] text-xs">
                <span className="font-semibold text-[#512DA8]">Google Group Info: </span>
                {message.groupDetails.name} ({message.groupDetails.email})
                {message.groupDetails.listId && <span className="ml-2 text-gray-500">List-ID: {message.groupDetails.listId}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Group Delivery Notification Banner */}
        {isGroup && (
          <div className="bg-purple-50 border-b border-purple-200 px-6 py-2 text-xs text-purple-900 flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#673AB7] flex-shrink-0" />
            <span>
              Delivered to your Gmail inbox via mailing list <strong>{message.groupDetails?.email || message.to}</strong>.
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-6">

          {/* ========================================================= */}
          {/* END DATE FOR APPLYING / REGISTRATION DEADLINE (CRITICAL) */}
          {/* ========================================================= */}
          {deadlineInfo && (
            <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-xs transition-all ${
              deadlineInfo.remaining.color === 'red'
                ? 'bg-gradient-to-r from-red-50 via-rose-50/70 to-white border-red-300 text-red-950'
                : deadlineInfo.remaining.color === 'amber'
                ? 'bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                    deadlineInfo.remaining.color === 'red'
                      ? 'bg-red-200/90 text-red-800'
                      : deadlineInfo.remaining.color === 'amber'
                      ? 'bg-amber-200/90 text-amber-900'
                      : 'bg-emerald-200/90 text-emerald-900'
                  }`}>
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                      End Date for Applying
                    </span>
                    <span className="text-base sm:text-lg font-extrabold tracking-tight">
                      {deadlineInfo.rawDeadline}
                    </span>
                  </div>
                </div>

                {/* Dynamic Countdown Badge (e.g. "Only 2 days left") */}
                <div className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wide ${
                  deadlineInfo.remaining.color === 'red'
                    ? 'bg-red-600 text-white'
                    : deadlineInfo.remaining.color === 'amber'
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <span className="mr-1.5 text-sm">⏳</span>
                  {deadlineInfo.remaining.text}
                </div>
              </div>

              {/* Detailed Registration Instruction */}
              {deadlineInfo.instruction && (
                <div className="mt-2.5 pt-2.5 border-t border-current/15 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                  <span className="font-bold mr-1.5">Registration:</span>
                  <span>{deadlineInfo.instruction}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. ELIGIBILITY CRITERIA (PRIMARY SECTION) */}
          {/* ========================================================= */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#202124]">
                1. Eligibility Criteria
              </h3>
            </div>

            {eligibilityCriteria ? (
              <div className="bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  {eligibilityCriteria['Company Name'] && (
                    <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                      <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Company Name</span>
                        <span className="text-base font-bold text-[#202124]">{eligibilityCriteria['Company Name']}</span>
                      </div>
                    </div>
                  )}

                  {/* Venue */}
                  {eligibilityCriteria['Venue'] && (
                    <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Venue</span>
                        <span className="text-sm font-semibold text-gray-800">{eligibilityCriteria['Venue']}</span>
                      </div>
                    </div>
                  )}

                  {/* Eligible Branches */}
                  {eligibilityCriteria['Eligible branches'] && (
                    <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-white rounded-xl border border-purple-100">
                      <GraduationCap className="w-5 h-5 text-[#673AB7] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-[#673AB7] uppercase tracking-wider block">Eligible Branches</span>
                        <span className="text-sm font-bold text-gray-900">{eligibilityCriteria['Eligible branches']}</span>
                      </div>
                    </div>
                  )}

                  {/* Academic Eligibility */}
                  {eligibilityCriteria['Eligibility'] && (
                    <div className="md:col-span-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        Academic Eligibility & Criteria
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-amber-950 whitespace-pre-wrap leading-relaxed">
                        {eligibilityCriteria['Eligibility']}
                      </p>
                    </div>
                  )}

                  {/* Internship Stipend */}
                  {eligibilityCriteria['Internship Stipend'] && (
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                      <Banknote className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Internship Stipend</span>
                        <span className="text-sm font-bold text-emerald-700">{eligibilityCriteria['Internship Stipend']}</span>
                      </div>
                    </div>
                  )}

                  {/* CTC */}
                  {eligibilityCriteria['CTC'] && (
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                      <Briefcase className="w-4 h-4 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">CTC / Package</span>
                        <span className="text-sm font-bold text-[#1A73E8]">{eligibilityCriteria['CTC']}</span>
                      </div>
                    </div>
                  )}

                  {/* Role */}
                  {eligibilityCriteria['Role'] && (
                    <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                      <Briefcase className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Role / Designation</span>
                        <span className="text-sm font-semibold text-gray-800">{eligibilityCriteria['Role']}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600">
                No structured eligibility criteria table detected in this email. You can expand the original email body below.
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SPECIAL RULE: NeoPat / NeoPad Registration Notice */}
          {/* ========================================================= */}
          {requiresNeoPatRegistration && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 flex items-start space-x-3 shadow-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900 flex items-center">
                  <span>Action Required: Please Register in the NeoPat (NeoPad) App</span>
                  <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold uppercase">
                    Mandatory
                  </span>
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  This campus recruitment drive has both a <strong>Placement Link</strong> and a <strong>Visit Link</strong>. Please ensure you open the <strong>NeoPat (NeoPad) app</strong> and complete your online registration and profile verification before the drive closing date.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. LINKS SECTION */}
          {/* ========================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1A73E8] flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#202124]">
                  2. Links ({extractedLinks.length})
                </h3>
              </div>
              <span className="text-xs text-[#5f6368]">
                Auto-extracted with labels
              </span>
            </div>

            {extractedLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extractedLinks.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3.5 rounded-2xl border border-[#dadce0] bg-[#f8fafd] hover:bg-white hover:border-[#1A73E8] transition group shadow-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[11px] font-bold text-[#1A73E8] uppercase tracking-wider bg-blue-100/70 text-[#1A73E8] px-2 py-0.5 rounded-md border border-blue-200 truncate">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-mono truncate" title={item.url}>
                        {item.url}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.url, idx)}
                        className="p-1.5 text-gray-400 hover:text-[#1A73E8] hover:bg-blue-50 rounded-lg transition"
                        title="Copy link to clipboard"
                      >
                        {copiedLinkIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#1A73E8] hover:bg-blue-100 rounded-lg transition"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">
                No external links detected in this email.
              </p>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. ATTACHMENTS SECTION */}
          {/* ========================================================= */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#673AB7] flex items-center justify-center">
                <Paperclip className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#202124]">
                3. Attachments ({message.attachments ? message.attachments.length : 0})
              </h3>
            </div>

            {message.attachments && message.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {message.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-[#dadce0] bg-[#f8fafd] hover:bg-white hover:border-[#1A73E8] transition group shadow-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1A73E8] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#202124] truncate" title={att.filename}>
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-[#5f6368]">
                          {formatFileSize(att.size)} &bull; {att.mimeType}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(att)}
                      className="p-2 text-[#1A73E8] hover:bg-blue-50 rounded-xl transition ml-2 flex-shrink-0"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">
                No attachments attached to this message.
              </p>
            )}
          </div>

          {/* ========================================================= */}
          {/* OPTIONAL TOGGLE: View Full Raw Email Body */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-[#f1f3f4]">
            <button
              type="button"
              onClick={() => setShowRawBody(!showRawBody)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-[#1A73E8] transition py-1"
            >
              <span>{showRawBody ? 'Hide Original Email Body' : 'View Full Original Email Body'}</span>
              {showRawBody ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawBody && (
              <div className="mt-3 p-4 bg-[#f8f9fa] border border-gray-200 rounded-2xl animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700">Original Email Body</span>
                  <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white text-[11px]">
                    <button
                      type="button"
                      onClick={() => setRawViewMode('html')}
                      className={`px-2 py-0.5 rounded ${rawViewMode === 'html' ? 'bg-[#1A73E8] text-white font-semibold' : 'text-gray-600'}`}
                    >
                      HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setRawViewMode('text')}
                      className={`px-2 py-0.5 rounded ${rawViewMode === 'text' ? 'bg-[#1A73E8] text-white font-semibold' : 'text-gray-600'}`}
                    >
                      Text
                    </button>
                  </div>
                </div>

                {rawViewMode === 'html' && message.htmlBody ? (
                  <div 
                    className="prose max-w-none text-xs text-[#202124] overflow-auto max-h-[300px] bg-white p-3 rounded-xl border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: message.htmlBody }} 
                  />
                ) : (
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800 leading-relaxed overflow-auto max-h-[300px] bg-white p-3 rounded-xl border border-gray-200">
                    {message.textBody || message.snippet || '(Empty message body)'}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-[#dadce0] rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
