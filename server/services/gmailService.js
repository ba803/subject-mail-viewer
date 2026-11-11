const { google } = require('googleapis');
const googleAuthService = require('./googleAuthService');

class GmailService {
  /**
   * Helper to extract header value case-insensitively
   */
  getHeader(headers, name) {
    if (!headers || !Array.isArray(headers)) return '';
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  }

  /**
   * Build Gmail API search query from parameters
   */
  buildGmailQuery({ subject, sender, group, fromDate, toDate, extraQuery }) {
    const parts = [];

    if (subject && subject.trim()) {
      // Gmail search query for subject
      const cleanSub = subject.trim();
      parts.push(`subject:(${cleanSub})`);
    }

    if (sender && sender.trim()) {
      parts.push(`from:(${sender.trim()})`);
    }

    if (group && group.trim()) {
      // Could be in to, list, or delivered-to
      const cleanGroup = group.trim();
      parts.push(`(to:(${cleanGroup}) OR list:(${cleanGroup}) OR cc:(${cleanGroup}))`);
    }

    if (fromDate) {
      // Format YYYY/MM/DD or YYYY-MM-DD
      const formatted = fromDate.replace(/-/g, '/');
      parts.push(`after:${formatted}`);
    }

    if (toDate) {
      const formatted = toDate.replace(/-/g, '/');
      parts.push(`before:${formatted}`);
    }

    if (extraQuery && extraQuery.trim()) {
      parts.push(extraQuery.trim());
    }

    return parts.join(' ');
  }

  /**
   * Inspect headers to determine whether an email originated from a Google Group / mailing list
   */
  detectMessageSource(headers, toHeader = '', ccHeader = '') {
    const listId = this.getHeader(headers, 'List-Id');
    const listPost = this.getHeader(headers, 'List-Post');
    const listUnsubscribe = this.getHeader(headers, 'List-Unsubscribe');
    const xGoogleLoop = this.getHeader(headers, 'X-Google-Loop');
    const xGoogleGroupId = this.getHeader(headers, 'X-Google-Group-Id');
    const mailingList = this.getHeader(headers, 'Mailing-list');
    const xBeenThere = this.getHeader(headers, 'X-BeenThere');
    const deliveredTo = this.getHeader(headers, 'Delivered-To');

    const isGroup = Boolean(
      listId ||
      listPost ||
      xGoogleLoop ||
      xGoogleGroupId ||
      mailingList ||
      xBeenThere ||
      (listUnsubscribe && listUnsubscribe.includes('groups.google.com')) ||
      (toHeader && (toHeader.includes('@googlegroups.com') || toHeader.includes('group'))) ||
      (ccHeader && ccHeader.includes('@googlegroups.com'))
    );

    let groupEmail = '';
    let groupName = '';

    if (listPost) {
      // E.g. <mailto:students@college.edu>
      const match = listPost.match(/<mailto:([^>]+)>/i);
      if (match) groupEmail = match[1];
    }

    if (!groupEmail && listId) {
      // E.g. "College Students <students.college.edu>" or "<students.college.edu>"
      const matchEmail = listId.match(/<([^>]+)>/);
      const matchName = listId.match(/^([^<]+)/);
      if (matchEmail) {
        groupEmail = matchEmail[1].replace(/\./g, '@', 1); // approximate or raw
        if (!groupEmail.includes('@')) groupEmail = matchEmail[1];
      }
      if (matchName) groupName = matchName[1].trim().replace(/"/g, '');
    }

    if (!groupEmail && xBeenThere) {
      groupEmail = xBeenThere.trim();
    }

    if (!groupEmail && deliveredTo && deliveredTo.includes('group')) {
      groupEmail = deliveredTo.trim();
    }

    if (!groupName && groupEmail) {
      const prefix = groupEmail.split('@')[0];
      groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[-_.]/g, ' ');
    }

    return {
      source: isGroup ? 'Google Group' : 'Gmail',
      isGroup,
      groupDetails: isGroup ? {
        name: groupName || (groupEmail ? groupEmail.split('@')[0] : 'Google Group'),
        email: groupEmail || toHeader || 'Google Group Mailing List',
        listId: listId || null,
        listPost: listPost || null,
        detectedVia: listId ? 'List-Id' : (xGoogleLoop ? 'X-Google-Loop' : (listPost ? 'List-Post' : 'Headers'))
      } : null
    };
  }

  /**
   * Recursively extract message parts (HTML, Plain text, Attachments)
   */
  parseMessageParts(payload, messageId) {
    let textBody = '';
    let htmlBody = '';
    const attachments = [];

    const traverse = (part) => {
      if (!part) return;

      const mimeType = (part.mimeType || '').toLowerCase();
      const filename = part.filename || '';
      const body = part.body || {};

      // If it's an attachment
      if (filename && (body.attachmentId || part.headers)) {
        attachments.push({
          attachmentId: body.attachmentId || null,
          filename: filename,
          mimeType: mimeType || 'application/octet-stream',
          size: body.size || 0,
          messageId: messageId
        });
      }

      // If it's inline text or html
      if (body.data) {
        const decoded = Buffer.from(body.data, 'base64').toString('utf8');
        if (mimeType === 'text/plain' && !textBody) {
          textBody = decoded;
        } else if (mimeType === 'text/html' && !htmlBody) {
          htmlBody = decoded;
        }
      }

      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(traverse);
      }
    };

    traverse(payload);

    return {
      textBody,
      htmlBody: htmlBody || (textBody ? `<pre style="white-space: pre-wrap; font-family: sans-serif;">${textBody}</pre>` : ''),
      attachments
    };
  }

  /**
   * Search messages matching filters
   */
  async searchMessages(tokens, filters = {}) {
    const auth = googleAuthService.getAuthenticatedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    const query = this.buildGmailQuery(filters);
    const maxResults = Math.min(filters.maxResults || 25, 50);

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query || undefined,
      maxResults: maxResults,
      pageToken: filters.pageToken || undefined,
      includeSpamTrash: false
    });

    const messageRefs = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken || null;
    const resultSizeEstimate = listRes.data.resultSizeEstimate || 0;

    if (messageRefs.length === 0) {
      return {
        messages: [],
        nextPageToken: null,
        totalEstimate: 0,
        queryUsed: query
      };
    }

    // Retrieve details for matching messages
    const messagePromises = messageRefs.map(async (ref) => {
      try {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: ref.id,
          format: 'full'
        });
        return this.formatMessage(msgRes.data);
      } catch (err) {
        console.warn(`Failed to fetch message ${ref.id}:`, err.message);
        return null;
      }
    });

    let messages = (await Promise.all(messagePromises)).filter(Boolean);

    // Apply strict subject filter if requested
    if (filters.subject && filters.subject.trim()) {
      const searchSub = filters.subject.trim().toLowerCase();
      const matchType = filters.matchType || 'contains'; // 'contains', 'exact', 'starts_with'

      messages = messages.filter(msg => {
        const msgSub = (msg.subject || '').toLowerCase();
        if (matchType === 'exact') {
          return msgSub === searchSub;
        } else if (matchType === 'starts_with') {
          return msgSub.startsWith(searchSub);
        } else {
          // 'contains' (case-insensitive partial)
          return msgSub.includes(searchSub);
        }
      });
    }

    // Filter by source if requested: 'all', 'gmail', 'group'
    if (filters.source && filters.source !== 'all') {
      if (filters.source === 'gmail') {
        messages = messages.filter(m => m.source === 'Gmail');
      } else if (filters.source === 'group') {
        messages = messages.filter(m => m.source === 'Google Group');
      }
    }

    return {
      messages,
      nextPageToken,
      totalEstimate: resultSizeEstimate,
      queryUsed: query
    };
  }

  /**
   * Automatically extracts Eligibility Criteria key-value pairs from placement emails
   */
  extractEligibilityCriteria(textBody = '', htmlBody = '') {
    let text = textBody || '';
    if (!text && htmlBody) {
      text = htmlBody
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
   * Automatically extracts URLs and their corresponding labels from the email body
   */
  extractLinks(textBody = '', htmlBody = '') {
    const linksMap = new Map();
    const fullText = `${textBody || ''}\n${(htmlBody || '').replace(/<[^>]*>/g, ' ')}`;

    // Pattern 1: Label : https://...
    const labeledRegex = /([a-zA-Z0-9\s_-]{2,35})\s*:\s*(https?:\/\/[^\s<>"'\)]+)/gi;
    let match;
    while ((match = labeledRegex.exec(fullText)) !== null) {
      const rawLabel = match[1].trim();
      const url = match[2].trim().replace(/[.,;!?]+$/, '');

      if (!/^(from|to|cc|bcc|date|subject|sent|reply-to|message-id|http|https)$/i.test(rawLabel)) {
        const cleanLabel = rawLabel
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .split(' ')
          .slice(-3)
          .join(' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        linksMap.set(url, cleanLabel);
      }
    }

    // Pattern 2: HTML <a> tags href
    if (htmlBody) {
      const anchorRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
      while ((match = anchorRegex.exec(htmlBody)) !== null) {
        const url = match[1].trim().replace(/[.,;!?]+$/, '');
        let label = match[2].replace(/<[^>]*>/g, '').trim();

        if (!linksMap.has(url)) {
          if (!label || label.startsWith('http') || label.length > 35) {
            try {
              const u = new URL(url);
              label = u.hostname.replace(/^www\./, '');
            } catch {
              label = 'Website Link';
            }
          }
          linksMap.set(url, label.slice(0, 30));
        }
      }
    }

    // Pattern 3: Standalone URLs
    const urlRegex = /(https?:\/\/[^\s<>"'\)]+)/gi;
    while ((match = urlRegex.exec(fullText)) !== null) {
      const url = match[1].trim().replace(/[.,;!?]+$/, '');
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
        if (u.includes('groups.google.com') || u.includes('googlegroups.com')) return false;
        if (l.includes('google group') || l.includes('unsubscribe') || u.includes('unsubscribe')) return false;
        return true;
      });
  }

  /**
   * Format Gmail raw message into clean Subject Mail Viewer message object
   */
  formatMessage(rawMessage) {
    const payload = rawMessage.payload || {};
    const headers = payload.headers || [];

    const subject = this.getHeader(headers, 'Subject') || '(No Subject)';
    const from = this.getHeader(headers, 'From');
    const to = this.getHeader(headers, 'To');
    const cc = this.getHeader(headers, 'Cc');
    const date = this.getHeader(headers, 'Date');
    const messageIdHeader = this.getHeader(headers, 'Message-ID');

    const internalDate = rawMessage.internalDate
      ? parseInt(rawMessage.internalDate, 10)
      : Date.parse(date) || Date.now();

    const { source, isGroup, groupDetails } = this.detectMessageSource(headers, to, cc);
    const { textBody, htmlBody, attachments } = this.parseMessageParts(payload, rawMessage.id);
    const eligibilityCriteria = this.extractEligibilityCriteria(textBody, htmlBody);
    const links = this.extractLinks(textBody, htmlBody);

    return {
      id: rawMessage.id,
      threadId: rawMessage.threadId,
      snippet: rawMessage.snippet || '',
      subject,
      from,
      to,
      cc,
      date,
      internalDate,
      source,
      isGroup,
      groupDetails,
      textBody,
      htmlBody,
      hasAttachments: attachments.length > 0,
      attachments,
      eligibilityCriteria,
      links,
      labels: rawMessage.labelIds || []
    };
  }

  /**
   * Get single message by ID
   */
  async getMessage(tokens, id) {
    const auth = googleAuthService.getAuthenticatedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'full'
    });

    return this.formatMessage(msgRes.data);
  }

  /**
   * Download attachment
   */
  async getAttachment(tokens, messageId, attachmentId) {
    const auth = googleAuthService.getAuthenticatedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId
    });

    return res.data;
  }
}

module.exports = new GmailService();

