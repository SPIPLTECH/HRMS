# HR Salary Calculator (Next.js + TypeScript + MongoDB Atlas)

## Setup
1. `npm install`
2. `cp .env.example .env` and set `MONGODB_URI` (Atlas; allow your IP in Network Access), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`.
3. `npm run dev` → http://localhost:3000 (production: `npm run build && npm start`)

## Features
- Login with credentials from `.env` (JWT in httpOnly cookie, protected by middleware)
- Home: employee count, last-month payout/deductions, CSV download
- Add Employee: name, ID, monthly salary
- Calculate Salary: month, employee, working days, holidays, absent, half days
- History: month-wise records, CSV export per month

## Formula
- leave days = absent + 0.5 × half days
- adjusted from yearly balance (8 leaves/yr, Jan–Dec) = min(balance, leave days)
- unpaid days = leave days − adjusted
- per-day = monthly salary ÷ (working days + holidays)  (holidays are paid)
- net = salary − unpaid days × per-day
Change the formula in `app/api/salary/route.ts`; leave quota in `lib/models.ts`.
