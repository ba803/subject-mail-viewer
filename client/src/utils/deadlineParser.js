/**
 * Deadline Parser & Time Remaining Calculator
 * Supports college placement email registration deadlines, e.g.:
 * "Registration: All the eligible & interested students are requested to register in the below two links on or before 12.11.2026 - 01.00 PM."
 * Calculates dynamic time remaining, e.g. "Only 2 days left", "Ends today", "Registration Closed"
 */

export function parseDeadlineDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const cleanDate = dateStr.trim();
  
  // DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const dmyMatch = cleanDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  let day, month, year;
  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10);
    month = parseInt(dmyMatch[2], 10) - 1;
    year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
  } else {
    const parsed = new Date(cleanDate);
    if (isNaN(parsed.getTime())) return null;
    day = parsed.getDate();
    month = parsed.getMonth();
    year = parsed.getFullYear();
  }

  let hours = 23;
  let minutes = 59;
  if (timeStr && timeStr.trim()) {
    const timeMatch = timeStr.trim().match(/(\d{1,2})[:.](\d{2})\s*([apAP][mM])?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const meridiem = (timeMatch[3] || '').toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }
  }

  const d = new Date(year, month, day, hours, minutes, 0);
  return isNaN(d.getTime()) ? null : d;
}

export function getTimeRemaining(deadlineDate) {
  if (!deadlineDate) return null;
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      status: 'expired',
      badge: 'Registration Closed',
      text: 'Registration Closed',
      subtext: 'Deadline has passed',
      color: 'red',
      daysLeft: 0,
      isExpired: true
    };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDeadline = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate()).getTime();
  const calendarDays = Math.round((startOfDeadline - startOfToday) / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (calendarDays <= 0) {
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return {
        status: 'urgent',
        badge: `Only ${diffMins} min${diffMins === 1 ? '' : 's'} left`,
        text: `Only ${diffMins} minute${diffMins === 1 ? '' : 's'} left!`,
        subtext: 'Closing very soon',
        color: 'red',
        daysLeft: 0,
        isExpired: false
      };
    }
    return {
      status: 'urgent',
      badge: `Ends today (${diffHours}h left)`,
      text: `Ends today (Only ${diffHours} hour${diffHours === 1 ? '' : 's'} left)`,
      subtext: 'Closes today',
      color: 'amber',
      daysLeft: 0,
      isExpired: false
    };
  }

  if (calendarDays === 1) {
    return {
      status: 'warning',
      badge: 'Only 1 day left',
      text: 'Only 1 day left',
      subtext: 'Closing tomorrow',
      color: 'amber',
      daysLeft: 1,
      isExpired: false
    };
  }

  if (calendarDays === 2) {
    return {
      status: 'warning',
      badge: 'Only 2 days left',
      text: 'Only 2 days left',
      subtext: 'Closing in 2 days',
      color: 'amber',
      daysLeft: 2,
      isExpired: false
    };
  }

  if (calendarDays <= 5) {
    return {
      status: 'warning',
      badge: `Only ${calendarDays} days left`,
      text: `Only ${calendarDays} days left`,
      subtext: `Closing in ${calendarDays} days`,
      color: 'amber',
      daysLeft: calendarDays,
      isExpired: false
    };
  }

  return {
    status: 'open',
    badge: `${calendarDays} days left`,
    text: `${calendarDays} days left`,
    subtext: 'Registration open',
    color: 'emerald',
    daysLeft: calendarDays,
    isExpired: false
  };
}

export function parseDateTimeString(rawStr) {
  if (!rawStr) return null;
  const trimmed = rawStr.trim().replace(/^[.,;:\s]+|[.,;:\s]+$/g, '');

  const timeRegexPart = `(?:\\d{1,2}[:.]\\d{2}\\s*(?:[apAP][mM])?|\\d{1,2}\\s*[apAP][mM])`;
  const dateRegexPart = `(?:\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4})`;

  // Pattern A: [time] - [date]  e.g. 01.00 PM - 12.11.2026 (Official college pattern)
  const timeDatePattern = new RegExp(`^(${timeRegexPart})\\s*[-–@,]\\s*(${dateRegexPart})`, 'i');
  const tdMatch = trimmed.match(timeDatePattern);
  if (tdMatch) {
    return {
      timePart: tdMatch[1].trim(),
      datePart: tdMatch[2].trim(),
      rawDeadline: `${tdMatch[1].trim()} - ${tdMatch[2].trim()}`,
      order: 'time-date'
    };
  }

  // Pattern B: [date] - [time]  e.g. 12.11.2026 - 01.00 PM
  const dateTimePattern = new RegExp(`^(${dateRegexPart})(?:\\s*[-–@,]\\s*(${timeRegexPart}))?`, 'i');
  const dtMatch = trimmed.match(dateTimePattern);
  if (dtMatch) {
    return {
      datePart: dtMatch[1].trim(),
      timePart: dtMatch[2] ? dtMatch[2].trim() : '',
      rawDeadline: dtMatch[2] ? `${dtMatch[1].trim()} - ${dtMatch[2].trim()}` : dtMatch[1].trim(),
      order: 'date-time'
    };
  }

  return null;
}

export function extractRegistrationDeadline(message) {
  if (!message) return null;

  const rawText = `${message.textBody || ''}\n${message.snippet || ''}`;
  const rawHtml = message.htmlBody ? message.htmlBody.replace(/<[^>]*>/g, ' ') : '';
  const fullText = `${rawText}\n${rawHtml}`;

  const timeDateChunk = `(?:\\d{1,2}[:.]\\d{2}\\s*[apAP][mM]|\\d{1,2}\\s*[apAP][mM]|\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4})\\s*[-–@,]\\s*(?:\\d{1,2}[:.]\\d{2}\\s*[apAP][mM]|\\d{1,2}\\s*[apAP][mM]|\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4})|\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4}`;

  // 1. Target exact placement link pattern: "Placement link below on or before [time] - [date]"
  const patternPlacementLink = new RegExp(
    `([^\n\r]*?(?:placement link|below link|below two links|links? below|registration|register)[^\n\r]*?on or before\\s*(${timeDateChunk})[^\n\r]*)`,
    'i'
  );

  // 2. Generic "on or before"
  const patternGeneric = new RegExp(
    `([^\n\r]*?on or before\\s*(${timeDateChunk})[^\n\r]*)`,
    'i'
  );

  // 3. "Last date / End date / deadline"
  const patternLastDate = new RegExp(
    `((?:last date|end date|deadline|apply before)[^\n\r]*?[:\\-]?\\s*(${timeDateChunk})[^\n\r]*)`,
    'i'
  );

  const match = fullText.match(patternPlacementLink) || fullText.match(patternGeneric) || fullText.match(patternLastDate);

  let rawInstruction = '';
  let rawChunk = '';

  if (match) {
    rawInstruction = match[1].trim();
    rawChunk = match[2].trim();
  } else if (message.registrationDeadline) {
    rawChunk = message.registrationDeadline;
    rawInstruction = message.registrationInstruction || `Placement link below on or before ${rawChunk}`;
  } else {
    return null;
  }

  const parsedDT = parseDateTimeString(rawChunk);
  if (!parsedDT) return null;

  const parsedDate = parseDeadlineDate(parsedDT.datePart, parsedDT.timePart);
  const remaining = getTimeRemaining(parsedDate);

  return {
    instruction: rawInstruction,
    rawDeadline: parsedDT.rawDeadline,
    datePart: parsedDT.datePart,
    timePart: parsedDT.timePart,
    parsedDate,
    remaining
  };
}

