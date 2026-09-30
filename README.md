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
