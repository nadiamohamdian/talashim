'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ContactForm } from '@/features/contact/components/contact-form';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import {
  CONTACT_PAGE_COPY,
  CONTACT_SOCIAL_LINKS,
} from '@/shared/config/contact-page';

const CONTACT_ICONS = {
  support: '/images/contact/support.png',
  whatsapp: '/images/contact/whatsapp.png',
  telegram: '/images/contact/telegram.png',
  instagram: '/images/contact/instagram.png',
  location: '/images/contact/location.png',
  clock: '/images/contact/clock.png',
} as const;

function ContactIcon({
  src,
  className,
}: {
  src: string;
  className: 'contact-channel-icon' | 'contact-info-icon';
}) {
  const size = className === 'contact-channel-icon' ? 41 : 30;

  return (
    <Image src={src} alt="" width={size} height={size} className={className} aria-hidden />
  );
}

export function ContactPageView() {
  const { general } = useStorefrontSettings();
  const address = general.contactAddress.trim();
  const hours = general.businessHours.trim();
  const supportPhone = general.supportPhone.trim() || CONTACT_SOCIAL_LINKS.support.display;

  const channels = [
    {
      key: 'whatsapp',
      label: CONTACT_SOCIAL_LINKS.whatsapp.label,
      value: CONTACT_SOCIAL_LINKS.whatsapp.display,
      href: CONTACT_SOCIAL_LINKS.whatsapp.href,
      iconSrc: CONTACT_ICONS.whatsapp,
    },
    {
      key: 'support',
      label: CONTACT_SOCIAL_LINKS.support.label,
      value: supportPhone,
      href: `tel:${supportPhone.replace(/\D/g, '')}`,
      iconSrc: CONTACT_ICONS.support,
    },
    {
      key: 'instagram',
      label: CONTACT_SOCIAL_LINKS.instagram.label,
      value: CONTACT_SOCIAL_LINKS.instagram.display,
      href: CONTACT_SOCIAL_LINKS.instagram.href,
      iconSrc: CONTACT_ICONS.instagram,
    },
    {
      key: 'telegram',
      label: CONTACT_SOCIAL_LINKS.telegram.label,
      value: CONTACT_SOCIAL_LINKS.telegram.display,
      href: CONTACT_SOCIAL_LINKS.telegram.href,
      iconSrc: CONTACT_ICONS.telegram,
    },
  ] as const;

  return (
    <div className="contact-page store-chrome-light store-minimal-header">
      <div className="contact-page-inner">
        <header className="contact-page-header">
          <h1 className="contact-page-hero-title">{CONTACT_PAGE_COPY.heroTitle}</h1>
          <p className="contact-page-lead contact-page-lead--hero">{CONTACT_PAGE_COPY.channelsLead}</p>
        </header>

        <div className="contact-page-body">
          <section
            className="contact-page-section contact-page-section--channels"
            aria-labelledby="contact-channels-title"
          >
            <p className="contact-page-lead contact-page-lead--mobile">{CONTACT_PAGE_COPY.channelsLead}</p>
            <h2 id="contact-channels-title" className="contact-page-section-title">
              {CONTACT_PAGE_COPY.channelsTitle}
            </h2>

            <div className="contact-channels-grid">
              {channels.map((channel) => (
                <a
                  key={channel.key}
                  href={channel.href}
                  className="contact-channel-card"
                  target={channel.key === 'support' ? undefined : '_blank'}
                  rel={channel.key === 'support' ? undefined : 'noopener noreferrer'}
                >
                  <span className="contact-channel-icon-wrap">
                    <ContactIcon src={channel.iconSrc} className="contact-channel-icon" />
                  </span>
                  <span className="contact-channel-label">{channel.label}</span>
                  <span className="contact-channel-value" dir="ltr">
                    {channel.value}
                  </span>
                </a>
              ))}
            </div>

            <div className="contact-info-rows">
              <div className="contact-info-row">
                <ContactIcon src={CONTACT_ICONS.location} className="contact-info-icon" />
                <p className="contact-info-text">{address || '—'}</p>
              </div>
              <div className="contact-info-row">
                <ContactIcon src={CONTACT_ICONS.clock} className="contact-info-icon" />
                <p className="contact-info-text">{hours || '—'}</p>
              </div>
            </div>
          </section>

          <div className="contact-page-interaction">
            <section className="contact-page-section contact-faq-cta" aria-labelledby="contact-faq-title">
              <h2 id="contact-faq-title" className="contact-page-section-title">
                {CONTACT_PAGE_COPY.faqTitle}
              </h2>
              <p className="contact-page-lead">{CONTACT_PAGE_COPY.faqLead}</p>
              <Link href="/faq" className="contact-faq-button">
                {CONTACT_PAGE_COPY.faqButton}
              </Link>
            </section>

            <section
              className="contact-page-section contact-page-section--form"
              aria-labelledby="contact-form-title"
            >
              <h2 id="contact-form-title" className="contact-page-section-title">
                {CONTACT_PAGE_COPY.formTitle}
              </h2>
              <p className="contact-page-lead contact-page-lead--form">{CONTACT_PAGE_COPY.formLead}</p>
              <ContactForm />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
