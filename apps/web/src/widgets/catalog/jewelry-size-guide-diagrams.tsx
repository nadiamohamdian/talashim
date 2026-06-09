import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import {
  RING_SIZE_GUIDE_CIRCLES,
  RING_SIZE_GUIDE_DIAGRAM_VIEWBOX,
  RING_SIZE_GUIDE_MARKERS,
} from '@/shared/config/ring-size-guide';

export function RingSizeGuideDiagram() {
  return (
    <div className="jewelry-size-guide-ring-diagram" aria-hidden>
      <svg
        className="jewelry-size-guide-ring-diagram-svg"
        viewBox={RING_SIZE_GUIDE_DIAGRAM_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin meet"
      >
        {RING_SIZE_GUIDE_CIRCLES.map((circle) => {
          const radius = circle.diameter / 2;

          return (
            <circle
              key={circle.diameter}
              cx={circle.x + radius}
              cy={circle.y + radius}
              r={radius}
              stroke="#000000"
              strokeWidth="1"
            />
          );
        })}

        {RING_SIZE_GUIDE_MARKERS.map((marker) => (
          <line
            key={marker.size}
            x1={marker.lineX}
            y1={marker.lineTop}
            x2={marker.lineX}
            y2={marker.lineBottom}
            stroke="#CBA670"
            strokeWidth="1"
          />
        ))}

        {RING_SIZE_GUIDE_MARKERS.map((marker) => (
          <text
            key={`label-${marker.size}`}
            x={marker.labelX}
            y={marker.labelY}
            fill="#CBA670"
            fontFamily="'Yekan Bakh', sans-serif"
            fontSize="12"
            fontWeight="300"
          >
            {toPersianDigits(marker.size)}
          </text>
        ))}
      </svg>
    </div>
  );
}
