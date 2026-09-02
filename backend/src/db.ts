import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'troviet.db');

<<<<<<< HEAD
// Initialize schema
export function initDB() {
  // Add columns if table already existed without new fields
  try {
    const tableInfo = db.prepare("PRAGMA table_info(contracts)").all() as any[];
    const columnNames = tableInfo.map(c => c.name);
    if (columnNames.length > 0) {
      if (!columnNames.includes('token')) db.exec("ALTER TABLE contracts ADD COLUMN token TEXT");
      if (!columnNames.includes('status')) db.exec("ALTER TABLE contracts ADD COLUMN status TEXT DEFAULT 'draft'");
      if (!columnNames.includes('deposit_status')) db.exec("ALTER TABLE contracts ADD COLUMN deposit_status TEXT DEFAULT 'unpaid'");
      if (!columnNames.includes('landlord_signature')) db.exec("ALTER TABLE contracts ADD COLUMN landlord_signature TEXT");
      if (!columnNames.includes('tenant_signature')) db.exec("ALTER TABLE contracts ADD COLUMN tenant_signature TEXT");
      if (!columnNames.includes('signed_at')) db.exec("ALTER TABLE contracts ADD COLUMN signed_at DATETIME");
      if (!columnNames.includes('vietqr_url')) db.exec("ALTER TABLE contracts ADD COLUMN vietqr_url TEXT");
      if (!columnNames.includes('pccc_agreed')) db.exec("ALTER TABLE contracts ADD COLUMN pccc_agreed INTEGER DEFAULT 1");
      if (!columnNames.includes('rules_agreed')) db.exec("ALTER TABLE contracts ADD COLUMN rules_agreed INTEGER DEFAULT 1");
    }
  } catch (err) {
    // Ignore migration error on first run
  }

=======
class PureSqliteDB {
  private rawDb: any = null;
  private isReady = false;

  async init() {
    if (this.isReady) return;
    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      this.rawDb = new SQL.Database(fileBuffer);
    } else {
      this.rawDb = new SQL.Database();
      this.persist();
    }
    this.isReady = true;
  }

  persist() {
    if (!this.rawDb) return;
    try {
      const data = this.rawDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  pragma(cmd: string) {
    // No-op for WASM SQLite
  }

  transaction(fn: Function) {
    const self = this;
    return function (...args: any[]) {
      self.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        self.exec('COMMIT');
        return result;
      } catch (err) {
        self.exec('ROLLBACK');
        throw err;
      }
    };
  }

  exec(sql: string) {
    this.rawDb.exec(sql);
    this.persist();
  }

  prepare(sql: string) {
    const self = this;
    return {
      all(...params: any[]) {
        const stmt = self.rawDb.prepare(sql);
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        stmt.bind(p);
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params: any[]) {
        const stmt = self.rawDb.prepare(sql);
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        stmt.bind(p);
        let result: any = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run(...params: any[]) {
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        self.rawDb.run(sql, p);
        self.persist();
        const lastId = self.rawDb.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0;
        return {
          lastInsertRowid: Number(lastId),
          changes: 1
        };
      }
    };
  }
}

export const db = new PureSqliteDB();

export async function initDB() {
  await db.init();

>>>>>>> main
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
      token TEXT UNIQUE,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      deposit_amount INTEGER NOT NULL,
      deposit_status TEXT CHECK(deposit_status IN ('unpaid', 'paid')) DEFAULT 'unpaid',
      status TEXT CHECK(status IN ('draft', 'sent', 'signed', 'completed', 'cancelled')) DEFAULT 'draft',
      landlord_signature TEXT,
      tenant_signature TEXT,
      signed_at DATETIME,
      vietqr_url TEXT,
      pccc_agreed INTEGER DEFAULT 1,
      rules_agreed INTEGER DEFAULT 1,
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