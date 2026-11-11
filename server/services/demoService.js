/**
 * Demo Service provides rich, realistic mock data for testing
 * Campus Recruitment & Placement emails matching Sathyabama Placement & Google Groups
 */

class DemoService {
  constructor() {
    this.demoUser = {
      id: 'demo_user_12345',
      name: 'Engineering Student',
      givenName: 'Student',
      email: 'student.2027@sathyabama.ac.in',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Sathyabama%20Student&backgroundColor=1A73E8,673AB7&textColor=ffffff',
    };

    this.messages = [
      {
        id: 'msg-demo-001',
        threadId: 'th-001',
        subject: "Campus Recruitment through Internship'2027 | CRMIT Solutions ∝ | Registration",
        from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
        to: '2027-Engg <sathyabama-pc-2027-engg@googlegroups.com>',
        cc: '',
        date: 'Tue, 10 Nov 2026 15:25:30 +0530',
        internalDate: new Date('2026-11-10T15:25:30+05:30').getTime(),
        snippet: "Dear Students, Greetings from Sathyabama Placement Cell. CRMIT Solutions is conducting Campus Recruitment through Internship for 2027 Batch. Company Name: CRMIT Solutions...",
        source: 'Google Group',
        isGroup: true,
        groupDetails: {
          name: 'Sathyabama pc 2027 engg',
          email: 'sathyabama-pc-2027-engg@googlegroups.com',
          listId: '<sathyabama-pc-2027-engg.googlegroups.com>',
          listPost: '<mailto:sathyabama-pc-2027-engg@googlegroups.com>',
          detectedVia: 'List-Id'
        },
        hasAttachments: true,
        attachments: [
          {
            attachmentId: 'att-demo-001',
            filename: 'CRMIT_CX Cloud Developer_Trainee_JD.docx.pdf',
            mimeType: 'application/pdf',
            size: 133734, // 130.6 KB
            messageId: 'msg-demo-001'
          }
        ],
        eligibilityCriteria: {
          'Company Name': 'CRMIT Solutions',
          'Venue': 'Online Assessment / Campus',
          'Eligible branches': 'B.E / B.Tech - CSE, IT, AI&DS, ECE, EEE',
          'Eligibility': '(1) A Minimum of 60% or 6 CGPA in the present degree.\n(2) No standing Arrears',
          'Internship Stipend': '15 k/month',
          'CTC': '5.5 LPA - 7.0 LPA',
          'Role': 'Cloud Developer Trainee'
        },
        textBody: `Dear Students,

Greetings from Sathyabama Placement Cell!

CRMIT Solutions has announced its Campus Recruitment through Internship'2027 drive for our engineering students.

Eligibility Criteria:
Company Name        : CRMIT Solutions
Date                : Will be Communicated Later
Venue               : Online Assessment / Campus
Eligible branches   : B.E / B.Tech - CSE, IT, AI&DS, ECE, EEE
Eligibility         : (1) A Minimum of 60% or 6 CGPA in the present degree.
                      (2) No standing Arrears
Internship Stipend  : 15 k/month
CTC                 : 5.5 LPA - 7.0 LPA

Registration Links:
Placement link: https://placement.sathyabama.ac.in/apply/crmit-2027
Visit: https://neopat.in/login
Company link: https://crmit.com

Please review the attached Job Description (JD) and register before the deadline.

Best Regards,
Placement Office
Sathyabama Institute of Science and Technology`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear Students,</p>
            <p>Greetings from <strong>Sathyabama Placement Cell</strong>!</p>
            <p>CRMIT Solutions is conducting <strong>Campus Recruitment through Internship'2027</strong> for engineering students.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e0e0e0;">
              <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; width: 35%;">Company Name</td><td style="padding: 8px;">CRMIT Solutions</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">Will be Communicated Later</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">Online Assessment / Campus</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Eligible branches</td><td style="padding: 8px;">B.E / B.Tech - CSE, IT, AI&DS, ECE, EEE</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Eligibility</td><td style="padding: 8px;">(1) A Minimum of 60% or 6 CGPA in the present degree.<br/>(2) No standing Arrears</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Internship Stipend</td><td style="padding: 8px; color: #166534; font-weight: bold;">15 k/month</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">CTC</td><td style="padding: 8px; color: #1e40af; font-weight: bold;">5.5 LPA - 7.0 LPA</td></tr>
            </table>

            <div style="margin: 16px 0; padding: 12px; background: #e8f0fe; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>Company link:</strong> <a href="https://crmit.com" style="color: #1A73E8;">https://crmit.com</a></p>
              <p style="margin: 4px 0;"><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in/apply/crmit-2027" style="color: #1A73E8;">https://placement.sathyabama.ac.in/apply/crmit-2027</a></p>
              <p style="margin: 4px 0;"><strong>Visit:</strong> <a href="https://neopat.in/login" style="color: #1A73E8;">https://neopat.in/login</a></p>
            </div>

            <p>Best regards,<br/><strong>Sathyabama Placement Cell</strong></p>
          </div>
        `,
        labels: ['INBOX', 'IMPORTANT']
      },
      {
        id: 'msg-demo-002',
        threadId: 'th-002',
        subject: "Campus Recruitment Drive'2027 | Trikaal Tech Enterprises | Registration",
        from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
        to: '2027-Engg <Sathyabama-2027-Engg@googlegroups.com>',
        cc: '',
        date: 'Mon, 09 Nov 2026 11:15:00 +0530',
        internalDate: new Date('2026-11-09T11:15:00+05:30').getTime(),
        snippet: "Company Name : Trikaal Tech Enterprises. Date : Will be Communicated Later. Venue : Will be Communicated Later. Eligible branches : M.E/M.Tech - Structural Engineering...",
        source: 'Google Group',
        isGroup: true,
        groupDetails: {
          name: 'Sathyabama-2027-Engg',
          email: 'Sathyabama-2027-Engg@googlegroups.com',
          listId: '<Sathyabama-2027-Engg.googlegroups.com>',
          listPost: '<mailto:Sathyabama-2027-Engg@googlegroups.com>',
          detectedVia: 'List-Id'
        },
        hasAttachments: true,
        attachments: [
          {
            attachmentId: 'att-demo-002',
            filename: 'Trikaal_Tech_Enterprises_JD.pdf',
            mimeType: 'application/pdf',
            size: 194500,
            messageId: 'msg-demo-002'
          }
        ],
        eligibilityCriteria: {
          'Company Name': 'Trikaal Tech Enterprises',
          'Venue': 'Will be Communicated Later',
          'Eligible branches': 'M.E/M.Tech - Structural Engineering',
          'Eligibility': '(1) A Minimum of 60% or 6 CGPA in the present degree.\n(2) No standing Arrears',
          'Internship Stipend': '10 k/month',
          'CTC': '3.6 LPA'
        },
        textBody: `Dear Students,

Campus Recruitment Notification:

Company Name        : Trikaal Tech Enterprises
Date                : Will be Communicated Later
Venue               : Will be Communicated Later
Eligible branches   : M.E/M.Tech - Structural Engineering
Eligibility         : (1) A Minimum of 60% or 6 CGPA in the present degree.
                      (2) No standing Arrears 
Internship Stipend  : 10 k/month
CTC                 : 3.6 LPA

Registration Details:
Placement link: https://placement.sathyabama.ac.in/trikaal-tech
Visit: https://neopat.in/app
Company link: https://trikaaltech.com

Eligible candidates must complete their registration before the link closes.

Placement Cell
Sathyabama Institute of Science and Technology`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
            <p>Dear Students,</p>
            <p>Please find the eligibility details for <strong>Trikaal Tech Enterprises</strong> below:</p>
            
            <p><strong>Company Name</strong> : Trikaal Tech Enterprises</p>
            <p><strong>Date</strong> : Will be Communicated Later</p>
            <p><strong>Venue</strong> : Will be Communicated Later</p>
            <p><strong>Eligible branches</strong> : M.E/M.Tech - Structural Engineering</p>
            <p><strong>Eligibility</strong> : (1) A Minimum of 60% or 6 CGPA in the present degree.<br/>(2) No standing Arrears</p>
            <p><strong>Internship Stipend</strong> : 10 k/month</p>
            <p><strong>CTC</strong> : 3.6 LPA</p>

            <div style="margin: 16px 0; padding: 12px; background: #fef7e0; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in/trikaal-tech">https://placement.sathyabama.ac.in/trikaal-tech</a></p>
              <p style="margin: 4px 0;"><strong>Visit:</strong> <a href="https://neopat.in/app">https://neopat.in/app</a></p>
            </div>

            <p>Placement Cell</p>
          </div>
        `,
        labels: ['INBOX']
      },
      {
        id: 'msg-demo-003',
        threadId: 'th-003',
        subject: 'Online Test Link & Schedule | Campus Recruitment 2027',
        from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
        to: '2027-Engg <sathyabama-pc-2027-engg@googlegroups.com>',
        cc: '',
        date: 'Sun, 08 Nov 2026 09:30:00 +0530',
        internalDate: new Date('2026-11-08T09:30:00+05:30').getTime(),
        snippet: 'Online Test Details: Company Name: Hexaware Technologies. Date: Saturday, Nov 15, 2026 at 10:00 AM. Venue: Online Assessment (NeoPat Platform)...',
        source: 'Google Group',
        isGroup: true,
        groupDetails: {
          name: 'Sathyabama pc 2027 engg',
          email: 'sathyabama-pc-2027-engg@googlegroups.com',
          listId: '<sathyabama-pc-2027-engg.googlegroups.com>',
          listPost: '<mailto:sathyabama-pc-2027-engg@googlegroups.com>',
          detectedVia: 'List-Id'
        },
        hasAttachments: false,
        attachments: [],
        eligibilityCriteria: {
          'Company Name': 'Hexaware Technologies',
          'Venue': 'Online Assessment (NeoPat Platform)',
          'Eligible branches': 'All Circuit Branches (CSE, IT, AI&DS, ECE, EEE)',
          'Eligibility': '60% throughout 10th, 12th, and UG with no standing arrears',
          'Internship Stipend': '12 k/month',
          'CTC': '4.0 LPA - 6.0 LPA'
        },
        textBody: `Dear Candidates,

The Online Test schedule and link for Hexaware Technologies has been finalized:

Company Name        : Hexaware Technologies
Date                : Saturday, Nov 15, 2026, 10:00 AM
Venue               : Online Assessment (NeoPat Platform)
Eligible branches   : All Circuit Branches (CSE, IT, AI&DS, ECE, EEE)
Eligibility         : 60% throughout 10th, 12th, and UG with no standing arrears
Internship Stipend  : 12 k/month
CTC                 : 4.0 LPA - 6.0 LPA

Assessment Links:
Online Test link: https://assessment.neopat.in/exam/hexaware-2027
Placement link: https://placement.sathyabama.ac.in
Visit: https://neopat.in

Keep your webcam enabled and join 15 minutes prior to start time.

Placement Cell`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
            <p>Dear Candidates,</p>
            <p>The <strong>Online Test</strong> schedule for <strong>Hexaware Technologies</strong>:</p>
            <ul>
              <li><strong>Company Name:</strong> Hexaware Technologies</li>
              <li><strong>Date:</strong> Saturday, Nov 15, 2026, 10:00 AM</li>
              <li><strong>Venue:</strong> Online Assessment (NeoPat Platform)</li>
              <li><strong>Eligible branches:</strong> All Circuit Branches (CSE, IT, AI&DS, ECE, EEE)</li>
              <li><strong>CTC:</strong> 4.0 LPA - 6.0 LPA</li>
            </ul>
            <div style="padding: 12px; background: #e8f0fe; border-radius: 8px;">
              <p><strong>Online Test link:</strong> <a href="https://assessment.neopat.in/exam/hexaware-2027">https://assessment.neopat.in/exam/hexaware-2027</a></p>
              <p><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in">https://placement.sathyabama.ac.in</a></p>
              <p><strong>Visit:</strong> <a href="https://neopat.in">https://neopat.in</a></p>
            </div>
          </div>
        `,
        labels: ['INBOX', 'IMPORTANT']
      },
      {
        id: 'msg-demo-004',
        threadId: 'th-004',
        subject: 'Campus Recruitment 2027: Technical Interview Shortlist & Schedule',
        from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
        to: 'student.2027@sathyabama.ac.in',
        cc: '',
        date: 'Sat, 07 Nov 2026 14:00:00 +0530',
        internalDate: new Date('2026-11-07T14:00:00+05:30').getTime(),
        snippet: 'Congratulations! You have been shortlisted for the Round 2 Technical Interview for Zoho Corporation. Company Name: Zoho Corporation. Date: Wednesday, Nov 18...',
        source: 'Gmail',
        isGroup: false,
        groupDetails: null,
        hasAttachments: true,
        attachments: [
          {
            attachmentId: 'att-demo-003',
            filename: 'Zoho_Shortlisted_Students_SlotList.pdf',
            mimeType: 'application/pdf',
            size: 215400,
            messageId: 'msg-demo-004'
          }
        ],
        eligibilityCriteria: {
          'Company Name': 'Zoho Corporation',
          'Venue': 'Placement Cell - Interview Suites (Block 3)',
          'Eligible branches': 'B.E / B.Tech (All Branches)',
          'Eligibility': 'Cleared Round 1 Online Aptitude & Coding Test',
          'CTC': '6.0 LPA - 8.5 LPA'
        },
        textBody: `Dear Student,

Congratulations! You have cleared Round 1 and are shortlisted for Zoho Corporation Technical Interview:

Company Name        : Zoho Corporation
Date                : Wednesday, Nov 18, 2026, 09:30 AM
Venue               : Placement Cell - Interview Suites (Block 3)
Eligible branches   : B.E / B.Tech (All Branches)
Eligibility         : Cleared Round 1 Online Aptitude & Coding Test
CTC                 : 6.0 LPA - 8.5 LPA

Important Links:
Placement link: https://placement.sathyabama.ac.in/zoho-shortlist
Company link: https://www.zoho.com/careers
Visit: https://portal.sathyabama.ac.in

Please be present in formal attire with 2 hard copies of your resume.

Placement Office`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
            <p>Dear Student,</p>
            <p>Congratulations on being shortlisted for <strong>Zoho Corporation</strong>!</p>
            <p><strong>Company Name:</strong> Zoho Corporation<br/>
            <strong>Date:</strong> Wednesday, Nov 18, 2026, 09:30 AM<br/>
            <strong>Venue:</strong> Placement Cell - Interview Suites (Block 3)<br/>
            <strong>CTC:</strong> 6.0 LPA - 8.5 LPA</p>
            <p>Placement link: <a href="https://placement.sathyabama.ac.in/zoho-shortlist">https://placement.sathyabama.ac.in/zoho-shortlist</a></p>
            <p>Company link: <a href="https://www.zoho.com/careers">https://www.zoho.com/careers</a></p>
          </div>
        `,
        labels: ['INBOX', 'IMPORTANT']
      },
      {
        id: 'msg-demo-005',
        threadId: 'th-005',
        subject: "Online Test Instructions & Slot Booking | Cognizant Campus Recruitment 2027",
        from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
        to: '2027-Engg <Sathyabama-2027-Engg@googlegroups.com>',
        cc: '',
        date: 'Fri, 06 Nov 2026 16:20:00 +0530',
        internalDate: new Date('2026-11-06T16:20:00+05:30').getTime(),
        snippet: "Slot booking is now live for Cognizant GenC & GenC Next Online Assessment. Company Name: Cognizant Technology Solutions. CTC: 4.5 LPA to 7.0 LPA...",
        source: 'Google Group',
        isGroup: true,
        groupDetails: {
          name: 'Sathyabama-2027-Engg',
          email: 'Sathyabama-2027-Engg@googlegroups.com',
          listId: '<Sathyabama-2027-Engg.googlegroups.com>',
          listPost: '<mailto:Sathyabama-2027-Engg@googlegroups.com>',
          detectedVia: 'List-Id'
        },
        hasAttachments: false,
        attachments: [],
        eligibilityCriteria: {
          'Company Name': 'Cognizant Technology Solutions',
          'Venue': 'Virtual Proctored Assessment',
          'Eligible branches': 'B.E / B.Tech - All Engineering Disciplines',
          'Eligibility': '60% throughout 10th, 12th, and UG, Max 1 standing arrear permitted at application',
          'CTC': '4.5 LPA - 7.0 LPA'
        },
        textBody: `Dear Students,

Cognizant Campus Recruitment 2027 Slot Booking:

Company Name        : Cognizant Technology Solutions
Date                : Nov 20 to Nov 22, 2026 (Multiple Slots)
Venue               : Virtual Proctored Assessment
Eligible branches   : B.E / B.Tech - All Engineering Disciplines
Eligibility         : 60% throughout 10th, 12th, and UG, Max 1 standing arrear permitted at application
CTC                 : 4.5 LPA - 7.0 LPA

Useful Links:
Placement link: https://placement.sathyabama.ac.in/cognizant-booking
Visit: https://neopat.in/cognizant-prep
Company link: https://careers.cognizant.com

Best wishes,
Sathyabama Placement Cell`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
            <p>Dear Students,</p>
            <p>Slot booking is live for <strong>Cognizant Campus Recruitment 2027</strong>.</p>
            <p><strong>Company Name:</strong> Cognizant Technology Solutions<br/>
            <strong>CTC:</strong> 4.5 LPA - 7.0 LPA</p>
            <p>Placement link: <a href="https://placement.sathyabama.ac.in/cognizant-booking">https://placement.sathyabama.ac.in/cognizant-booking</a></p>
            <p>Visit: <a href="https://neopat.in/cognizant-prep">https://neopat.in/cognizant-prep</a></p>
          </div>
        `,
        labels: ['INBOX']
      }
    ];
  }

  getDemoUser() {
    return this.demoUser;
  }

  searchMessages(filters = {}) {
    let filtered = [...this.messages];

    // Subject filter
    if (filters.subject && filters.subject.trim()) {
      const searchSub = filters.subject.trim().toLowerCase();
      const matchType = filters.matchType || 'contains';

      filtered = filtered.filter(msg => {
        const msgSub = (msg.subject || '').toLowerCase();
        if (matchType === 'exact') {
          return msgSub === searchSub;
        } else if (matchType === 'starts_with') {
          return msgSub.startsWith(searchSub);
        } else {
          return msgSub.includes(searchSub);
        }
      });
    }

    // Sender filter
    if (filters.sender && filters.sender.trim()) {
      const senderTerm = filters.sender.trim().toLowerCase();
      filtered = filtered.filter(msg => (msg.from || '').toLowerCase().includes(senderTerm));
    }

    // Group filter
    if (filters.group && filters.group.trim()) {
      const groupTerm = filters.group.trim().toLowerCase();
      filtered = filtered.filter(msg => {
        const toMatch = (msg.to || '').toLowerCase().includes(groupTerm);
        const ccMatch = (msg.cc || '').toLowerCase().includes(groupTerm);
        const groupEmailMatch = msg.groupDetails && msg.groupDetails.email.toLowerCase().includes(groupTerm);
        return toMatch || ccMatch || groupEmailMatch;
      });
    }

    // Date From filter
    if (filters.fromDate) {
      const fromTime = new Date(filters.fromDate).getTime();
      filtered = filtered.filter(msg => msg.internalDate >= fromTime);
    }

    // Date To filter
    if (filters.toDate) {
      const toTime = new Date(filters.toDate).getTime() + 86400000;
      filtered = filtered.filter(msg => msg.internalDate <= toTime);
    }

    // Source filter
    if (filters.source && filters.source !== 'all') {
      if (filters.source === 'gmail') {
        filtered = filtered.filter(msg => msg.source === 'Gmail');
      } else if (filters.source === 'group') {
        filtered = filtered.filter(msg => msg.source === 'Google Group');
      }
    }

    return {
      messages: filtered,
      nextPageToken: null,
      totalEstimate: filtered.length,
      queryUsed: `demo: ${JSON.stringify(filters)}`
    };
  }

  getMessage(id) {
    const msg = this.messages.find(m => m.id === id);
    if (!msg) throw new Error('Message not found');
    return msg;
  }

  getGroupsSummary() {
    const groupMap = new Map();

    this.messages.forEach(msg => {
      if (msg.isGroup && msg.groupDetails) {
        const email = msg.groupDetails.email;
        if (!groupMap.has(email)) {
          groupMap.set(email, {
            name: msg.groupDetails.name,
            email: email,
            listId: msg.groupDetails.listId,
            messageCount: 0,
            latestDate: msg.date,
            latestSubject: msg.subject
          });
        }
        const group = groupMap.get(email);
        group.messageCount += 1;
      }
    });

    return Array.from(groupMap.values());
  }

  getStats(currentSubject = 'Campus Recruitment') {
    const matching = this.searchMessages({ subject: currentSubject });
    const allMatching = matching.messages;
    const gmailCount = allMatching.filter(m => m.source === 'Gmail').length;
    const groupCount = allMatching.filter(m => m.source === 'Google Group').length;

    let latestDate = 'N/A';
    if (allMatching.length > 0) {
      const latestMsg = [...allMatching].sort((a, b) => b.internalDate - a.internalDate)[0];
      const d = new Date(latestMsg.internalDate);
      latestDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return {
      matchingMessages: allMatching.length,
      gmailMessages: gmailCount,
      googleGroupMessages: groupCount,
      latestMessageDate: latestDate,
      subjectFilter: currentSubject,
      totalInboxAnalyzed: this.messages.length
    };
  }

  setCustomUser(email, name) {
    const cleanEmail = email && email.trim() ? email.trim() : 'student@sathyabama.ac.in';
    const cleanName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    const givenName = cleanName.split(' ')[0];

    this.demoUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      givenName: givenName,
      email: cleanEmail,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=1A73E8,673AB7&textColor=ffffff`,
    };

    this.messages.forEach(msg => {
      if (msg.source === 'Gmail') {
        msg.to = cleanEmail;
      }
    });

    return this.demoUser;
  }
}

module.exports = new DemoService();
