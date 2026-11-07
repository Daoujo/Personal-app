import { TimeBlock, CategoryType } from '../types';

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

interface CalendarApiResponse {
  items?: GoogleCalendarEvent[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Categorizes an event title/description into the app's predefined categories.
 */
function inferCategory(text: string): CategoryType {
  const lower = text.toLowerCase();
  
  if (
    lower.includes('cours') ||
    lower.includes('math') ||
    lower.includes('aéro') ||
    lower.includes('avionique') ||
    lower.includes('méc') ||
    lower.includes('examen') ||
    lower.includes('révision') ||
    lower.includes('study') ||
    lower.includes('tp') ||
    lower.includes('td') ||
    lower.includes('apprendre')
  ) {
    return 'study';
  }

  if (
    lower.includes('sport') ||
    lower.includes('gym') ||
    lower.includes('muscu') ||
    lower.includes('cardio') ||
    lower.includes('running') ||
    lower.includes('yoga') ||
    lower.includes('docteur') ||
    lower.includes('médecin') ||
    lower.includes('santé') ||
    lower.includes('dentiste')
  ) {
    return 'health';
  }

  if (
    lower.includes('repas') ||
    lower.includes('déjeuner') ||
    lower.includes('dîner') ||
    lower.includes('pause') ||
    lower.includes('café') ||
    lower.includes('lunch') ||
    lower.includes('break') ||
    lower.includes('repos')
  ) {
    return 'break';
  }

  if (
    lower.includes('banque') ||
    lower.includes('impôt') ||
    lower.includes('loyer') ||
    lower.includes('admin') ||
    lower.includes('facture') ||
    lower.includes('paperasse') ||
    lower.includes('mail') ||
    lower.includes('email')
  ) {
    return 'admin';
  }

  if (
    lower.includes('projet') ||
    lower.includes('code') ||
    lower.includes('dev') ||
    lower.includes('travail') ||
    lower.includes('work') ||
    lower.includes('meeting') ||
    lower.includes('réunion') ||
    lower.includes('synchro') ||
    lower.includes('client') ||
    lower.includes('sprint')
  ) {
    return 'work';
  }

  return 'personal';
}

/**
 * Formats a Date object to "HH:mm".
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Fetches events from primary Google Calendar for the current and upcoming days,
 * and converts them into TimeBlock items.
 */
export async function fetchGoogleCalendarEvents(accessToken: string): Promise<TimeBlock[]> {
  // Define time range: from beginning of today to 7 days ahead
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endRange = new Date();
  endRange.setDate(endRange.getDate() + 7);
  endRange.setHours(23, 59, 59, 999);

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', startOfDay.toISOString());
  url.searchParams.set('timeMax', endRange.toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session Google expirée. Veuillez vous reconnecter.");
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Erreur Google Calendar (${response.status})`);
  }

  const data: CalendarApiResponse = await response.json();
  const items = data.items || [];

  const timeBlocks: TimeBlock[] = items.map((event) => {
    let startTime = '09:00';
    let endTime = '10:00';
    let durationMinutes = 60;
    let dayLabel = '';

    if (event.start?.dateTime && event.end?.dateTime) {
      const startD = new Date(event.start.dateTime);
      const endD = new Date(event.end.dateTime);
      
      startTime = formatTime(startD);
      endTime = formatTime(endD);
      const diffMs = endD.getTime() - startD.getTime();
      durationMinutes = Math.max(15, Math.round(diffMs / (1000 * 60)));

      // Check if event is today or another day
      const today = new Date();
      if (startD.toDateString() !== today.toDateString()) {
        const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        dayLabel = dayFormatter.format(startD);
      }
    } else if (event.start?.date) {
      // Full-day event
      startTime = '09:00';
      endTime = '18:00';
      durationMinutes = 540;
      dayLabel = 'Journée entière';
    }

    const title = event.summary?.trim() || 'Événement Google Agenda';
    const description = event.description?.trim();
    const location = event.location?.trim();

    const category = inferCategory(`${title} ${description || ''}`);

    const notesParts: string[] = [];
    if (dayLabel) notesParts.push(`📅 ${dayLabel}`);
    if (location) notesParts.push(`📍 ${location}`);
    if (description) notesParts.push(description);

    return {
      id: `gcal_${event.id}`,
      title,
      startTime,
      endTime,
      durationMinutes,
      category,
      isCompleted: false,
      tag: 'Google Agenda',
      notes: notesParts.join(' • ') || 'Synchronisé depuis Google Calendar',
    };
  });

  return timeBlocks;
}
