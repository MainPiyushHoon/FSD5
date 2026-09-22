# Room Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple, robust full-stack Room Management System using Node.js/Express with JSON file storage on the backend and Vite + React on the frontend, featuring room code naming `<bldInitials><floorNo><RoomNo>`, dynamic query-time availability checking, and occupancy window tracking.

**Architecture:** A lightweight Express backend reads/writes atomically to `server/data/db.json` and evaluates availability dynamically based on requested query time ($T$). The React frontend provides a visual interactive dashboard with Building/Floor filtering, a Query Time controller (Live "Now" vs custom time), a room grid with status pills, and fast modals to manage occupancy and add buildings, floors, and rooms.

**Tech Stack:** Node.js, Express, `node:fs/promises`, React 19, Vite, Vanilla CSS.

## Global Constraints
- Room Code naming rule: `<bldInitials><floorNo><RoomNo>` (e.g., Building `KC`, Floor `1`, Room `5` -> `KC105`).
- Database: JSON file storage (`server/data/db.json`) instead of external DB server.
- Availability Logic: Room is Occupied at query time $T$ if and only if `occupiedSince <= T <= occupiedUntil` and `isOccupied == true`.
- Zero placeholder code; test before and after each implementation step.

---

### Task 1: Backend Storage Engine & Data Models

**Files:**
- Create: `server/package.json`
- Create: `server/src/db.js`
- Create: `server/data/db.json`
- Test: `server/tests/db.test.js`

**Interfaces:**
- Produces:
  - `getDb(): Promise<{ buildings: Building[], rooms: Room[] }>`
  - `saveDb(data): Promise<void>`
  - `getBuildings(): Promise<Building[]>`
  - `addBuilding({ name, code }): Promise<Building>`
  - `addFloor(buildingId, { floorNumber, name }): Promise<Floor>`
  - `getRooms(filters: { buildingId?, floorId?, queryTime? }): Promise<RoomWithStatus[]>`
  - `addRoomsBatch({ buildingId, floorId, totalRooms }): Promise<Room[]>`
  - `setRoomOccupancy(roomId, { occupiedSince, occupiedUntil, occupiedBy, purpose }): Promise<Room>`
  - `vacateRoom(roomId): Promise<Room>`

- [ ] **Step 1: Scaffolding server package.json & dependencies**
Initialize `server/package.json` with `express`, `cors`, and `nodemon`/`mocha`/built-in node test runner.

- [ ] **Step 2: Write failing unit test for DB module**
Write `server/tests/db.test.js` covering room code generation (`KC105`), query time availability calculation (`since <= T <= until`), building & floor addition, and atomic JSON persistence.

- [ ] **Step 3: Run test to verify failure**
Run: `node --test server/tests/db.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 4: Implement `server/src/db.js` with atomic file I/O & business logic**
Implement JSON read/write with error handling, room code formatter `${buildingCode}${floorNumber}${String(roomIndex).padStart(2, '0')}`, and query-time evaluator.

- [ ] **Step 5: Run test to verify it passes**
Run: `node --test server/tests/db.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add server/
git commit -m "feat(backend): add json storage engine and availability logic"
```

---

### Task 2: Backend REST API Endpoints & Seed Data

**Files:**
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/src/seed.js`
- Test: `server/tests/api.test.js`

**Interfaces:**
- Consumes: `server/src/db.js`
- Produces: REST endpoints on `http://localhost:5000`:
  - `GET /api/buildings`
  - `POST /api/buildings`
  - `POST /api/buildings/:id/floors`
  - `GET /api/rooms` (supports query params `?buildingId=&floorId=&queryTime=`)
  - `POST /api/rooms/batch`
  - `POST /api/rooms/:id/occupy`
  - `POST /api/rooms/:id/vacate`
  - `POST /api/seed`

- [ ] **Step 1: Write API tests**
Write `server/tests/api.test.js` testing HTTP endpoints for listing buildings, querying rooms with `queryTime`, occupying a room, vacating a room, and generating rooms batch.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test server/tests/api.test.js`
Expected: FAIL (server/app not found).

- [ ] **Step 3: Implement `server/src/app.js` and `server/src/server.js`**
Setup Express with JSON body parser, CORS middleware, error handlers, and router endpoints. Implement `server/src/seed.js` with initial sample data (e.g. Building "Kautilya Complex" code "KC", Floor 1, rooms KC101-KC105 with KC105 occupied).

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test server/tests/api.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add server/
git commit -m "feat(backend): implement REST API routes and seed data"
```

---

### Task 3: Frontend Scaffolding & Design System

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/src/index.css`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`

**Interfaces:**
- Design tokens: CSS variables for colors (`--bg-primary`, `--bg-card`, `--accent-green`, `--accent-red`, `--border`, `--text-main`, `--text-muted`).
- Typography: Inter/Outfit with clean modern font hierarchy.

- [ ] **Step 1: Initialize Vite React client**
Set up `client` directory with Vite, React 19, and script commands.

- [ ] **Step 2: Create CSS design system**
Implement `client/src/index.css` with responsive layout, custom buttons, glassmorphic card styling, badge styles, inputs, and modal animations.

- [ ] **Step 3: Verify build and dev runner**
Run: `npm --prefix client run build`
Expected: Clean build without errors.

- [ ] **Step 4: Commit**
```bash
git add client/
git commit -m "feat(frontend): scaffold vite react app and modern design system"
```

---

### Task 4: Frontend API Layer & Dashboard State Management

**Files:**
- Create: `client/src/services/api.js`
- Create: `client/src/hooks/useRoomManager.js`
- Test: `client/src/services/api.test.js` (or node verification script)

**Interfaces:**
- Produces:
  - `fetchBuildings()`
  - `createBuilding({ name, code })`
  - `createFloor(buildingId, { floorNumber, name })`
  - `fetchRooms({ buildingId, floorId, queryTime })`
  - `createRoomsBatch({ buildingId, floorId, totalRooms })`
  - `occupyRoom(roomId, { occupiedSince, occupiedUntil, occupiedBy, purpose })`
  - `vacateRoom(roomId)`
  - `useRoomManager()` hook with state (`buildings`, `rooms`, `selectedBuilding`, `selectedFloor`, `queryTime`, `isLive`, `stats`, actions)

- [ ] **Step 1: Implement `client/src/services/api.js`**
Write clean fetch wrapper with error handling and query parameter formatting.

- [ ] **Step 2: Implement `client/src/hooks/useRoomManager.js`**
Centralized state management hook that handles data fetching, auto-refresh when in "Live (Now)" mode, filter updates, and action dispatches.

- [ ] **Step 3: Verify API and Hook integration**
Verify compilation and types via client build.

- [ ] **Step 4: Commit**
```bash
git add client/src/services client/src/hooks
git commit -m "feat(frontend): implement api client and room manager state hook"
```

---

### Task 5: Control Bar, Query Time Controller & Stats Components

**Files:**
- Create: `client/src/components/Navbar.jsx`
- Create: `client/src/components/ControlBar.jsx`
- Create: `client/src/components/StatsBar.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `useRoomManager` hook state and handlers.
- Produces:
  - Responsive top navbar with live status indicator.
  - Building and Floor filter dropdowns with "All" option.
  - Datetime picker for `queryTime` with "Now (Live)" toggle.
  - Summary badges: Total Rooms, Available (🟢), Occupied (🔴).
  - Quick action button to open "Add Building / Floor / Room" dialog.

- [ ] **Step 1: Implement `Navbar.jsx` and `StatsBar.jsx`**
Build aesthetic branding header with live indicator and metric counter cards with icons.

- [ ] **Step 2: Implement `ControlBar.jsx`**
Build building/floor selectors and the Query Time controller with live mode toggle and custom date-time input.

- [ ] **Step 3: Connect components into `App.jsx` and verify build**
Run: `npm --prefix client run build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add client/src/components client/src/App.jsx
git commit -m "feat(frontend): implement navbar, control bar, and stats components"
```

---

### Task 6: Visual Room Grid & Room Cards with Status Badges

**Files:**
- Create: `client/src/components/RoomGrid.jsx`
- Create: `client/src/components/RoomCard.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `rooms`, `onOccupyClick(room)`, `onVacateClick(room)`.
- Produces:
  - Grid of cards displaying Room Code (`KC105`), Building initials, Floor number.
  - Status pill: 🟢 Available / 🔴 Occupied.
  - Detailed occupancy info when occupied: "Occupied Since", "Occupied Until", "Occupant".
  - One-click action buttons: "Occupy" or "Vacate".

- [ ] **Step 1: Implement `RoomCard.jsx`**
Card with polished typography, status badge, formatted time strings (`toLocaleTimeString` / date), and action buttons.

- [ ] **Step 2: Implement `RoomGrid.jsx`**
Responsive grid container with empty state illustration if no rooms match filters.

- [ ] **Step 3: Integrate into `App.jsx` and verify build**
Run: `npm --prefix client run build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add client/src/components/RoomCard.jsx client/src/components/RoomGrid.jsx client/src/App.jsx
git commit -m "feat(frontend): implement visual room grid and status cards"
```

---

### Task 7: Interactive Modals (Occupy/Vacate & Structure Wizard)

**Files:**
- Create: `client/src/components/OccupyModal.jsx`
- Create: `client/src/components/StructureModal.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: Modal trigger state and mutations from `useRoomManager`.
- Produces:
  - `OccupyModal`: Room occupancy form with start datetime, end datetime, occupant name, and purpose.
  - `StructureModal`: Tabbed wizard:
    - Tab 1: Add Building (Name & Initials e.g. "Kautilya Complex", "KC").
    - Tab 2: Add Floor (Building select, Floor number).
    - Tab 3: Add Rooms (Building & Floor select, Total Rooms to auto-create with room code preview like `KC101` - `KC105`).

- [ ] **Step 1: Implement `OccupyModal.jsx`**
Form with validation: `occupiedUntil` must be after `occupiedSince`, occupant name, confirmation and cancel buttons.

- [ ] **Step 2: Implement `StructureModal.jsx`**
3-tab interface for adding buildings, adding floors, and batch generating rooms with live code preview.

- [ ] **Step 3: Integrate modals into `App.jsx` and verify build**
Run: `npm --prefix client run build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add client/src/components/OccupyModal.jsx client/src/components/StructureModal.jsx client/src/App.jsx
git commit -m "feat(frontend): implement occupy room modal and structure creation wizard"
```

---

### Task 8: Full End-to-End System Integration & Verification

**Files:**
- Create: `package.json` (root orchestrator script for concurrently running backend and frontend)
- Create: `README.md`
- Test: Verification of all user flows via curl & subagent browser test

- [ ] **Step 1: Setup root `package.json`**
Add scripts `"start"`, `"dev"`, `"server"`, `"client"` to run both frontend and backend seamlessly.

- [ ] **Step 2: Start backend and frontend servers**
Run both processes and verify ports 5000 and 5173 respond.

- [ ] **Step 3: Perform end-to-end user workflow test**
1. Check initial rooms (`KC101` to `KC105`).
2. Query at current time -> verify KC105 shows occupied with since/till.
3. Query at a time before KC105's occupiedSince -> verify KC105 shows available.
4. Occupy room KC101 from now until +3 hours -> verify status updates to occupied.
5. Vacate room KC101 -> verify status returns to available.
6. Create new building "Aryabhata Hall" ("AH"), Floor 2, 3 rooms -> verify `AH201`, `AH202`, `AH203` are created and displayed.

- [ ] **Step 4: Commit & Walkthrough Documentation**
```bash
git add .
git commit -m "feat: complete room management system with full test coverage"
```
