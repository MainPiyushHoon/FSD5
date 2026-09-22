# Room Management System Design Specification

## Overview
A lightweight, efficient Room Management System built with the MERN stack (Node.js, Express, React, Vite) using structured JSON file storage instead of an external database. The system enables users to manage buildings, floors, and rooms, and query room availability at any given timestamp with full tracking of occupancy windows ("Occupied Since" and "Occupied Until").

---

## Room Code Convention
All room identifiers strictly follow the format:
`<bldInitials><floorNo><RoomNo>`
* `bldInitials`: Uppercase initials or short code of the building (e.g., `KC` for Kautilya Complex).
* `floorNo`: Integer floor number (e.g., `1`, `2`).
* `RoomNo`: Zero-padded 2-digit room number on that floor (e.g., `01`, `05`, `12`).
* **Example**: Room 5 on Floor 1 of Building KC is **`KC105`**.

---

## Architecture & Tech Stack

1. **Backend**:
   - **Runtime**: Node.js (v24+)
   - **Framework**: Express.js
   - **Data Storage**: JSON file database (`server/data/db.json`) with an atomic file-writing utility (`fs.promises` with locking/safe write).
   - **Port**: `http://localhost:5000`

2. **Frontend**:
   - **Framework**: React 19 / Vite
   - **Styling**: Modern Vanilla CSS with design tokens, glassmorphic cards, responsive grid, and clear color coding (🟢 Available: `#10b981`, 🔴 Occupied: `#ef4444`).
   - **Port**: `http://localhost:5173`

---

## Data Model (`server/data/db.json`)

```json
{
  "buildings": [
    {
      "id": "bld_kc",
      "name": "Kautilya Complex",
      "code": "KC",
      "floors": [
        {
          "id": "flr_kc_1",
          "floorNumber": 1,
          "name": "Floor 1"
        }
      ]
    }
  ],
  "rooms": [
    {
      "id": "room_kc_105",
      "buildingId": "bld_kc",
      "buildingCode": "KC",
      "floorId": "flr_kc_1",
      "floorNumber": 1,
      "roomIndex": 5,
      "roomCode": "KC105",
      "occupancy": {
        "isOccupied": true,
        "occupiedSince": "2026-09-22T08:00:00.000Z",
        "occupiedUntil": "2026-09-22T14:00:00.000Z",
        "occupiedBy": "Team Design Sync",
        "purpose": "Sprint Planning"
      }
    }
  ]
}
```

---

## Availability Query Logic
When a query is received for timestamp $T$ (defaults to system current time):
1. A room is considered **Occupied** at time $T$ if and only if:
   - `occupancy.isOccupied == true`, and
   - `occupancy.occupiedSince <= T <= occupancy.occupiedUntil`
2. If $T < \text{occupiedSince}$ or $T > \text{occupiedUntil}$, the room is treated as **Available** at query time $T$.
3. When displaying the room card:
   - Status: Available or Occupied.
   - If occupied at time $T$, display `Occupied Since` ($T_{\text{start}}$) and `Occupied Till` ($T_{\text{end}}$) with occupant details.
   - If available at time $T$, show "Available" with one-click occupy action.

---

## API Endpoints

### Buildings & Floors
- `GET /api/buildings`
  - Returns list of all buildings including their nested floors.
- `POST /api/buildings`
  - Body: `{ "name": "Kautilya Complex", "code": "KC" }`
  - Returns created building.
- `POST /api/buildings/:id/floors`
  - Body: `{ "floorNumber": 1, "name": "Floor 1" }`
  - Returns updated building with new floor.

### Rooms
- `GET /api/rooms?buildingId=&floorId=&queryTime=`
  - Returns rooms filtered by building and floor, with evaluated status at `queryTime`.
- `POST /api/rooms/batch`
  - Generates rooms automatically on a floor.
  - Body: `{ "buildingId": "bld_kc", "floorId": "flr_kc_1", "totalRooms": 10 }`
  - Auto-generates rooms with room codes from `KC101` to `KC110`.
- `POST /api/rooms`
  - Body: `{ "buildingId": "bld_kc", "floorId": "flr_kc_1", "roomIndex": 5 }`
  - Creates single room with code `KC105`.
- `POST /api/rooms/:id/occupy`
  - Body: `{ "occupiedSince": "...", "occupiedUntil": "...", "occupiedBy": "...", "purpose": "..." }`
  - Sets room occupancy window.
- `POST /api/rooms/:id/vacate`
  - Clears the active occupancy window immediately.

---

## UI Components & Workflow

1. **Dashboard Header & Filters**:
   - Building dropdown (All / specific building).
   - Floor dropdown (All / specific floor).
   - Query Time Picker:
     - "Now (Live)" toggle button.
     - Custom Date & Time selector.
   - Live KPI chips: Total Rooms, Available, Occupied.
   - "Add Structure" button (opens Building/Floor/Room creation modal).

2. **Room Cards Grid**:
   - Visual grid of room cards with room code prominently displayed (e.g., **KC105**).
   - Status badge (🟢 Available / 🔴 Occupied).
   - Time info: Occupied Since & Occupied Until.
   - Occupant name / purpose.
   - Action buttons: "Check In / Occupy", "Vacate Now", "Edit Occupancy".

3. **Modals**:
   - **Occupy Room Modal**: Datetime inputs for since and until, occupant name, submit action.
   - **Add Building / Floor / Room Wizard**:
     - Step 1: Add Building (Name & Initials e.g., `KC`).
     - Step 2: Add Floor (e.g., Floor 1).
     - Step 3: Add Total Rooms (e.g., 5 rooms -> auto-creates `KC101` to `KC105`).

---

## Error Handling & Reliability
- Validate start time < end time for occupancy.
- Ensure room codes are unique within the system.
- Atomic file writes using a helper to prevent partial writes or corrupt JSON data.
- Sample initial seed data provided so the app is immediately usable upon first launch.
