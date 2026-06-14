'use client';

import Link from 'next/link';
import { ContactForm } from '@/features/contact/components/contact-form';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import {
  CONTACT_PAGE_COPY,
  CONTACT_SOCIAL_LINKS,
} from '@/shared/config/contact-page';

function PhoneIcon() {
  return (
    <svg className="contact-channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 3h3l1.2 5.5-1.9 1.1a12.5 12.5 0 0 0 5.6 5.6L15.5 13l5.5 1.2v3c0 .6-.4 1-1 1.1C11.2 19.1 4.9 12.8 4.4 7c-.1-.6.4-1.1 1.1-1.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="contact-channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.5c.3-.7.7-1.3 1.4-1.5.4-.1 1 .2 1.3.8.2.4.1 1-.2 1.4-.3.4-.7.7-.7 1.2.4 1 1.6 2.2 2.7 2.7.5 0 .8-.4 1.2-.7.4-.3 1-.5 1.4-.2.6.3.9.9.8 1.3-.2.7-.8 1.1-1.5 1.4-1 .4-2.1.1-3.8-.8-2-1.1-3.4-2.9-4.4-4.9-.9-1.7-1.2-2.8-.8-3.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="contact-channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 4 3.5 11.2c-.9.4-.9 1.6.1 1.9l4.2 1.3 1.6 5c.3.9 1.4.9 1.8.1l2.3-4.5 5.3 4.1c.7.5 1.7.1 1.9-.8L22 5.5c.2-1-.7-1.8-1.7-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="contact-channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ContactPageView() {
  const { general } = useStorefrontSettings();
  const address = general.contactAddress.trim();
  const hours = general.businessHours.trim();
  const supportPhone = general.supportPhone.trim() || CONTACT_SOCIAL_LINKS.support.display;

  const channels = [
    {
      key: 'support',
      label: CONTACT_SOCIAL_LINKS.support.label,
      value: supportPhone,
      href: `tel:${supportPhone.replace(/\D/g, '')}`,
      icon: <PhoneIcon />,
    },
    {
      key: 'whatsapp',
      label: CONTACT_SOCIAL_LINKS.whatsapp.label,
      value: CONTACT_SOCIAL_LINKS.whatsapp.display,
      href: CONTACT_SOCIAL_LINKS.whatsapp.href,
      icon: <WhatsAppIcon />,
    },
    {
      key: 'telegram',
      label: CONTACT_SOCIAL_LINKS.telegram.label,
      value: CONTACT_SOCIAL_LINKS.telegram.display,
      href: CONTACT_SOCIAL_LINKS.telegram.href,
      icon: <TelegramIcon />,
    },
    {
      key: 'instagram',
      label: CONTACT_SOCIAL_LINKS.instagram.label,
      value: CONTACT_SOCIAL_LINKS.instagram.display,
      href: CONTACT_SOCIAL_LINKS.instagram.href,
      icon: <InstagramIcon />,
    },
  ] as const;

  return (
    <div className="contact-page store-chrome-light store-minimal-header">
      <div className="contact-page-inner">
        <h1 className="contact-page-hero-title">{CONTACT_PAGE_COPY.heroTitle}</h1>

        <section
          className="contact-page-section contact-page-section--channels"
          aria-labelledby="contact-channels-title"
        >
          <h2 id="contact-channels-title" className="contact-page-section-title">
            {CONTACT_PAGE_COPY.channelsTitle}
          </h2>
          <p className="contact-page-lead">{CONTACT_PAGE_COPY.channelsLead}</p>

          <div className="contact-channels-grid">
            {channels.map((channel) => (
              <a
                key={channel.key}
                href={channel.href}
                className="contact-channel-card"
                target={channel.key === 'support' ? undefined : '_blank'}
                rel={channel.key === 'support' ? undefined : 'noopener noreferrer'}
              >
                <span className="contact-channel-icon-wrap">{channel.icon}</span>
                <span className="contact-channel-label">{channel.label}</span>
                <span className="contact-channel-value" dir="ltr">
                  {channel.value}
                </span>
              </a>
            ))}
          </div>

          <div className="contact-info-rows">
            <div className="contact-info-row">
              <LocationIcon />
              <p className="contact-info-text">{address || '—'}</p>
            </div>
            <div className="contact-info-row">
              <ClockIcon />
              <p className="contact-info-text">{hours || '—'}</p>
            </div>
          </div>
        </section>

        <section className="contact-page-section contact-faq-cta" aria-labelledby="contact-faq-title">
          <h2 id="contact-faq-title" className="contact-page-section-title">
            {CONTACT_PAGE_COPY.faqTitle}
          </h2>
          <p className="contact-page-lead">{CONTACT_PAGE_COPY.faqLead}</p>
          <Link href="/faq" className="contact-faq-button">
            {CONTACT_PAGE_COPY.faqButton}
          </Link>
        </section>

        <section className="contact-page-section" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="contact-page-section-title">
            {CONTACT_PAGE_COPY.formTitle}
          </h2>
          <p className="contact-page-lead">{CONTACT_PAGE_COPY.formLead}</p>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
