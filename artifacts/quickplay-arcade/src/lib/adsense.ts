export type AdPlacement = 'arcade-home-banner' | 'arcade-game-bottom';

type AdSenseConfiguration = {
  publisherId: string;
  slotId: string;
};

type AdSenseQueue = Array<Record<string, unknown>>;

declare global {
  interface Window {
    adsbygoogle?: AdSenseQueue;
  }
}

const slotIds: Record<AdPlacement, string> = {
  'arcade-home-banner': import.meta.env.VITE_ADSENSE_HOME_SLOT_ID?.trim() ?? '',
  'arcade-game-bottom': import.meta.env.VITE_ADSENSE_GAME_SLOT_ID?.trim() ?? '',
};

const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID?.trim() ?? '';
const isProduction = import.meta.env.PROD;
const adsAreEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
const isValidPublisherId = /^ca-pub-\d+$/.test(publisherId);

let adsenseScriptPromise: Promise<void> | undefined;

export function isAdSenseConfigured(): boolean {
  if (!isProduction || !adsAreEnabled || !isValidPublisherId) return false;

  return Object.values(slotIds).some((slotId) => /^\d+$/.test(slotId));
}

export function getAdSenseConfiguration(
  placement: AdPlacement,
): AdSenseConfiguration | null {
  if (!isProduction || !adsAreEnabled || !isValidPublisherId) return null;

  const slotId = slotIds[placement];
  if (!/^\d+$/.test(slotId)) return null;

  return { publisherId, slotId };
}

export function loadAdSenseScript(clientId: string): Promise<void> {
  if (adsenseScriptPromise) return adsenseScriptPromise;

  adsenseScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.getElementById('quickplay-adsense-script') as HTMLScriptElement | null;

    if (script?.dataset.loadState === 'loaded') {
      resolve();
      return;
    }
    if (script?.dataset.loadState === 'failed') {
      reject(new Error('The AdSense script could not be loaded.'));
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = 'quickplay-adsense-script';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    }

    script.addEventListener(
      'load',
      () => {
        script!.dataset.loadState = 'loaded';
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        script!.dataset.loadState = 'failed';
        reject(new Error('The AdSense script could not be loaded.'));
      },
      { once: true },
    );

    if (!script.isConnected) document.head.appendChild(script);
  });

  return adsenseScriptPromise;
}

export function requestAd(): void {
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
}