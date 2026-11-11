/**
 * Client-Side Demo Dataset Fallback
 * Ensures GitHub Pages is immediately interactive even before the cloud backend is deployed!
 */

export const clientDemoUser = {
  id: 'demo_user_12345',
  name: 'Engineering Student',
  givenName: 'Student',
  email: 'student.2027@sathyabama.ac.in',
  picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Sathyabama%20Student&backgroundColor=1A73E8,673AB7&textColor=ffffff',
};

export const clientDemoMessages = [
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
        size: 133734,
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
    links: [
      { label: 'Placement link', url: 'https://placement.sathyabama.ac.in/apply/crmit-2027' },
      { label: 'Visit', url: 'https://neopat.in/login' },
      { label: 'Company link', url: 'https://crmit.com' }
    ],
    textBody: `Dear Students,

Greetings from Sathyabama Placement Cell!

CRMIT Solutions has announced its Campus Recruitment through Internship'2027 drive for our engineering students.

Eligibility Criteria:
Company Name        : CRMIT Solutions
Venue               : Online Assessment / Campus
Eligible branches   : B.E / B.Tech - CSE, IT, AI&DS, ECE, EEE
Eligibility         : (1) A Minimum of 60% or 6 CGPA in the present degree.
                      (2) No standing Arrears
Internship Stipend  : 15 k/month
CTC                 : 5.5 LPA - 7.0 LPA

Registration:
All the eligible & interested students are requested to register in the Placement link below on or before 01.00 PM - 14.11.2026.

Registration Links:
Placement link: https://placement.sathyabama.ac.in/apply/crmit-2027
Visit: https://neopat.in/login
Company link: https://crmit.com

Please review the attached Job Description (JD) and register before the deadline.

Best Regards,
Placement Office
Sathyabama Institute of Science and Technology`,
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p>Dear Students,</p>
<p>Greetings from <strong>Sathyabama Placement Cell</strong>!</p>
<p>CRMIT Solutions is conducting <strong>Campus Recruitment through Internship'2027</strong> for engineering students.</p>
<p><strong>Company Name:</strong> CRMIT Solutions<br/>
<strong>Venue:</strong> Online Assessment / Campus<br/>
<strong>Eligible branches:</strong> B.E / B.Tech - CSE, IT, AI&DS, ECE, EEE<br/>
<strong>Eligibility:</strong> (1) A Minimum of 60% or 6 CGPA in present degree. (2) No standing Arrears<br/>
<strong>Internship Stipend:</strong> 15 k/month<br/>
<strong>CTC:</strong> 5.5 LPA - 7.0 LPA</p>
<p style="background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; border-radius: 4px;">
<strong>Registration:</strong><br/>
All the eligible & interested students are requested to register in the Placement link below on or before 01.00 PM - 14.11.2026.
</p>
<p>Placement link: <a href="https://placement.sathyabama.ac.in/apply/crmit-2027">https://placement.sathyabama.ac.in/apply/crmit-2027</a><br/>
Visit: <a href="https://neopat.in/login">https://neopat.in/login</a><br/>
Company link: <a href="https://crmit.com">https://crmit.com</a></p>
</div>`,
    labels: ['INBOX', 'IMPORTANT']
  },
  {
    id: 'msg-demo-002',
    threadId: 'th-002',
    subject: "Campus Recruitment Notification | Trikaal Tech Enterprises",
    from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
    to: 'Structural Engg Batch 2027 <student.2027@sathyabama.ac.in>',
    cc: '',
    date: 'Mon, 09 Nov 2026 11:15:00 +0530',
    internalDate: new Date('2026-11-09T11:15:00+05:30').getTime(),
    snippet: "Company Name: Trikaal Tech Enterprises. Eligible branches: M.E/M.Tech - Structural Engineering. Eligibility: (1) Minimum 60% or 6 CGPA...",
    source: 'Gmail',
    isGroup: false,
    groupDetails: null,
    hasAttachments: true,
    attachments: [
      {
        attachmentId: 'att-demo-002',
        filename: 'Trikaal_Tech_Structural_JD.pdf',
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
    links: [
      { label: 'Company link', url: 'https://trikaaltech.com' },
      { label: 'Placement link', url: 'https://placement.sathyabama.ac.in/trikaal-tech-2027' },
      { label: 'Visit', url: 'https://neopat.in/student' }
    ],
    textBody: `Dear Students,

Campus Recruitment Notification:
Company Name        : Trikaal Tech Enterprises
Venue               : Will be Communicated Later
Eligible branches   : M.E/M.Tech - Structural Engineering
Eligibility         : (1) A Minimum of 60% or 6 CGPA in the present degree.
                      (2) No standing Arrears 
Internship Stipend  : 10 k/month
CTC                 : 3.6 LPA

Registration:
All the eligible & interested students are requested to register in the Placement link below on or before 05.00 PM - 13.11.2026.

Links:
Company link: https://trikaaltech.com
Placement link: https://placement.sathyabama.ac.in/trikaal-tech-2027
Visit: https://neopat.in/student`,
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p>Campus Recruitment Notification from <strong>Trikaal Tech Enterprises</strong>.</p>
<p><strong>Company Name:</strong> Trikaal Tech Enterprises<br/>
<strong>Eligible branches:</strong> M.E/M.Tech - Structural Engineering<br/>
<strong>Internship Stipend:</strong> 10 k/month<br/>
<strong>CTC:</strong> 3.6 LPA</p>
<p style="background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; border-radius: 4px;">
<strong>Registration:</strong><br/>
All the eligible & interested students are requested to register in the Placement link below on or before 05.00 PM - 13.11.2026.
</p>
<p>Company link: <a href="https://trikaaltech.com">https://trikaaltech.com</a><br/>
Placement link: <a href="https://placement.sathyabama.ac.in/trikaal-tech-2027">https://placement.sathyabama.ac.in/trikaal-tech-2027</a><br/>
Visit: <a href="https://neopat.in/student">https://neopat.in/student</a></p>
</div>`,
    labels: ['INBOX']
  },
  {
    id: 'msg-demo-003',
    threadId: 'th-003',
    subject: "Online Test Schedule & Instructions | Hexaware Technologies Campus Recruitment",
    from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
    to: '2027-Engg <sathyabama-pc-2027-engg@googlegroups.com>',
    cc: '',
    date: 'Sun, 08 Nov 2026 14:00:00 +0530',
    internalDate: new Date('2026-11-08T14:00:00+05:30').getTime(),
    snippet: "Hexaware Technologies Online Assessment has been scheduled on the NeoPat platform. Company Name: Hexaware Technologies...",
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
    links: [
      { label: 'Placement link', url: 'https://placement.sathyabama.ac.in/hexaware-test' },
      { label: 'Visit', url: 'https://neopat.in/assessment' },
      { label: 'Company link', url: 'https://hexaware.com/careers' }
    ],
    textBody: `Dear Candidates,

Greetings from Sathyabama Placement Cell!

The Online Assessment for Hexaware Technologies Campus Recruitment drive has been scheduled on the NeoPat platform:

Eligibility Criteria:
Company Name        : Hexaware Technologies
Venue               : Online Assessment (NeoPat Platform)
Eligible branches   : All Circuit Branches (CSE, IT, AI&DS, ECE, EEE)
Eligibility         : 60% throughout 10th, 12th, and UG with no standing arrears
Internship Stipend  : 12 k/month
CTC                 : 4.0 LPA - 6.0 LPA

Registration:
All the eligible & interested students are requested to register in the Placement link below on or before 11.59 PM - 16.11.2026.

Assessment & Registration Links:
Online Test link: https://assessment.neopat.in/exam/hexaware-2027
Placement link: https://placement.sathyabama.ac.in/hexaware-test
Visit: https://neopat.in/assessment
Company link: https://hexaware.com/careers

Important Guidelines:
1. Complete system compatibility check on NeoPat prior to test day.
2. Ensure high-speed internet and uninterrupted webcam access.
3. Login 15 minutes before test commencement.

Best regards,
Placement Cell
Sathyabama Institute of Science and Technology`,
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
<p>Dear Candidates,</p>
<p>Greetings from <strong>Sathyabama Placement Cell</strong>!</p>
<p>The <strong>Online Assessment</strong> for <strong>Hexaware Technologies</strong> has been scheduled on the NeoPat platform.</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e0e0e0;">
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; width: 35%;">Company Name</td><td style="padding: 8px;">Hexaware Technologies</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">Online Assessment (NeoPat Platform)</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Eligible branches</td><td style="padding: 8px;">All Circuit Branches (CSE, IT, AI&DS, ECE, EEE)</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Eligibility</td><td style="padding: 8px;">60% throughout 10th, 12th, and UG with no standing arrears</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Internship Stipend</td><td style="padding: 8px; color: #166534; font-weight: bold;">12 k/month</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">CTC</td><td style="padding: 8px; color: #1e40af; font-weight: bold;">4.0 LPA - 6.0 LPA</td></tr>
</table>

<p style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 6px;">
<strong>Registration:</strong><br/>
All the eligible & interested students are requested to register in the Placement link below on or before 11.59 PM - 16.11.2026.
</p>

<div style="margin: 16px 0; padding: 12px; background: #e8f0fe; border-radius: 8px;">
  <p style="margin: 4px 0;"><strong>Online Test link:</strong> <a href="https://assessment.neopat.in/exam/hexaware-2027" style="color: #1A73E8;">https://assessment.neopat.in/exam/hexaware-2027</a></p>
  <p style="margin: 4px 0;"><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in/hexaware-test" style="color: #1A73E8;">https://placement.sathyabama.ac.in/hexaware-test</a></p>
  <p style="margin: 4px 0;"><strong>Visit:</strong> <a href="https://neopat.in/assessment" style="color: #1A73E8;">https://neopat.in/assessment</a></p>
  <p style="margin: 4px 0;"><strong>Company link:</strong> <a href="https://hexaware.com/careers" style="color: #1A73E8;">https://hexaware.com/careers</a></p>
</div>

<p><strong>Instructions:</strong></p>
<ul>
  <li>Complete system compatibility check on NeoPat prior to test day.</li>
  <li>Ensure high-speed internet and uninterrupted webcam access.</li>
  <li>Login 15 minutes before test commencement.</li>
</ul>

<p>Best regards,<br/><strong>Sathyabama Placement Cell</strong></p>
</div>`,
    labels: ['INBOX', 'IMPORTANT']
  },
  {
    id: 'msg-demo-004',
    threadId: 'th-004',
    subject: "Campus Recruitment Shortlist & Interview Schedule | Zoho Corporation",
    from: 'Sathyabama Placement <sathyabamaplacement@gmail.com>',
    to: 'Shortlisted Students <student.2027@sathyabama.ac.in>',
    cc: '',
    date: 'Sat, 07 Nov 2026 18:45:00 +0530',
    internalDate: new Date('2026-11-07T18:45:00+05:30').getTime(),
    snippet: "Congratulations! You have cleared Round 1 and are shortlisted for Zoho Corporation Technical Interview...",
    source: 'Gmail',
    isGroup: false,
    groupDetails: null,
    hasAttachments: true,
    attachments: [
      {
        attachmentId: 'att-demo-004',
        filename: 'Zoho_Interview_Instructions.pdf',
        mimeType: 'application/pdf',
        size: 89400,
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
    links: [
      { label: 'Placement link', url: 'https://placement.sathyabama.ac.in/zoho-shortlist' },
      { label: 'Company link', url: 'https://www.zoho.com/careers' }
    ],
    textBody: `Dear Student,

Congratulations on being shortlisted for Zoho Corporation Technical Interview!

Eligibility & Interview Details:
Company Name        : Zoho Corporation
Venue               : Placement Cell - Interview Suites (Block 3)
Eligible branches   : B.E / B.Tech (All Branches)
Eligibility         : Cleared Round 1 Online Aptitude & Coding Test
CTC                 : 6.0 LPA - 8.5 LPA

Registration:
All the shortlisted students are requested to confirm attendance in the Placement link below on or before 06.00 PM - 15.11.2026.

Links:
Placement link: https://placement.sathyabama.ac.in/zoho-shortlist
Company link: https://www.zoho.com/careers

Instructions:
1. Carry two hard copies of your updated resume.
2. Bring your college ID card and government photo ID.
3. Formal dress code is mandatory.

Best Regards,
Placement Office
Sathyabama Institute of Science and Technology`,
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
<p>Dear Student,</p>
<p>Congratulations! You have cleared Round 1 and are shortlisted for <strong>Zoho Corporation Technical Interview</strong>.</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e0e0e0;">
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; width: 35%;">Company Name</td><td style="padding: 8px;">Zoho Corporation</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">Placement Cell - Interview Suites (Block 3)</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Eligible branches</td><td style="padding: 8px;">B.E / B.Tech (All Branches)</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Eligibility</td><td style="padding: 8px;">Cleared Round 1 Online Aptitude & Coding Test</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">CTC</td><td style="padding: 8px; color: #1e40af; font-weight: bold;">6.0 LPA - 8.5 LPA</td></tr>
</table>

<p style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 6px;">
<strong>Registration:</strong><br/>
All the shortlisted students are requested to confirm attendance in the Placement link below on or before 06.00 PM - 15.11.2026.
</p>

<div style="margin: 16px 0; padding: 12px; background: #e8f0fe; border-radius: 8px;">
  <p style="margin: 4px 0;"><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in/zoho-shortlist" style="color: #1A73E8;">https://placement.sathyabama.ac.in/zoho-shortlist</a></p>
  <p style="margin: 4px 0;"><strong>Company link:</strong> <a href="https://www.zoho.com/careers" style="color: #1A73E8;">https://www.zoho.com/careers</a></p>
</div>

<p><strong>Instructions:</strong></p>
<ul>
  <li>Carry two hard copies of your updated resume.</li>
  <li>Bring your college ID card and government photo ID.</li>
  <li>Formal dress code is mandatory.</li>
</ul>

<p>Best regards,<br/><strong>Sathyabama Placement Cell</strong></p>
</div>`,
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
    links: [
      { label: 'Slot Booking Link', url: 'https://cognizant.hirepro.in/slot-booking/2027' },
      { label: 'Placement link', url: 'https://placement.sathyabama.ac.in/apply/cognizant-2027' },
      { label: 'Company link', url: 'https://careers.cognizant.com' }
    ],
    textBody: `Dear Students,

Cognizant Campus Recruitment 2027 Slot Booking is active for GenC and GenC Next roles.

Eligibility Criteria:
Company Name        : Cognizant Technology Solutions
Venue               : Virtual Proctored Assessment
Eligible branches   : B.E / B.Tech - All Engineering Disciplines
Eligibility         : 60% throughout 10th, 12th, and UG, Max 1 standing arrear permitted at application
CTC                 : 4.5 LPA - 7.0 LPA

Registration:
All the eligible students are requested to complete slot booking in the Placement link below on or before 11.59 PM - 12.11.2026.

Important Links:
Slot Booking Link: https://cognizant.hirepro.in/slot-booking/2027
Placement link: https://placement.sathyabama.ac.in/apply/cognizant-2027
Company link: https://careers.cognizant.com

Best Regards,
Placement Office
Sathyabama Institute of Science and Technology`,
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
<p>Dear Students,</p>
<p>Slot booking is now live for <strong>Cognizant GenC &amp; GenC Next Campus Recruitment 2027</strong>.</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e0e0e0;">
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; width: 35%;">Company Name</td><td style="padding: 8px;">Cognizant Technology Solutions</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">Virtual Proctored Assessment</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Eligible branches</td><td style="padding: 8px;">B.E / B.Tech - All Engineering Disciplines</td></tr>
  <tr><td style="padding: 8px; font-weight: bold;">Eligibility</td><td style="padding: 8px;">60% throughout 10th, 12th, and UG, Max 1 standing arrear permitted at application</td></tr>
  <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">CTC</td><td style="padding: 8px; color: #1e40af; font-weight: bold;">4.5 LPA - 7.0 LPA</td></tr>
</table>

<p style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 6px;">
<strong>Registration:</strong><br/>
All the eligible students are requested to complete slot booking in the Placement link below on or before 11.59 PM - 12.11.2026.
</p>

<div style="margin: 16px 0; padding: 12px; background: #e8f0fe; border-radius: 8px;">
  <p style="margin: 4px 0;"><strong>Slot Booking Link:</strong> <a href="https://cognizant.hirepro.in/slot-booking/2027" style="color: #1A73E8;">https://cognizant.hirepro.in/slot-booking/2027</a></p>
  <p style="margin: 4px 0;"><strong>Placement link:</strong> <a href="https://placement.sathyabama.ac.in/apply/cognizant-2027" style="color: #1A73E8;">https://placement.sathyabama.ac.in/apply/cognizant-2027</a></p>
  <p style="margin: 4px 0;"><strong>Company link:</strong> <a href="https://careers.cognizant.com" style="color: #1A73E8;">https://careers.cognizant.com</a></p>
</div>

<p>Best regards,<br/><strong>Sathyabama Placement Cell</strong></p>
</div>`,
    labels: ['INBOX']
  }
];

export const clientDemoGroups = [
  {
    name: 'Sathyabama pc 2027 engg',
    email: 'sathyabama-pc-2027-engg@googlegroups.com',
    listId: '<sathyabama-pc-2027-engg.googlegroups.com>',
    messageCount: 2,
    latestDate: 'Tue, 10 Nov 2026'
  },
  {
    name: 'Sathyabama-2027-Engg',
    email: 'Sathyabama-2027-Engg@googlegroups.com',
    listId: '<Sathyabama-2027-Engg.googlegroups.com>',
    messageCount: 1,
    latestDate: 'Fri, 06 Nov 2026'
  }
];

