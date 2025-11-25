# BeatBox – High-Level System Design

This diagram captures the core components and data flows that power BeatBox.

![BeatBox high-level system diagram](./system-design.svg)

> Prefer text-based diagrams? The previous Mermaid source is still available in git history for reference.

## Data & Control Flow
1. **User Interaction** – React UI renders pages, dispatches Redux actions (play, queue, AutoMix) and consumes streaming URLs directly in the browser.
2. **Next.js API Routes** – handle authentication (NextAuth), playlist/favourite CRUD, and the AutoMix orchestration service.
3. **MongoDB Atlas** – stores persistent entities: `User`, `UserData`, `Playlist`.
4. **Saavn Proxy** – the self-hosted instance (`https://beatbox-khaki.vercel.app`) provides search, song, album, and recommendation data through `/api/...` endpoints.
5. **Email & OAuth Providers** – Nodemailer sends transactional email via SMTP; Google OAuth provides social login.

> This document lives at `docs/system-design.md`. Update it alongside architecture changes or when generating UML artifacts for your presentation.
