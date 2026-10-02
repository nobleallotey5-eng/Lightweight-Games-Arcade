import { useEffect } from 'react';
import { Link } from 'wouter';
import { isAdSenseConfigured } from '@/lib/adsense';

export function PrivacyPage() {
  const adsConfigured = isAdSenseConfigured();

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;

    document.title = 'Privacy & Ads | Quickplay Arcade';
    description?.setAttribute(
      'content',
      'Learn what Quickplay Arcade stores in your browser and how advertising may work if AdSense is enabled.',
    );

    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) {
        description.setAttribute('content', previousDescription);
      }
    };
  }, []);

  return (
    <section className="policy-page" aria-labelledby="privacy-title">
      <Link href="/" className="policy-back">← Back to the arcade</Link>
      <div className="eyebrow">Privacy &amp; advertising</div>
      <h1 id="privacy-title">Your play stays <em>yours.</em></h1>
      <p className="policy-meta">Last updated October 2, 2026</p>

      <div className="policy-status" role="status">
        <strong>{adsConfigured ? 'AdSense code is configured' : 'Ads are not active'}</strong>
        <span>
          {adsConfigured
            ? 'This published build has ad settings. Google still needs to approve the site and available inventory before ads can appear.'
            : 'The reserved spaces are placeholders. No AdSense script is loaded by this build.'}
        </span>
      </div>

      <section className="policy-section">
        <h2>What the arcade stores</h2>
        <p>
          Quickplay Arcade does not require an account. It saves your personal best scores in
          your browser’s local storage so they can appear again on this device. Those scores are
          not sent to a Quickplay server.
        </p>
        <p>
          The arcade does not currently use in-app analytics or store game scores on a server.
          The site loads fonts from Google Fonts, and its hosting provider may process standard
          connection information to deliver the site.
        </p>
      </section>

      <section className="policy-section">
        <h2>Advertising and AdSense</h2>
        <p>
          If Google AdSense is enabled, Google and its advertising partners may use cookies or
          similar technologies and process information such as IP addresses, browser or device
          details, and ad interactions to provide, measure, and protect advertising. Depending
          on the settings and consent available for your region, ads may be personalized.
        </p>
        <p>
          You can review Google’s{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
            advertising technologies and controls
          </a>{' '}
          and manage your Google ad settings at{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            My Ad Center
          </a>
          .
        </p>
      </section>

      <section className="policy-section">
        <h2>Consent and regional requirements</h2>
        <p>
          Before serving personalized ads in the EEA, UK, or Switzerland, Google requires
          publishers to use a Google-certified consent management platform that integrates with
          the IAB Transparency and Consent Framework. The site owner must configure an
          appropriate consent solution and review the laws that apply to the audience before
          turning on ads.
        </p>
      </section>

      <section className="policy-section">
        <h2>Privacy contact</h2>
        <p>
          A monitored privacy contact address has not been provided yet. The site owner must add
          a contact email and confirm this notice matches the final AdSense and consent settings
          before serving ads.
        </p>
      </section>

      <p className="policy-draft">
        This is a working privacy notice for the current app, not legal advice. Review and update
        it for the publisher’s identity, actual data practices, and the regions where the site
        is offered before monetization.
      </p>
    </section>
  );
}