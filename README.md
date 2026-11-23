# Answer24Seven Vapi AI Receptionist

Next.js app for Vapi end-of-call webhook persistence and a password-protected call dashboard.

## Before launch

1. Create Supabase project and run `supabase/migrations/001_create_calls.sql`.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, and (recommended) `VAPI_WEBHOOK_SECRET` in Vercel.
3. Deploy. Set the Vapi assistant's server URL to `https://<deployment-host>/api/vapi/end-of-call` and select `end-of-call-report`.
4. Follow `docs/SETUP-GREG.txt` for Vapi, Twilio, Google Voice forwarding, and real-call test steps.

## Local

```sh
cp .env.example .env.local
npm install
npm run dev
```

The dashboard is denied when `DASHBOARD_PASSWORD` is unset; the calls API always requires an authenticated dashboard session. The webhook only accepts Vapi reports; configure `VAPI_WEBHOOK_SECRET` and an `X-Vapi-Secret` bearer-token credential in Vapi for shared-secret auth. The service role key is used only in server routes. No sample/test rows are seeded.

Email is not configured; owner summaries are persisted and visible in Recent calls. Do not claim the phone line works until a real end-to-end test call succeeds.
