import { useEffect, useState } from 'react';
import {
  getAdSenseConfiguration,
  loadAdSenseScript,
  requestAd,
  type AdPlacement,
} from '@/lib/adsense';

type AdSpaceProps = {
  slotId: AdPlacement;
};

export function AdSpace({ slotId }: AdSpaceProps) {
  const configuration = getAdSenseConfiguration(slotId);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!configuration) return;

    let isMounted = true;
    void loadAdSenseScript(configuration.publisherId)
      .then(() => {
        if (isMounted) requestAd();
      })
      .catch(() => {
        if (isMounted) setLoadFailed(true);
      });

    return () => {
      isMounted = false;
    };
  }, [configuration?.publisherId, configuration?.slotId]);

  if (!configuration || loadFailed) {
    return (
      <aside
        className="ad-space"
        aria-label="Reserved advertising space"
        data-ad-slot={slotId}
        data-ad-format="responsive-banner"
        data-testid={`ad-slot-${slotId}`}
      >
        <span className="ad-space-label">Ad space</span>
        <span className="ad-space-note">
          {loadFailed ? 'Ad service could not be reached' : 'Reserved for future advertising'}
        </span>
      </aside>
    );
  }

  return (
    <aside
      className="ad-space ad-space-live"
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-format="responsive-banner"
      data-testid={`ad-slot-${slotId}`}
    >
      <span className="ad-space-label">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={configuration.publisherId}
        data-ad-slot={configuration.slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}