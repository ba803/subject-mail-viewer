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
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedLinkIdx, setCopiedLinkIdx] = useState(null);

  if (!message) return null;

  // Clean detection of whether HTML has real content or is just a short stub
  const htmlContent = (message.htmlBody || '').trim();
  const textContent = (message.textBody || message.snippet || '').trim();
  const htmlPlainText = htmlContent.replace(/<[^>]*>/g, '').trim();

  // If HTML is just a 1-sentence stub while text is long, start in text view
  const preferText = textContent.length > 80 && htmlPlainText.length < 50;
  const [rawViewMode, setRawViewMode] = useState(preferText ? 'text' : 'html');

  const isGroup = message.source === 'Google Group' || message.isGroup;

  // Format header date and time cleanly (e.g. 10 Nov 2026, 03:25 pm)
  const formatHeaderDateTime = (dateStr, timestamp) => {
    if (!dateStr && !timestamp) return '';
    try {
      const d = timestamp ? new Date(timestamp) : new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Extract Registration Deadline / End Date for Applying
  const deadlineInfo = useMemo(() => {
    return extractRegistrationDeadline(message);
  }, [message]);

  // 1. Extract Eligibility Criteria
  const eligibilityCriteria = useMemo(() => {
    return extractEligibilityCriteria(message);
  }, [message]);

  const companyName = useMemo(() => {
    if (eligibilityCriteria?.['Company Name']) return eligibilityCriteria['Company Name'];
    const subj = message.subject || '';
    const match = subj.match(/(?:Notification|Drive|Recruitment)\s*[:|–-]?\s*([^|\n-]+)/i) ||
                  subj.match(/\|\s*([^|\n]+?)(?:\s*\||\s*Campus|\s*Registration|$)/i);
    if (match && match[1].trim()) return match[1].trim();
    return 'Campus Recruitment';
  }, [eligibilityCriteria, message.subject]);

  const venue = eligibilityCriteria?.['Venue'];
  const branches = eligibilityCriteria?.['Eligible branches'] || eligibilityCriteria?.['Eligible Branches'] || eligibilityCriteria?.['Branches Eligible'];
  const eligibility = eligibilityCriteria?.['Eligibility'] || eligibilityCriteria?.['Eligibility Criteria'];
  const stipend = eligibilityCriteria?.['Internship Stipend'] || eligibilityCriteria?.['Stipend'];
  const ctc = eligibilityCriteria?.['CTC'] || eligibilityCriteria?.['Package'] || eligibilityCriteria?.['Salary'];
  const role = eligibilityCriteria?.['Role'] || eligibilityCriteria?.['Job Role'] || eligibilityCriteria?.['Designation'];

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
                  {formatHeaderDateTime(message.date, message.internalDate)}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8f9fa] space-y-6">

          {/* ========================================================= */}
          {/* USER PREFERRED OFFICIAL PLACEMENT NOTIFICATION TEMPLATE */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl border border-[#dadce0] p-6 sm:p-8 shadow-xs text-sm sm:text-base leading-relaxed text-[#202124]">
            
            {/* Introductory Line */}
            <p className="font-semibold text-gray-800 text-base sm:text-lg mb-4">
              Campus Recruitment Notification from <strong className="font-bold text-gray-900">{companyName}</strong>.
            </p>

            {/* Key Criteria Details (Clean Document Format) */}
            <div className="space-y-1.5 font-normal text-gray-800 mb-5">
              <p><strong className="font-bold text-gray-900">Company Name:</strong> {companyName}</p>
              {venue && venue !== 'Will be Communicated Later' && (
                <p><strong className="font-bold text-gray-900">Venue:</strong> {venue}</p>
              )}
              {branches && (
                <p><strong className="font-bold text-gray-900">Eligible branches:</strong> {branches}</p>
              )}
              {eligibility && (
                <p><strong className="font-bold text-gray-900">Eligibility:</strong> {eligibility}</p>
              )}
              {stipend && (
                <p><strong className="font-bold text-gray-900">Internship Stipend:</strong> {stipend}</p>
              )}
              {ctc && (
                <p><strong className="font-bold text-gray-900">CTC:</strong> {ctc}</p>
              )}
              {role && (
                <p><strong className="font-bold text-gray-900">Role:</strong> {role}</p>
              )}
            </div>

            {/* Registration Highlight Box (Warm Yellow Container with Orange Left Border) */}
            <div className="bg-[#fef3c7] p-4 sm:p-5 rounded-r-2xl rounded-l-md border-l-4 border-[#f59e0b] shadow-2xs mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <strong className="font-bold text-gray-950 text-sm sm:text-base">Registration:</strong>
                {deadlineInfo?.remaining && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                    deadlineInfo.remaining.color === 'red'
                      ? 'bg-red-600 text-white'
                      : deadlineInfo.remaining.color === 'amber'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    <span className="mr-1">⏳</span>
                    {deadlineInfo.remaining.text}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed">
                All the eligible &amp; interested students are requested to register in the Placement link below on or before{' '}
                <strong className="font-black text-gray-950 underline decoration-amber-500 decoration-2">
                  {deadlineInfo?.rawDeadline || 'the closing deadline'}
                </strong>.
              </p>
            </div>

            {/* Links Section */}
            {extractedLinks.length > 0 && (
              <div className="space-y-2 mb-5">
                {extractedLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm sm:text-base flex-wrap">
                    <strong className="font-bold text-gray-900">{item.label}:</strong>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A73E8] underline hover:text-blue-800 break-all font-medium inline-flex items-center"
                    >
                      <span>{item.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.url, idx)}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                      title="Copy link"
                    >
                      {copiedLinkIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* NeoPat Notice if both placement & visit links exist */}
            {requiresNeoPatRegistration && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-950 flex items-start space-x-2.5 mb-5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <strong className="font-bold">NeoPat App Registration Required:</strong> This drive has both a Placement Link and a Visit Link. Please ensure you open the <strong>NeoPat (NeoPad) app</strong> and complete your online registration and profile verification before the drive closing date.
                </div>
              </div>
            )}

            {/* Attachments Section (if any) */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="pt-4 border-t border-gray-200 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Attachments ({message.attachments.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#1A73E8] shrink-0" />
                        <span className="truncate font-medium text-gray-800" title={att.filename}>{att.filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(att)}
                        className="p-1.5 text-[#1A73E8] hover:bg-blue-50 rounded-lg transition shrink-0 ml-2"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* IN LAST: FULL ORIGINAL EMAIL MESSAGE */}
            {/* ========================================================= */}
            <div className="pt-5 border-t border-gray-200 mt-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowRawBody(!showRawBody)}
                  className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#1A73E8] hover:text-blue-800 transition py-2 px-3.5 rounded-xl hover:bg-blue-50 border border-blue-200 shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>{showRawBody ? 'Hide Full Original Email' : 'View Full Original Email Body'}</span>
                  {showRawBody ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRawBody && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(textContent || htmlPlainText);
                        setCopiedBody(true);
                        setTimeout(() => setCopiedBody(false), 2000);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-2xs"
                      title="Copy full email text"
                    >
                      {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBody ? 'Copied' : 'Copy Text'}</span>
                    </button>

                    <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white text-xs shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setRawViewMode('html')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          rawViewMode === 'html' ? 'bg-[#1A73E8] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Formatted (HTML)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRawViewMode('text')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          rawViewMode === 'text' ? 'bg-[#1A73E8] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Plain Text
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showRawBody && (
                <div className="p-4 sm:p-5 bg-[#f8f9fa] border border-gray-200 rounded-2xl animate-in fade-in">
                  {rawViewMode === 'html' && (htmlContent.length > 0) ? (
                    <div 
                      className="email-content-view bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-xs overflow-auto max-h-[600px]"
                      dangerouslySetInnerHTML={{ __html: htmlContent }} 
                    />
                  ) : (
                    <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-gray-900 leading-relaxed overflow-auto max-h-[600px] bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-xs">
                      {textContent || '(No email body content available)'}
                    </pre>
                  )}
                </div>
              )}
            </div>

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
