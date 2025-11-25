# BeatBox UML Package – Narrative Descriptions

This document now covers **all 14 UML diagram types** so you (or another AI) can generate full documentation without additional context. Each section explains the intent, scope, and elements specific to BeatBox.

---

## 1. Use-Case Diagram

**Actors**
- `Listener`: authenticated or guest user who browses, plays songs, triggers AutoMix, and manages favourites.
- `Creator`: logged-in user with playlist management abilities (inherits all Listener use cases plus playlist CRUD).
- `System Admin`: maintains platform health, monitors the Saavn proxy, and processes DMCA requests.
- `External Services`: Google OAuth, SMTP mail server, JioSaavn proxy (secondary actors).

**Use Cases**
1. `Browse Catalog` – search/filter Saavn-fed catalog.
2. `Play Song / Control Player` – play, pause, skip, view lyrics; extended by AutoMix.
3. `AutoMix Session` – choose mood/activity, system generates curated queue.
4. `Manage Favourites` – add/remove songs (backed by `UserData`).
5. `Manage Playlists` – Creator creates, edits, shares playlists (`Playlist` collection).
6. `Authenticate / Reset Password` – login via Google OAuth or credentials; includes mail-based reset.
7. `Handle DMCA` – Admin reviews takedown requests and updates DMCA page.

**Relationships**
- `Creator` generalizes `Listener`.
- `AutoMix Session` extends `Play Song / Control Player`.
- `Authenticate` includes Google OAuth + Credentials flows.
- `Manage Playlists` includes `Add Song to Playlist` and `Remove Song`.
- External services have «include» links from corresponding use cases (e.g., `Authenticate` ↔ Google OAuth).

---

## 2. Activity Diagram

Model the **end-to-end music session**:
1. **Start** → `Load Home Page`.
2. Decision: `Authenticated?` If no → `Prompt OAuth / Credentials` → `Create Session` → merge.
3. `Retrieve Home Modules (Saavn proxy)`.
4. Split into parallel flows:
   - `Render carousels`.
   - `Fetch user-specific data (favourites/playlists)`.
5. Listener chooses action:
   - `Pick Song` → `Fetch song detail` → `Dispatch setActiveSong` → `Play audio`.
   - `Start AutoMix` → `POST /api/autoMix` → `Generate queue` → `Dispatch queue` → join back at `Play audio`.
6. While playing: loop of `User controls` (play/pause/skip) → `Update Redux state` → `Reflect in UI`.
7. On logout or window close → `Persist session data` → `End`.

Include exception flows for `Saavn proxy unavailable` → `Show toast / fallback tracks` and `Auth failure` → `Show error state`.

---

## 3. Class Diagram

**Core Classes**
- `User`: `_id`, `name`, `email`, `image`, `role`, `createdAt`; behaviours for favourites and profile updates.
- `UserData`: `_id`, `userId`, `favourites[]`, `recentlyPlayed[]`, `autoMixHistory[]`; 1:1 with `User`.
- `Playlist`: `_id`, `ownerId`, `title`, `description`, `tracks[]`, `isAutoMix`, timestamps; operations for add/remove/reorder.
- `Track` (value object): `id`, `name`, `primaryArtists`, `album`, `duration`, `artwork`, `downloadUrls[]`.
- `AutoMixEngine`: presets map, method `generateQueue(mood, activity, userCtx)`.
- `SaavnApiClient`: `search`, `getSong`, `getPlaylist`, `getRecommendations`.
- `AuthService`: `signIn(provider)`, `issueJWT(user)`, `verifyToken(token)`.
- `MailService`: `sendResetLink(user, token)`.
- `PlayerState` (Redux slice): `currentSongs[]`, `activeSong`, `currentIndex`, `isPlaying`, `fullScreen`, `autoAdd` with actions `setActiveSong`, `playPause`, `setQueue`.

**Relationships**
- `Playlist` aggregates `Track`.
- `PlayerState` composes `Track` for playback queue.
- `AutoMixEngine` depends on `SaavnApiClient` and optionally `UserData` for personalization.
- `AuthService` collaborates with Google OAuth provider.
- `MailService` uses SMTP endpoint.

---

## 4. Object Diagram

Capture a **runtime snapshot** during an AutoMix session:
- Objects: `user1:User`, `userData1:UserData`, `playlistA:Playlist (isAutoMix=true)`, `trackX:Track`, `playerState:PlayerState`.
- Links:
  - `user1` ↔ `userData1` (1:1 link via `userId`).
  - `playlistA.tracks` contains `[trackX, trackY, ...]` with indexes.
  - `playerState.currentSongs` references the same track objects as `playlistA`.
  - `playerState.activeSong` → `trackX` (currently playing).
- Show attribute values (e.g., `playerState.isPlaying=true`, `trackX.name="Snowman"`).
This diagram helps downstream tooling understand the concrete data instances exchanged between Redux and MongoDB.

---

## 5. Package Diagram

Suggested packages:
- `app/` – Next.js routes.
- `components/` – UI and player widgets.
- `redux/` – store, slices.
- `services/` – Saavn + backend helpers.
- `utils/` – auth, db, mail utilities.
- `app/api/` – API route subpackages (`auth`, `autoMix`, `playlist`, etc.).

Dependencies:
- `components` uses `redux` and `services`.
- `app/api` depends on `utils` (db, auth) and `services` (Saavn client).
- `redux` depends on `services` for thunks.
Depict package arrows accordingly.

---

## 6. Component Diagram

Components:
- `Next.js UI Component` (provides web interface).
- `Next.js API Component` (handles REST-like endpoints).
- `MongoDB Atlas` (data persistence component).
- `Saavn Proxy` component (external, provides metadata service interface).
- `Auth Provider` (NextAuth + Google OAuth adapter).
- `Mail Provider` (SMTP / Nodemailer component).

Interfaces:
- UI component requires `PlayerState API`, `AutoMix API`, `Auth API`.
- API component provides those interfaces and requires `Database`, `Saavn`, `Mail`, `OAuth`.
- Depict connectors showing data flow directions.

---

## 7. Composite Structure Diagram

Focus on the `MusicPlayer` React component:
- Internal parts: `Player` (audio element), `Controls`, `Seekbar`, `VolumeBar`, `TrackInfo`, `FullscreenTrack`.
- Ports: `playPausePort`, `seekPort`, `queuePort` connecting to Redux slice.
- Collaboration: `Player` uses `activeSong` provided via `PlayerState` port; `Controls` sends events through `playPausePort`; `Seekbar` and `VolumeBar` update `setSeekTime` and `setVolume` ports.
- Show how these parts communicate inside the composite to deliver playback functionality.

---

## 8. Deployment Diagram

**Nodes**
- `Client Device`: browser, PWA cache, local storage.
- `BeatBox Web (Next.js server)` on Vercel or local machine.
- `MongoDB Atlas Cluster`.
- `JioSaavn Proxy Deployment` (Vercel `beatbox-khaki.vercel.app`).
- `Google OAuth` and `SMTP Mail Server` as external nodes.

**Connections**
- HTTPS between client and BeatBox Web.
- TLS MongoDB connection from BeatBox Web.
- HTTPS from BeatBox Web to Saavn proxy.
- OAuth redirect loop between client and Google.
- SMTP (TLS) between BeatBox Web and mail server.

---

## 9. State Machine Diagram

Model `PlayerState` lifecycle:
- States: `Idle` → `Buffering` → `Playing` → `Paused` → `Stopped`.
- Transitions:
  - `Idle` --(select track)--> `Buffering`.
  - `Buffering` --(audio loaded)--> `Playing`.
  - `Playing` --(pause action)--> `Paused`.
  - `Paused` --(play action)--> `Playing`.
  - `Playing` --(track end & auto-next)--> `Buffering` (for next track).
  - Any state --(queue cleared)--> `Idle`.
- Include entry/exit actions (e.g., on `Playing` entry: `dispatch(playPause(true))`).

---

## 10. Sequence Diagram – “Start AutoMix”

Reuse the detailed flow from earlier; ensure lifelines `User`, `HomePage`, `AutoMix API`, `AutoMixEngine`, `SaavnApiClient`, `Redux Store`, `Player`. Highlight synchronous vs async messages and error alternative fragment.

---

## 11. Communication Diagram

Represent the same AutoMix interaction as numbered messages between objects:
1. `User` → `HomePage`: `startAutoMix()`.
2. `HomePage` → `AutoMix API`: `POST /api/autoMix`.
3. `AutoMix API` → `AutoMixEngine`: `generateQueue(mood, activity)`.
4. `AutoMixEngine` → `SaavnApiClient`: `search(query)` and `normalize(results)` (message 4a/4b).
5. `AutoMix API` → `HomePage`: `AutoMixResponse`.
6. `HomePage` → `Redux Store`: `dispatch(setActiveSong)` etc.
7. `Redux Store` → `Player`: `state update`.
This diagram emphasizes object relationships and ordered messages instead of lifeline timing.

---

## 12. Interaction Overview Diagram

Top-level view of a **full listening session**:
- Initial node → `Authenticate fragment` (referencing a miniature sequence diagram) → decision `Auth success?`.
- If success: `Load home modules fragment` → `Parallel region` containing `Manual Song Play` fragment and `AutoMix fragment` (reference sequence diagram #10).
- After either fragment completes, flow joins at `Playback Controls fragment` (covers loops for play/pause/skip) → final node.
- Error paths (e.g., `Saavn failure`) lead to `Show fallback UI fragment` before final node.

---

## 13. Timing Diagram

Use tracks `Player`, `Redux Store`, `Audio Element`, `UI` along the Y-axis; X-axis is time after AutoMix start:
- `t0`: `HomePage` dispatches `setActiveSong`; store updates at `t0+Δ`.
- `t1`: `Player` receives new props, sets `audio.src`.
- `t2`: `Audio Element` fires `loadeddata`; `Player` dispatches `playPause(true)`.
- `t3`: `UI` updates progress bar every second while `Audio Element` emits `timeupdate` events.
- `t4`: `Audio Element` fires `ended`; `Player` dispatches `handleNextSong`, loops back to `t1`.
Include timing constraints (e.g., `buffering ≤ 3s` SLA) and note concurrency between UI updates and audio playback.

---

## 14. Profile Diagram

Define BeatBox-specific stereotypes for future modelling:
- `«NextRoute»` extends UML `Component`, tagged values: `path`, `method`, `authRequired`.
- `«SaavnIntegration»` extends `Interface`, tag `endpoint`.
- `«ReduxSlice»` extends `Class`, tags `namespace`, `actions[]`.
- `«ExternalService»` extends `Node`, tags `provider`, `protocol`.

Show profile package with these stereotypes and their base metaclasses so modelers can annotate upcoming diagrams consistently.

---

Use these 14 descriptions as prompts for generating formal UML diagrams tailored to BeatBox.
