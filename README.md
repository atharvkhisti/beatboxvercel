    [![Project Banner](https://github-production-user-asset-6210df.s3.amazonaws.com/99420590/256470702-de779111-e63e-4ecc-93d1-e79edadf19ed.png)](#)

# BeatBox

BeatBox is a full-stack music streaming and playlist management platform built with **Next.js 14 (App Router)**, **NextAuth**, **MongoDB**, and **Redux Toolkit**. It pulls metadata and streaming URLs from a self-hosted instance of the open-source [JioSaavn API](https://github.com/sumitkolhe/jiosaavn-api) and layers on authentication, favourites, personal playlists, and our unique **AutoMix** generator.

## Highlights

- 🎧 **Real playback** – robust audio player (Media Session support, keyboard controls, queue management).
- 🧠 **AutoMix** – one-click mood/activity mixes backed by Saavn search + BeatBox normalization layer.
- 💾 **Persistent data** – MongoDB stores users, playlists, favourites, and listening history.
- 🔐 **Auth ready** – NextAuth with Google OAuth + credentials, JWT protected APIs.
- 📱 **Responsive UI** – Next.js + Tailwind + reusable component library.
- 📨 **Transactional email** – password reset + onboarding via Nodemailer.
- 🛰️ **Self-hosted Saavn proxy** – easy instructions to deploy your own compliant metadata source.

## System Design Snapshot

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ React UI    │ → → │ Next.js APIs │ → → │ MongoDB    │
│ (App Router)│     │ (App Routes) │     │ Atlas/Cluster │
└─────────────┘     └──────────────┘     └───────────┘
        │                    │
        │                    └───────►  AutoMix Service
        │                                 (Saavn search + normalizer)
        ▼
┌────────────────────────────┐
│ JioSaavn Proxy (Vercel)    │
│ https://beatbox-khaki...   │
└────────────────────────────┘
```

**Flow overview**
1. **Client** renders pages via Next.js App Router and triggers playback/AutoMix actions through Redux.
2. **Next.js APIs** (under `src/app/api`) handle auth, user playlists/favourites, AutoMix, and mail. They connect to MongoDB using a shared `dbconnect` utility.
3. **AutoMix route** calls our Saavn proxy, applies mood/activity presets, normalizes inconsistent fields, and returns a BeatBox-ready queue.
4. **Media player** consumes normalized data, gracefully handling missing artwork/album metadata while updating the device media session.

This architecture keeps third-party dependencies isolated, so switching sources (e.g., different Saavn proxy or another catalog) only requires changing the `SAAVN_API_BASE` config.

## Screenshots

![Home](https://github.com/himanshu8443/hayasaka/assets/99420590/158bc035-463e-403b-a23a-db17b83ab7b0)

![Player](https://github.com/himanshu8443/hayasaka/assets/99420590/864aec2b-8d60-4278-a475-9f7ee6ae7680)

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/beatbox.git
cd beatbox
npm install
```

### 2. Provision a Saavn proxy

1. Fork or download [sumitkolhe/jiosaavn-api](https://github.com/sumitkolhe/jiosaavn-api).
2. Deploy it to Vercel (one-click). No env vars needed.
3. Copy the deployment URL (e.g., `https://beatbox-khaki.vercel.app`).
4. Use that URL in `NEXT_PUBLIC_SAAVN_API`; the repo also contains `src/config/saavn.js` which falls back to this deployment if the env var is missing or still points to `saavn.dev`.

### 3. Configure environment variables

Create `.env` in the project root and fill with the following:

```env
MONGODB_URL=<MongoDB connection string>
DB_NAME=beatbox
JWT_SECRET=<random string>
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=<Google OAuth client>
GOOGLE_CLIENT_SECRET=<Google OAuth secret>

MAIL_HOST=smtp.gmail.com
MAIL_USER=<gmail>
MAIL_PASS=<app password>

NEXT_PUBLIC_SAAVN_API=https://beatbox-khaki.vercel.app
```

> ✅ `NEXT_PUBLIC_SAAVN_API` must point to a working JioSaavn proxy you control. The repo ships with `src/config/saavn.js` which normalizes the value and falls back to the deployed proxy if someone accidentally leaves the old `saavn.dev` URL.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or the port Next picks if 3000 is busy). For clean rebuilds, remove the `.next/` folder before restarting.

## AutoMix Notes

- API route: `src/app/api/autoMix/route.js`
- Frontend trigger: `src/components/Homepage/Home.jsx`
- Uses presets (`focus`, `workout`, etc.) mapped to Saavn search queries, normalizes the result, and dispatches to the Redux player.
- Player resiliency: `src/components/MusicPlayer/Player.jsx` now guards album/artwork fields and falls back to the BeatBox logo when metadata is missing.

## Next Steps / System Design Deliverables

- UML (Use-case, Sequence, Deployment) can be generated from the architecture snapshot above; the README documents each subsystem to accelerate that work.
- If you intend to switch to another catalog (Spotify, Apple, etc.), plug the new data source into `src/config/saavn.js` and the service layer – the rest of the stack remains unchanged.

Happy streaming! 🎶


