import { COMPANY } from '../constants/company.js';
import { formatPlace } from './format.js';

const icsEscape = (s) => String(s || '').replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** Downloads an all-day .ics event for a booking so it can be added to any calendar app. */
export function downloadCalendarEvent(booking) {
  const day = String(booking.moveDate || '').slice(0, 10).replace(/-/g, '');
  if (!day) return;
  const next = new Date(`${booking.moveDate.slice(0, 10)}T12:00:00`);
  next.setDate(next.getDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Real Moving Canada//Customer portal//EN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@realmovingcanada`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsEscape(`Move day — ${COMPANY.name}`)}`,
    `LOCATION:${icsEscape(formatPlace(booking.origin, { withAddress: true }))}`,
    `DESCRIPTION:${icsEscape(`Booking ${booking.id}${booking.arrivalWindow ? ` · Arrival window ${booking.arrivalWindow}` : ''}\nQuestions? ${COMPANY.phone}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `move-${booking.id}.ics` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
