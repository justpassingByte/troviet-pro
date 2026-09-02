import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'troviet.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      total_floors INTEGER DEFAULT 1,
      bank_id TEXT DEFAULT 'MBBank',
      bank_account TEXT DEFAULT '0988888888',
      bank_owner TEXT DEFAULT 'NGUYEN VAN A',
      default_electric_rate INTEGER DEFAULT 3500,
      default_water_rate INTEGER DEFAULT 30000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      room_number TEXT NOT NULL,
      floor INTEGER DEFAULT 1,
      base_price INTEGER NOT NULL DEFAULT 3500000,
      deposit INTEGER NOT NULL DEFAULT 3500000,
      status TEXT CHECK(status IN ('available', 'occupied', 'maintenance')) DEFAULT 'available',
      area REAL DEFAULT 25.0,
      description TEXT,
      electricity_rate INTEGER DEFAULT 3500,
      water_rate INTEGER DEFAULT 30000,
      wifi_fee INTEGER DEFAULT 100000,
      trash_fee INTEGER DEFAULT 50000,
      cleaning_fee INTEGER DEFAULT 30000,
      parking_fee INTEGER DEFAULT 100000,
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      identity_card TEXT,
      hometown TEXT,
      license_plate TEXT,
      start_date TEXT,
      end_date TEXT,
      members_count INTEGER DEFAULT 1,
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS meter_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      old_electric INTEGER NOT NULL DEFAULT 0,
      new_electric INTEGER NOT NULL DEFAULT 0,
      old_water INTEGER NOT NULL DEFAULT 0,
      new_water INTEGER NOT NULL DEFAULT 0,
      electric_usage INTEGER NOT NULL DEFAULT 0,
      water_usage INTEGER NOT NULL DEFAULT 0,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      UNIQUE(room_id, month, year)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_code TEXT UNIQUE NOT NULL,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      room_fee INTEGER NOT NULL DEFAULT 0,
      electric_usage INTEGER DEFAULT 0,
      electric_rate INTEGER DEFAULT 3500,
      electric_fee INTEGER NOT NULL DEFAULT 0,
      water_usage INTEGER DEFAULT 0,
      water_rate INTEGER DEFAULT 30000,
      water_fee INTEGER NOT NULL DEFAULT 0,
      wifi_fee INTEGER DEFAULT 0,
      trash_fee INTEGER DEFAULT 0,
      parking_fee INTEGER DEFAULT 0,
      other_fee INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,
      total_amount INTEGER NOT NULL,
      paid_amount INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('unpaid', 'paid', 'partial')) DEFAULT 'unpaid',
      payment_date TEXT,
      payment_method TEXT,
      vietqr_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_code TEXT UNIQUE NOT NULL,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      deposit_amount INTEGER NOT NULL,
      payment_cycle_days INTEGER DEFAULT 30,
      terms TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
