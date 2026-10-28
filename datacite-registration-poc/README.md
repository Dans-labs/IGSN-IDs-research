# IGSN Registration Form demo
Proof of concept Tanstack Start app using Vite+. Presents the user with a bare bones form that registers a bare bones IGSN with Datacite. Purely proof of concept: no login, minimal fields, draft IGSNs only.

## Prerequisits
Vite+ is highly recommended for development and easy of use. If you don't have it installed, install it globally using:
```bash
curl -fsSL https://vite.plus | bash
```

## Running
```bash
cp .env.example .env.local
```
Fill in `IGSN_API_KEY` and `IGSN_PREFIX` with the values you registered and setup in the Datacite test environment. The Auth values can be ignored for now. These values are server side only and not exposed to the user.

Then start the app:
```bash
vp i
vp dev
```