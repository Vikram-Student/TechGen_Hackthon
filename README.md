# Campus Lost & Found

Privacy-first campus lost & found application built with React, Vite and Supabase.

## Stack
- React + Vite
- Supabase Auth
- PostgreSQL + Row Level Security
- Supabase Storage for mandatory item photos
- Responsive CSS

## Features
- Student signup/login
- Lost/found reports
- Mandatory PNG/JPG/WEBP item photo (max 5 MB)
- Search and category/status filters
- Public-safe listings without phone/email
- Private claims
- Owner/admin claim decisions
- Notifications
- Admin moderation dashboard
- Returned status after accepted claims

## Local setup
1. Create `.env.local` in the project root:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Run the Supabase schema/upgrade SQL in `supabase/schema.sql`.
3. Run `npm install`
4. Run `npm run dev`

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`

The build script intentionally invokes Vite through Node so the project is not dependent on executable permissions for `node_modules/.bin/vite` on the build host.

Never put a Supabase service-role/secret key in frontend environment variables.
