import { RING_SIZE_GUIDE_DIAGRAM_IMAGE } from '@/shared/config/ring-size-guide';

export function RingSizeGuideDiagram() {
  return (
    <div className="jewelry-size-guide-ring-diagram" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={RING_SIZE_GUIDE_DIAGRAM_IMAGE}
        alt=""
        width={145}
        height={244}
        className="jewelry-size-guide-ring-diagram-image"
        decoding="async"
      />
    </div>
  );
}
