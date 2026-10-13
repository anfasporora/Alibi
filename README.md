# Alibi

Daily deduction game. Next.js (App Router) + TypeScript, no database needed for the prototype.

    npm install
    npm run dev        # http://localhost:3000

## Deploy
Push to GitHub, import at vercel.com/new (framework auto-detected as Next.js), click Deploy. Or run `npx vercel --prod`.

## How it works
- `lib/case.ts` holds the case. Only `publicCase` is sent to the browser (`/api/case`).
- `/api/accuse` checks the guess on the server and reveals the solution only when the case ends.
- Next steps: move cases to Upstash Redis, add a daily cron that generates and verifies new cases, add a leaderboard.
