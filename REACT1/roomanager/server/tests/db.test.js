import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initDb,
  getDb,
  formatRoomCode,
  addBuilding,
  addFloor,
  addRoomsBatch,
  getRoomsWithStatus,
  setRoomOccupancy,
  vacateRoom
} from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.join(__dirname, 'test-db.json');

test('DB Module & Availability Logic', async (t) => {
  // Setup isolated test database file
  await fs.writeFile(testDbPath, JSON.stringify({ buildings: [], rooms: [] }, null, 2));

  t.after(async () => {
    try {
      await fs.unlink(testDbPath);
    } catch {}
  });

  await t.test('formatRoomCode creates standard code <bldInitials><floorNo><RoomNo>', () => {
    const code1 = formatRoomCode('KC', 1, 5);
    assert.equal(code1, 'KC105');

    const code2 = formatRoomCode('KC', 2, 12);
    assert.equal(code2, 'KC212');

    const code3 = formatRoomCode('ah', 3, 1);
    assert.equal(code3, 'AH301');
  });

  await t.test('addBuilding and addFloor structure data correctly', async () => {
    await initDb(testDbPath);

    const building = await addBuilding({ name: 'Kautilya Complex', code: 'KC' });
    assert.ok(building.id);
    assert.equal(building.code, 'KC');

    const floor = await addFloor(building.id, { floorNumber: 1, name: 'Ground Floor' });
    assert.ok(floor.id);
    assert.equal(floor.floorNumber, 1);

    const db = await getDb();
    assert.equal(db.buildings.length, 1);
    assert.equal(db.buildings[0].floors.length, 1);
  });

  await t.test('addRoomsBatch generates sequential rooms with proper codes', async () => {
    const db = await getDb();
    const building = db.buildings[0];
    const floor = building.floors[0];

    const createdRooms = await addRoomsBatch({
      buildingId: building.id,
      floorId: floor.id,
      totalRooms: 5
    });

    assert.equal(createdRooms.length, 5);
    assert.equal(createdRooms[0].roomCode, 'KC101');
    assert.equal(createdRooms[4].roomCode, 'KC105');
  });

  await t.test('occupancy window and query time availability', async () => {
    const db = await getDb();
    const room = db.rooms.find(r => r.roomCode === 'KC105');
    assert.ok(room);

    // Occupy KC105 from 10:00 to 14:00 on 2026-09-22
    const since = '2026-09-22T10:00:00.000Z';
    const until = '2026-09-22T14:00:00.000Z';
    await setRoomOccupancy(room.id, {
      occupiedSince: since,
      occupiedUntil: until,
      occupiedBy: 'Prof. Sharma',
      purpose: 'Lab Lecture'
    });

    // Query before occupancy window: 09:00 -> should be Available
    const roomsBefore = await getRoomsWithStatus({ queryTime: '2026-09-22T09:00:00.000Z' });
    const kc105Before = roomsBefore.find(r => r.roomCode === 'KC105');
    assert.equal(kc105Before.status, 'Available');
    assert.equal(kc105Before.isOccupiedAtQueryTime, false);

    // Query inside occupancy window: 11:30 -> should be Occupied
    const roomsDuring = await getRoomsWithStatus({ queryTime: '2026-09-22T11:30:00.000Z' });
    const kc105During = roomsDuring.find(r => r.roomCode === 'KC105');
    assert.equal(kc105During.status, 'Occupied');
    assert.equal(kc105During.isOccupiedAtQueryTime, true);
    assert.equal(kc105During.occupancy.occupiedBy, 'Prof. Sharma');

    // Query after occupancy window: 15:00 -> should be Available
    const roomsAfter = await getRoomsWithStatus({ queryTime: '2026-09-22T15:00:00.000Z' });
    const kc105After = roomsAfter.find(r => r.roomCode === 'KC105');
    assert.equal(kc105After.status, 'Available');
    assert.equal(kc105After.isOccupiedAtQueryTime, false);

    // Vacate KC105 immediately
    await vacateRoom(room.id);
    const roomsVacated = await getRoomsWithStatus({ queryTime: '2026-09-22T11:30:00.000Z' });
    const kc105Vacated = roomsVacated.find(r => r.roomCode === 'KC105');
    assert.equal(kc105Vacated.status, 'Available');
    assert.equal(kc105Vacated.isOccupiedAtQueryTime, false);
  });
});
