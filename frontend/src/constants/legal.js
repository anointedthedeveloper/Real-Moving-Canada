import { COMPANY, ADDRESS_LINE } from './company.js';

/**
 * Privacy policy and terms of service text. Written for Real Moving Canada's
 * current website (quote/contact/review forms via Formspree, browser storage for
 * form drafts, embedded Google Maps). Have it reviewed by the company's legal
 * adviser, and update LEGAL_UPDATED whenever the text changes.
 */
export const LEGAL_UPDATED = '2026-09-30';

const contact = `${COMPANY.legalName}, ${ADDRESS_LINE} · ${COMPANY.phone} · ${COMPANY.email}`;

export const PRIVACY = {
  title: 'Privacy Policy',
  intro: `${COMPANY.legalName} (“Real Moving Canada”, “we”, “us”) respects your privacy. This policy explains what personal information we collect through this website and when you use our moving services, how we use it, and the choices you have. We handle personal information in line with Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA).`,
  sections: [
    {
      id: 'information-we-collect',
      title: 'Information we collect',
      body: [
        'We collect the information you choose to give us, including:',
        ['Contact details — your name, email address, phone number and preferred contact method.',
          'Move details — origin and destination addresses, moving date, property types and sizes, services requested, item lists, access notes and storage needs.',
          'Messages — what you write in our contact form, quote notes, reviews and correspondence with our team.',
          'Account details — if you create a customer account, your login email and password (stored in encrypted form), and your profile and address details.',
          'Payment details — when online payments are available, card payments are processed by our payment provider; we do not store full card numbers.'],
        'We also receive basic technical information that browsers send to any website, such as your IP address, browser type and the pages you visit, which our hosting provider may keep in server logs for security and troubleshooting.',
      ],
    },
    {
      id: 'how-we-use',
      title: 'How we use your information',
      body: [
        ['To prepare estimates and quotes, and to schedule and carry out your move.',
          'To contact you about your request, booking, payments and any changes to your move.',
          'To provide and secure your customer account.',
          'To publish reviews you submit (with your first name or display name only) after our team has read them.',
          'To keep records required for accounting, insurance and legal purposes.',
          'To improve our website and services.'],
        'We do not sell your personal information, and we do not use it for marketing unless you have asked to hear from us.',
      ],
    },
    {
      id: 'sharing',
      title: 'When we share information',
      body: [
        'We share personal information only as needed to provide our services:',
        ['Service providers that help us run the website and our business — for example Formspree (which delivers our website forms to our team by email), our website hosting provider, and our payment processor.',
          'Partners involved in your move — for example a vehicle carrier or storage facility, when you have asked for those services.',
          'Authorities, when required by law or to protect the rights and safety of our customers, staff or the public.'],
        'Some of these providers may store information outside Canada, where it may be subject to the laws of that country.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and browser storage',
      body: [
        'This website does not use advertising or tracking cookies. It uses your browser’s local storage to remember a quote or estimate you have started, so you can finish it later on the same device, and to restore your scroll position when you go back. You can clear this at any time in your browser settings.',
        'Signing in to a customer account uses a secure session cookie that is needed for the account to work.',
        'The map on our Contact page is provided by Google Maps and fonts are provided by Google Fonts; Google may collect technical information when these load, as described in Google’s privacy policy.',
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep information',
      body: ['We keep personal information only as long as needed for the purposes above — for example, for the length of your move and our follow-up, and afterwards as long as required for tax, accounting and legal obligations. We then delete or anonymize it.'],
    },
    {
      id: 'security',
      title: 'How we protect information',
      body: ['We use reasonable physical, administrative and technical safeguards to protect personal information, including encrypted connections (HTTPS) on this website and limited access for our staff. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.'],
    },
    {
      id: 'your-rights',
      title: 'Your choices and rights',
      body: [
        'You may ask to see the personal information we hold about you, ask us to correct it, or withdraw your consent to how we use it (which may affect our ability to provide our services). You can also ask us to delete your account.',
        'To make a request, contact us using the details below. We may need to confirm your identity before we respond, and we will reply within 30 days.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      body: ['Our services are intended for adults. We do not knowingly collect personal information from children under 16.'],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: ['We may update this policy from time to time. The date at the top of this page shows when it was last changed.'],
    },
    {
      id: 'contact',
      title: 'Contact us',
      body: [`Questions or requests about your privacy can be sent to: ${contact}.`, 'If you are not satisfied with our response, you may contact the Office of the Privacy Commissioner of Canada.'],
    },
  ],
};

export const TERMS = {
  title: 'Terms of Service',
  intro: `These terms apply to your use of this website and to moving services provided by ${COMPANY.legalName} (“Real Moving Canada”, “we”, “us”). By using the website or booking a move, you agree to them. Your written quote and booking confirmation form part of these terms; if anything in them differs from these terms, the quote or booking confirmation applies.`,
  sections: [
    {
      id: 'estimates-quotes',
      title: 'Estimates and quotes',
      body: [
        'Online estimates are price ranges based on the information you enter. They are for guidance only and are not an offer or a binding price.',
        'A quote is prepared by our team after reviewing your move details. Quotes are based on the information you provide — including addresses, access, inventory, dates and services — and are valid for the period stated on the quote. If the actual move differs (for example, additional items, stairs or long carries, waiting time or extra services), the final price may change. We will tell you about changes as soon as we know about them.',
      ],
    },
    {
      id: 'bookings',
      title: 'Bookings, changes and cancellations',
      body: [
        'A move is booked only when we confirm it in writing (by email or through your customer account). Arrival times are windows, not exact times, and can be affected by traffic, weather and earlier jobs.',
        'To reschedule or cancel, contact us as early as possible. Any deposit, rescheduling or cancellation terms are set out in your quote or booking confirmation.',
      ],
    },
    {
      id: 'your-responsibilities',
      title: 'Your responsibilities',
      body: [
        ['Give us accurate, complete information about your move, items and access at both locations.',
          'Arrange parking, elevator bookings and building permissions where needed, and make sure someone is present at pickup and delivery.',
          'Pack items securely if you are packing yourself, and tell us about fragile, high-value or unusually heavy items before the move.',
          'Keep cash, jewellery, important documents, medication and similar valuables with you.'],
      ],
    },
    {
      id: 'items-we-cannot-move',
      title: 'Items we cannot move',
      body: ['For safety and legal reasons we do not transport hazardous materials (such as propane tanks, gasoline, paint, chemicals, ammunition or explosives), illegal items, perishable food, plants restricted by provincial rules, or live animals. We may refuse to move any item we believe is unsafe.'],
    },
    {
      id: 'liability',
      title: 'Care of your belongings and claims',
      body: [
        'We handle your belongings with reasonable care. The protection that applies to your items, and any limits on our liability, are described in your quote or booking confirmation. Please ask us about additional coverage for high-value items before your move.',
        'Check your items at delivery and note any visible damage on the delivery paperwork. Report any loss or damage to us in writing as soon as possible, and keep damaged items and packaging so they can be inspected.',
        'We are not responsible for damage caused by improper packing by the customer, for the internal workings of electronics or appliances unless there is visible external damage, or for delays caused by events outside our control such as severe weather, road closures or accidents.',
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      body: ['Payment amounts and due dates are set out in your quote or booking confirmation. Prices are in Canadian dollars and applicable taxes are extra unless stated otherwise. We may hold delivery of items until amounts due for the move have been paid, where permitted by law.'],
    },
    {
      id: 'storage',
      title: 'Storage',
      body: ['If we store items for you, storage fees, access and pickup arrangements are set out in your storage agreement or booking confirmation. Items remaining in storage with unpaid fees may be dealt with as permitted by provincial law, after notice to you.'],
    },
    {
      id: 'accounts',
      title: 'Customer accounts',
      body: ['If you create an account, keep your login details confidential and let us know right away if you think someone else has accessed it. You are responsible for activity on your account.'],
    },
    {
      id: 'website',
      title: 'Use of this website',
      body: [
        'The content of this website — including text, photos and the Real Moving Canada name and logo — belongs to us or our licensors and may not be copied or reused without permission.',
        'Do not misuse the website, including by submitting false information, attempting to access other customers’ information, or interfering with its operation. We may update the website and these terms at any time; the date at the top shows the latest version.',
        'The website is provided “as is”. To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of the website.',
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      body: ['These terms are governed by the laws of the Province of Saskatchewan and the federal laws of Canada that apply there. Nothing in these terms limits any rights you have under consumer protection laws.'],
    },
    {
      id: 'contact',
      title: 'Contact us',
      body: [`Questions about these terms can be sent to: ${contact}.`],
    },
  ],
};
