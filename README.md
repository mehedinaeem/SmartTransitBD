# SmartTransit BD

A Next.js App Router foundation for an intelligent public transport platform for Bangladesh.

## Run locally

Requires Node.js 22 LTS and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000/operator or http://localhost:3000/app. The root redirects to the operator overview.

```bash
npm run lint
npm run build
npm start
```

## Architecture

- `src/app`: separate passenger and operator layouts, route entries, mock API route handlers, loading/error boundaries.
- `src/components`: navigation shell, providers, Leaflet map, and shared shadcn-style UI primitives. `components.json` configures shadcn aliases and styling. Button and dialog use Radix primitives.
- `src/features`: overview, fleet table, route previews, and foundation screens.
- `src/lib/api.ts`: typed `TransitApi` adapter; TanStack Query handles caching, abort signals, retries, and request state. Replace this implementation when integrating the backend.
- `src/hooks`: query hooks; `src/stores`: Zustand interface state.
- `src/types`: Zod response contracts and inferred TypeScript models.
- `src/mocks`: illustrative Dhaka routes, vehicles, and activity.

Leaflet is loaded only in the browser. OpenStreetMap tiles and Inter font loading require internet access. Tile failures show an explanatory message. Production map traffic should use a suitable tile service under its usage policy.

## Scope and real project status

The GPS/GNSS prototype works and cellular position transmission is available. The seat occupancy model is being trained/tested. Raspberry Pi integration is in progress. This web app is **not connected to that hardware**.

All locations, timestamps, alerts, occupancy figures, and chart values in the application are sample data. The overview uses a fixed demonstration date. Booking, payments, authentication, and production authorization are future work. Settings are UI previews; no account data is sent to a server. Do not deploy operator routes as a production control plane before adding authentication and server-side authorization.

All requested passenger and operator URLs are present. The visual system includes responsive navigation, motion with reduced-motion support, keyboard-accessible Radix dialogs, reusable empty/error/loading states, toasts, and forms.

## Browser verification

After building, run `npm run test:ui`. Install Playwright Chromium with `npx playwright install chromium`, or set `CHROME_PATH` to an installed Chrome executable (on this workstation: `/usr/bin/google-chrome`). The test runner starts and stops its own production server on port 3000.

The suite checks all 14 application routes at 375px, 768px, and 1440px, checks page overflow and browser exceptions, exercises mobile navigation, fleet search/status filters, vehicle dialogs, journey filtering, session preferences, and API failure/retry behavior. Six screenshots are written to `artifacts/`.

Validated locally: `npm install`, `npm run lint`, `npm run build`, and all four browser tests. The build uses Next.js 16.4.6. Inter and OpenStreetMap require an internet connection.
