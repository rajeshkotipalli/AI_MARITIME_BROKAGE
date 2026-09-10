import { PORT_COORDS } from "./data/ports";

const VIEW_W = 1000;
const VIEW_H = 560;

// Rough continent silhouettes in the same 0-100 x/y space as PORT_COORDS.
// These are stylized/illustrative blobs (a dot-matrix map), not precise
// cartography -- just enough shape to read as "world map" behind the lanes.
const CONTINENTS = [
  // North America
  [[4,10],[19,7],[27,14],[29,24],[24,34],[19,42],[11,45],[4,39],[1,24]],
  // South America
  [[21,47],[30,49],[33,60],[29,76],[23,80],[17,69],[16,54]],
  // Europe
  [[39,9],[52,7],[56,14],[52,21],[44,24],[39,19]],
  // Africa
  [[41,27],[55,29],[58,45],[53,65],[47,75],[41,67],[39,49],[39,34]],
  // Asia
  [[54,9],[91,7],[96,20],[93,35],[85,40],[77,42],[69,45],[61,42],[57,34],[54,24]],
  // Australia
  [[79,67],[92,65],[95,75],[87,82],[79,78]],
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isLand(x, y) {
  return CONTINENTS.some((poly) => pointInPolygon(x, y, poly));
}

function toViewCoords({ x, y }) {
  return { vx: (x / 100) * VIEW_W, vy: (y / 100) * VIEW_H };
}

function lanePath(originName, destName) {
  const a = PORT_COORDS[originName];
  const b = PORT_COORDS[destName];
  if (!a || !b) return null;

  const { vx: x1, vy: y1 } = toViewCoords(a);
  const { vx: x2, vy: y2 } = toViewCoords(b);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bow = Math.min(dist * 0.2, 90);
  const cx = mx - nx * bow;
  const cy = my - ny * bow;

  return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` };
}

// Precompute the dot grid once at module load -- it never changes.
const DOTS = [];
for (let gx = 0; gx <= 100; gx += 1.8) {
  for (let gy = 4; gy <= 92; gy += 2.6) {
    if (isLand(gx, gy)) DOTS.push({ x: gx, y: gy });
  }
}

/**
 * Stylized dot-matrix world map with the charted ports and, when both an
 * origin and destination are selected, the plotted lane between them.
 * `status`: "idle" | "loading" | "success" | "not_found"
 */
export default function ChartCanvas({ origin, destination, status = "idle" }) {
  const lane = origin && destination ? lanePath(origin, destination) : null;
  const laneState =
    status === "not_found" ? "broken" : status === "success" ? "locked" : "plotting";

  return (
    <svg
      className="wp-chart"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={
        lane
          ? `Stylized world map with a lane plotted from ${origin} to ${destination}`
          : "Stylized world map of the Waypoint route network"
      }
    >
      <g className="wp-chart__land">
        {DOTS.map((d, i) => {
          const { vx, vy } = toViewCoords(d);
          return <circle key={i} cx={vx} cy={vy} r="1.4" />;
        })}
      </g>

      {lane && (
        <g className={`wp-lane wp-lane--${laneState}`}>
          <path className="wp-lane__path" d={lane.d} />
          {laneState !== "broken" && (
            <g className="wp-lane__ship" style={{ offsetPath: `path('${lane.d}')` }}>
              <path d="M -6 0 L 6 0 L 0 7 Z" />
            </g>
          )}
        </g>
      )}

      {Object.entries(PORT_COORDS).map(([name, pos]) => {
        const { vx, vy } = toViewCoords(pos);
        const role = name === origin ? "origin" : name === destination ? "destination" : "idle";
        return (
          <g
            key={name}
            className={`wp-port wp-port--${role}`}
            transform={`translate(${vx}, ${vy})`}
          >
            <circle r={role === "idle" ? 2.2 : 4.5} />
            {role !== "idle" && (
              <text x="7" y="4">
                {name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}