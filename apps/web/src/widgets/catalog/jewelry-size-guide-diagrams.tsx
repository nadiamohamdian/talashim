import type { CSSProperties } from 'react';
import {
  RING_SIZE_GUIDE_DIAGRAM_ITEMS,
  RING_SIZE_GUIDE_MOBILE_CIRCLE_DIAMETERS_PX,
  RING_SIZE_GUIDE_MOBILE_MARKERS,
} from '@/shared/config/ring-size-guide';

const RING_DIAGRAM_ROW_WIDTH_PX = 789;
const RING_MOBILE_DIAGRAM_WIDTH_PX = 145;
const RING_MOBILE_CIRCLES_HEIGHT_PX = 145;

function RingSizeGuideMobileDiagram() {
  return (
    <div
      className="jewelry-size-guide-ring-diagram jewelry-size-guide-ring-diagram--mobile"
      aria-hidden
    >
      <div className="jewelry-size-guide-ring-diagram-mobile">
        <div className="jewelry-size-guide-ring-diagram-mobile-circles">
          {RING_SIZE_GUIDE_MOBILE_CIRCLE_DIAMETERS_PX.map((diameterPx) => (
            <div
              key={diameterPx}
              className="jewelry-size-guide-ring-diagram-mobile-circle"
              style={{
                width: diameterPx,
                height: diameterPx,
                left: (RING_MOBILE_DIAGRAM_WIDTH_PX - diameterPx) / 2,
                top: (RING_MOBILE_CIRCLES_HEIGHT_PX - diameterPx) / 2,
              }}
            />
          ))}
        </div>

        <div className="jewelry-size-guide-ring-diagram-mobile-markers">
          {RING_SIZE_GUIDE_MOBILE_MARKERS.map((marker) => (
            <div key={marker.label} className="jewelry-size-guide-ring-diagram-mobile-marker">
              <span
                className="jewelry-size-guide-ring-diagram-mobile-line"
                style={
                  {
                    '--marker-line-h': `${marker.lineHeightPx}px`,
                    '--marker-left': `${marker.leftPx}px`,
                    '--marker-top': `${marker.lineTopPx}px`,
                  } as CSSProperties
                }
              />
              <span
                className="jewelry-size-guide-ring-diagram-mobile-label"
                style={
                  {
                    '--marker-left': `${marker.leftPx}px`,
                    '--label-top': `${marker.labelTopPx}px`,
                  } as CSSProperties
                }
              >
                {marker.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RingSizeGuideDesktopDiagram() {
  return (
    <div
      className="jewelry-size-guide-ring-diagram jewelry-size-guide-ring-diagram--desktop"
      aria-hidden
    >
      <div className="jewelry-size-guide-ring-diagram-row">
        {RING_SIZE_GUIDE_DIAGRAM_ITEMS.map((item) => (
          <div
            key={item.label}
            className="jewelry-size-guide-ring-diagram-item"
            style={
              {
                '--ring-item-width': `${(item.diameterPx / RING_DIAGRAM_ROW_WIDTH_PX) * 100}%`,
              } as CSSProperties
            }
          >
            <div className="jewelry-size-guide-ring-diagram-circle" />
            <span className="jewelry-size-guide-ring-diagram-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RingSizeGuideDiagram() {
  return (
    <>
      <RingSizeGuideMobileDiagram />
      <RingSizeGuideDesktopDiagram />
    </>
  );
}
