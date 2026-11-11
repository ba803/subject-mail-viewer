const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');
const demoService = require('../services/demoService');
const { requireAuth } = require('../middleware/authMiddleware');

// All mail routes require authentication (OAuth or Demo)
router.use(requireAuth);

/**
 * Search messages by subject and filters
 */
router.get('/search', async (req, res) => {
  const {
    subject = '',
    sender = '',
    group = '',
    fromDate = '',
    toDate = '',
    source = 'all',
    matchType = 'contains',
    pageToken = null,
    maxResults = 30
  } = req.query;

  try {
    if (req.isDemo) {
      const results = demoService.searchMessages({
        subject,
        sender,
        group,
        fromDate,
        toDate,
        source,
        matchType
      });
      return res.json({
        success: true,
        source: 'demo',
        ...results
      });
    }

    const results = await gmailService.searchMessages(req.tokens, {
      subject,
      sender,
      group,
      fromDate,
      toDate,
      source,
      matchType,
      pageToken,
      maxResults: parseInt(maxResults, 10) || 30
    });

    res.json({
      success: true,
      source: 'gmail_api',
      ...results
    });
  } catch (err) {
    console.error('Search error:', err);
    // Handle expired token or auth errors gracefully
    if (err.code === 401 || (err.message && err.message.includes('invalid_grant'))) {
      return res.status(401).json({
        error: 'Authentication expired',
        message: 'Your Google session has expired. Please sign in again.'
      });
    }

    res.status(500).json({
      error: 'Failed to search messages',
      message: err.message
    });
  }
});

/**
 * Get message details by ID
 */
router.get('/message/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (req.isDemo) {
      const msg = demoService.getMessage(id);
      return res.json({ success: true, message: msg });
    }

    const msg = await gmailService.getMessage(req.tokens, id);
    res.json({ success: true, message: msg });
  } catch (err) {
    console.error('Fetch message error:', err);
    res.status(404).json({ error: 'Message not found', message: err.message });
  }
});

/**
 * Download or stream attachment
 */
router.get('/attachment/:messageId/:attachmentId', async (req, res) => {
  const { messageId, attachmentId } = req.params;
  const { filename = 'attachment' } = req.query;

  try {
    if (req.isDemo) {
      // Return a friendly sample text / PDF byte response
      const sampleContent = Buffer.from(
        `%PDF-1.4\n% Sample PDF for Subject Mail Viewer: ${filename}\n% Document content preview...`
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(sampleContent);
    }

    const attData = await gmailService.getAttachment(req.tokens, messageId, attachmentId);
    if (!attData || !attData.data) {
      return res.status(404).json({ error: 'Attachment data not found' });
    }

    // Gmail API returns base64url format
    const buffer = Buffer.from(attData.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Fetch attachment error:', err);
    res.status(500).json({ error: 'Failed to download attachment', message: err.message });
  }
});

/**
 * Get summary of detected Google Groups
 */
router.get('/groups', async (req, res) => {
  try {
    if (req.isDemo) {
      const groups = demoService.getGroupsSummary();
      return res.json({ success: true, groups });
    }

    // In live mode, search for messages with list-id or Google group headers
    const results = await gmailService.searchMessages(req.tokens, {
      extraQuery: 'list:* OR to:*@googlegroups.com OR cc:*@googlegroups.com',
      maxResults: 50
    });

    const groupMap = new Map();
    results.messages.forEach(msg => {
      if (msg.isGroup && msg.groupDetails) {
        const key = msg.groupDetails.email;
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            name: msg.groupDetails.name,
            email: key,
            listId: msg.groupDetails.listId,
            messageCount: 0,
            latestDate: msg.date,
            latestSubject: msg.subject
          });
        }
        const g = groupMap.get(key);
        g.messageCount += 1;
      }
    });

    res.json({
      success: true,
      groups: Array.from(groupMap.values())
    });
  } catch (err) {
    console.error('Groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups', message: err.message });
  }
});

/**
 * Get dashboard stats for a subject
 */
router.get('/stats', async (req, res) => {
  const { subject = 'Exam' } = req.query;

  try {
    if (req.isDemo) {
      const stats = demoService.getStats(subject);
      return res.json({ success: true, stats });
    }

    // Query Gmail API for messages matching subject
    const searchRes = await gmailService.searchMessages(req.tokens, {
      subject,
      maxResults: 50
    });

    const messages = searchRes.messages || [];
    const gmailCount = messages.filter(m => m.source === 'Gmail').length;
    const groupCount = messages.filter(m => m.source === 'Google Group').length;

    let latestDate = 'N/A';
    if (messages.length > 0) {
      const sorted = [...messages].sort((a, b) => b.internalDate - a.internalDate);
      const d = new Date(sorted[0].internalDate);
      latestDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    res.json({
      success: true,
      stats: {
        matchingMessages: messages.length,
        gmailMessages: gmailCount,
        googleGroupMessages: groupCount,
        latestMessageDate: latestDate,
        subjectFilter: subject,
        totalInboxAnalyzed: searchRes.totalEstimate || messages.length
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

module.exports = router;

