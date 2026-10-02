# Google AdSense setup

AdSense is prepared but remains off unless all required settings are added to a **production build**. Development previews keep showing the labeled placeholders.

## Settings

Add these environment variables to the production build:

```text
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_PUBLISHER_ID=ca-pub-your-publisher-number
VITE_ADSENSE_HOME_SLOT_ID=your-home-ad-unit-number
VITE_ADSENSE_GAME_SLOT_ID=your-game-ad-unit-number
```

Use the publisher ID and responsive display ad-unit IDs provided by your own AdSense account. These `VITE_` values are visible in the browser and are identifiers, not secrets. If only one slot is configured, only that placement can request an ad.

## Before enabling ads

1. Add and verify the published site in AdSense, then wait for Google's site review and approval.
2. Replace the contact and draft-notice wording on `/privacy` with the publisher's monitored privacy contact and confirm the disclosures match the actual account settings and data practices.
3. Review privacy and consent rules for the places where visitors live. Google requires a Google-certified CMP integrated with the IAB TCF for personalized ads to users in the EEA, UK, and Switzerland.
4. After AdSense provides the site's exact `ads.txt` entry, put that line in `public/ads.txt`. Google recommends `ads.txt`; do not use a sample publisher ID.
5. Set the production variables, enable ads, publish, and verify the site and ad-unit status in AdSense. Approval and ad fill are controlled by Google; this setup does not guarantee revenue.

The ad loader will not run in development, with invalid or missing IDs, or while `VITE_ADSENSE_ENABLED` is not exactly `true`.

## Google references

- [AdSense code placement](https://support.google.com/adsense/answer/9274516)
- [Google Publisher Policies and privacy disclosures](https://support.google.com/adsense/answer/10502938)
- [Google consent requirements for the EEA, UK, and Switzerland](https://support.google.com/adsense/answer/13554116)
- [AdSense ads.txt guide](https://support.google.com/adsense/answer/12171612)