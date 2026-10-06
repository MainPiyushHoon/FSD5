import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentDbPath = path.join(__dirname, '..', 'data', 'db.json');

// Helper to ensure data directory and file exist
export async function initDb(customPath) {
  if (customPath) {
    currentDbPath = customPath;
  }
  const dir = path.dirname(currentDbPath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(currentDbPath);
  } catch {
    const initialData = { buildings: [], rooms: [] };
    await fs.writeFile(currentDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
  return currentDbPath;
}

// Read database
export async function getDb() {
  await initDb();
  const raw = await fs.readFile(currentDbPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing JSON db, resetting to empty state:', err);
    return { buildings: [], rooms: [] };
  }
}

// Atomic file write to avoid corrupted JSON
export async function saveDb(data) {
  const dir = path.dirname(currentDbPath);
  const tempPath = path.join(dir, `db-temp-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, currentDbPath);
}

// Format room code per convention: <bldInitials><floorNo><RoomNo> (e.g. KC105)
export function formatRoomCode(buildingCode, floorNumber, roomIndex) {
  const bld = (buildingCode || '').trim().toUpperCase();
  const flr = parseInt(floorNumber, 10);
  const room = String(roomIndex).padStart(2, '0');
  return `${bld}${flr}${room}`;
}

// Buildings
export async function getBuildings() {
  const db = await getDb();
  return db.buildings || [];
}

export async function addBuilding({ name, code }) {
  if (!name || !code) {
    throw new Error('Building name and code (initials) are required');
  }
  const db = await getDb();
  const cleanCode = code.trim().toUpperCase();

  // Check unique code
  if (db.buildings.some(b => b.code.toUpperCase() === cleanCode)) {
    throw new Error(`Building code "${cleanCode}" already exists`);
  }

  const newBuilding = {
    id: `bld_${cleanCode.toLowerCase()}_${Date.now()}`,
    name: name.trim(),
    code: cleanCode,
    floors: []
  };

  db.buildings.push(newBuilding);
  await saveDb(db);
  return newBuilding;
}

export async function addFloor(buildingId, { floorNumber, name }) {
  const db = await getDb();
  const building = db.buildings.find(b => b.id === buildingId);
  if (!building) {
    throw new Error(`Building not found: ${buildingId}`);
  }

  const flrNum = parseInt(floorNumber, 10);
  if (isNaN(flrNum)) {
    throw new Error('Valid floor number is required');
  }

  if (building.floors.some(f => f.floorNumber === flrNum)) {
    throw new Error(`Floor ${flrNum} already exists in ${building.name}`);
  }

  const newFloor = {
    id: `flr_${building.code.toLowerCase()}_${flrNum}`,
    floorNumber: flrNum,
    name: name ? name.trim() : `Floor ${flrNum}`
  };

  building.floors.push(newFloor);
  // Sort floors sequentially
  building.floors.sort((a, b) => a.floorNumber - b.floorNumber);

  await saveDb(db);
  return newFloor;
}

// Rooms
export async function addRoomsBatch({ buildingId, floorId, totalRooms }) {
  const db = await getDb();
  const building = db.buildings.find(b => b.id === buildingId);
  if (!building) throw new Error('Building not found');

  const floor = building.floors.find(f => f.id === floorId);
  if (!floor) throw new Error('Floor not found');

  const count = parseInt(totalRooms, 10);
  if (isNaN(count) || count < 1) {
    throw new Error('Total rooms must be at least 1');
  }

  // Find existing rooms on this floor to determine next roomIndex
  const existingFloorRooms = db.rooms.filter(
    r => r.buildingId === buildingId && r.floorId === floorId
  );
  let nextIndex = 1;
  if (existingFloorRooms.length > 0) {
    const maxIdx = Math.max(...existingFloorRooms.map(r => r.roomIndex || 0));
    nextIndex = maxIdx + 1;
  }

  const createdRooms = [];
  for (let i = 0; i < count; i++) {
    const roomIndex = nextIndex + i;
    const roomCode = formatRoomCode(building.code, floor.floorNumber, roomIndex);

    // Ensure no duplicate room code
    if (db.rooms.some(r => r.roomCode === roomCode)) {
      continue;
    }

    const newRoom = {
      id: `room_${roomCode.toLowerCase()}_${Date.now()}_${i}`,
      buildingId: building.id,
      buildingCode: building.code,
      buildingName: building.name,
      floorId: floor.id,
      floorNumber: floor.floorNumber,
      roomIndex,
      roomCode,
      occupancy: {
        isOccupied: false,
        occupiedSince: null,
        occupiedUntil: null,
        occupiedBy: null,
        purpose: null
      }
    };

    db.rooms.push(newRoom);
    createdRooms.push(newRoom);
  }

  await saveDb(db);
  return createdRooms;
}

export async function getRoomsWithStatus({ buildingId, floorId, queryTime } = {}) {
  const db = await getDb();
  const targetTime = queryTime ? new Date(queryTime) : new Date();
  const targetIso = targetTime.toISOString();

  let rooms = db.rooms;

  if (buildingId) {
    rooms = rooms.filter(r => r.buildingId === buildingId);
  }
  if (floorId) {
    rooms = rooms.filter(r => r.floorId === floorId);
  }

  return rooms.map(room => {
    const occ = room.occupancy || {};
    let isOccupiedAtQueryTime = false;

    if (occ.isOccupied && occ.occupiedSince && occ.occupiedUntil) {
      const since = new Date(occ.occupiedSince).toISOString();
      const until = new Date(occ.occupiedUntil).toISOString();
      if (targetIso >= since && targetIso <= until) {
        isOccupiedAtQueryTime = true;
      }
    }

    return {
      ...room,
      status: isOccupiedAtQueryTime ? 'Occupied' : 'Available',
      isOccupiedAtQueryTime,
      evaluatedAt: targetIso
    };
  });
}

export async function setRoomOccupancy(roomId, { occupiedSince, occupiedUntil, occupiedBy, purpose }) {
  if (!occupiedSince || !occupiedUntil) {
    throw new Error('Both occupiedSince and occupiedUntil timestamps are required');
  }

  const startDate = new Date(occupiedSince);
  const endDate = new Date(occupiedUntil);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date/time format provided');
  }
  if (endDate <= startDate) {
    throw new Error('Occupied Until time must be after Occupied Since time');
  }

  const db = await getDb();
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    throw new Error(`Room not found: ${roomId}`);
  }

  room.occupancy = {
    isOccupied: true,
    occupiedSince: startDate.toISOString(),
    occupiedUntil: endDate.toISOString(),
    occupiedBy: (occupiedBy || 'Reserved').trim(),
    purpose: (purpose || '').trim()
  };

  await saveDb(db);
  return room;
}

export async function vacateRoom(roomId) {
  const db = await getDb();
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    throw new Error(`Room not found: ${roomId}`);
  }

  room.occupancy = {
    isOccupied: false,
    occupiedSince: null,
    occupiedUntil: null,
    occupiedBy: null,
    purpose: null
  };

  await saveDb(db);
  return room;
}
