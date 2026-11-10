# petrides.art

Source for https://www.petrides.art (static site deployed on Vercel, project `petrides-art`).

Branch `site-2026-11` holds the November 2026 audit revision. It was rebuilt from the live deployment of 21 October 2026.

Before deploying this branch, add two files that could not be exported from Vercel:

- `api/inquiry.js` (the contact-form function)
- `pnpm-lock.yaml`

Both are in the current Vercel deployment's source and are unchanged by this revision.
