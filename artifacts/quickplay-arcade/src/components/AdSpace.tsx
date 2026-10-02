type AdSpaceProps = {
  slotId: string;
};

export function AdSpace({ slotId }: AdSpaceProps) {
  return (
    <aside
      className="ad-space"
      aria-label="Reserved advertising space"
      data-ad-slot={slotId}
      data-ad-format="responsive-banner"
      data-testid={`ad-slot-${slotId}`}
    >
      <span className="ad-space-label">Ad space</span>
      <span className="ad-space-note">Reserved for future advertising</span>
    </aside>
  );
}