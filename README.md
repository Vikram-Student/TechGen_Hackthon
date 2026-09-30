<<<<<<< HEAD
# Campus Lost & Found — End Product

A privacy-first campus lost & found application built with React + Vite + Supabase.

## Stack
- React + Vite
- Supabase Auth
- PostgreSQL + Row Level Security
- Supabase Storage for item photos
- Responsive custom CSS

## End-product features
- Student sign up / login
- Lost and found reports
- Optional item photos
- Search + status + category filters
- Public-safe item listing without owner contact information
- Private claims
- Claim status: pending / accepted / rejected
- Claim notifications
- Secure owner/admin claim decision RPCs
- Returned status after an accepted claim
- Admin moderation dashboard
- Private claim messaging table ready for the next communication screen
- Responsive mobile UI

## Setup
1. Keep your existing `.env.local` values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Run the SQL from `supabase/schema.sql` in Supabase SQL Editor. This is an **upgrade script** for the starter schema you already ran.
3. Run:
   ```bash
   npm install
   npm run dev
   ```

## Make a user an admin
After the user has signed up, run this in Supabase SQL Editor using their actual email:
```sql
update public.profiles
set role='admin'
where id=(select id from auth.users where email='YOUR_COLLEGE_EMAIL');
```

Do not put a Supabase service-role/secret key in the frontend.

## Important privacy rule
Do not add phone numbers, personal email addresses, passwords, or other private contact details to public item descriptions. Use the claim workflow instead.


## Mandatory item photo
Every new item report requires a PNG, JPG, or WEBP photo (maximum 5 MB). The frontend validates this and the Supabase database trigger rejects new/updated records without an image path. Existing records from earlier testing are not modified.
=======
# Campus Lost & Found
90-minute MVP for a college building/hackathon session.

## Run
Open `index.html` in any modern browser. No server or installation required.

## Features
- Lost / Found report creation
- Search and status filter
- LocalStorage persistence
- Item details
- Mark item as Returned
- Dashboard statistics
- Responsive UI

## Team split
1. UI/navigation
2. Report form
3. Search/items
4. Integration/testing/presentation

## Privacy & Safety
- Reporter phone numbers are not displayed in public item cards/details.
- Users contact reporters through an in-app request form.
- Claim requests store only the claimant's supplied contact and message in localStorage for the prototype.
- Recommended real deployment: authenticated backend, encrypted storage, role-based access, moderation, rate limiting, and campus-admin controlled handover.
>>>>>>> 3bb6ea9262e185e5848fbbb4c2146fdb82aca52e
