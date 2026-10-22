# Waypoint AI — Route + Weather + Customs integration

## Changes made
- Added `frontend/src/pages/SeaRouteIntelligence.jsx` and its stylesheet. The quotation page now displays a Leaflet route preview, route weather data from `/api/weather/route/{route_id}`, and customs profile data from `/api/customs/analyze` in the same workflow.
- Added cargo type and container controls for the customs profile. Weather/customs panels use the existing CSV-backed FastAPI agents.
- Removed the separate `Plot Route` link from the main navigation. Dedicated Weather and Customs navigation items remain unchanged.
- Preserved the existing backend, agents, data files, and quotation form.

## Important map note
The map uses curated sea-corridor waypoints for the Chennai/Mumbai/Singapore-to-Northern-Europe lanes, including the Suez Canal and North Sea approach. Other port pairs use a fallback corridor and should be reviewed before operational use. This is a visual route-planning preview, not an authoritative navigational route. For production sea-safe routing across every lane, integrate a verified maritime routing service or licensed nautical route geometry and port coordinates.

## Running
1. Restore/install frontend dependencies from `frontend/package-lock.json` with `npm ci`.
2. Start the existing FastAPI backend using the project's normal command.
3. Start Vite from `frontend` using `npm run dev`.
4. Sign in, select a route, choose it, and open the quotation page to see the map/weather/customs section.

The archive intentionally excludes `.env` files, Git metadata, virtual environments, and `node_modules`. Restore API credentials locally in your own ignored `.env` file; never share it.
