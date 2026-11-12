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

## Leave & salary logic
- Each employee has Casual and Sick leaves allotted (default 8 + 8, editable). **Consumed leaves are stored on the employee** and updated every time a salary is calculated.
- Leave days = absent + 0.5 × half days; you say how many of them are Sick, the rest are Casual.
- Each type is adjusted from its remaining balance; the excess is unpaid (loss of pay).
- Recalculating the same employee + month first reverses its earlier consumption, so nothing is double counted.
- Counters reset automatically when you calculate the first salary of a new calendar year.
- per-day = salary ÷ (working days + holidays); leave deduction = unpaid days × per-day
- TDS = TDS% × (salary − leave deduction); net = salary − leave deduction − TDS
(logic: `app/api/salary/route.ts`)
