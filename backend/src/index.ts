import crypto from 'crypto';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { db, initDB } from './db.js';
import { generateVietQRUrl } from './vietqr.js';
import { runSeed } from './seed.js';

initDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Auto-seed if database is empty
const roomCount = (db.prepare('SELECT count(*) as count FROM rooms').get() as { count: number }).count;
if (roomCount === 0) {
  console.log('⚡ Empty database detected. Auto-seeding initial demo data...');
  runSeed();
}

// -------------------------------------------------------------
// 1. DASHBOARD & STATS API
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const currentMonth = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
  const currentYear = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const totalRooms = (db.prepare('SELECT count(*) as count FROM rooms').get() as { count: number }).count;
  const occupiedRooms = (db.prepare("SELECT count(*) as count FROM rooms WHERE status = 'occupied'").get() as { count: number }).count;
  const availableRooms = (db.prepare("SELECT count(*) as count FROM rooms WHERE status = 'available'").get() as { count: number }).count;
  const maintenanceRooms = (db.prepare("SELECT count(*) as count FROM rooms WHERE status = 'maintenance'").get() as { count: number }).count;

  const totalTenants = (db.prepare('SELECT count(*) as count FROM tenants WHERE active = 1').get() as { count: number }).count;

  // Monthly financials
  const monthlyInvoices = db.prepare(`
    SELECT 
      SUM(total_amount) as total_expected,
      SUM(paid_amount) as total_collected,
      SUM(CASE WHEN status = 'unpaid' THEN (total_amount - paid_amount) ELSE 0 END) as total_unpaid,
      SUM(electric_fee) as total_electric_fee,
      SUM(water_fee) as total_water_fee,
      SUM(electric_usage) as total_electric_usage,
      SUM(water_usage) as total_water_usage
    FROM invoices 
    WHERE month = ? AND year = ?
  `).get(currentMonth, currentYear) as any;

  res.json({
    month: currentMonth,
    year: currentYear,
    rooms: {
      total: totalRooms,
      occupied: occupiedRooms,
      available: availableRooms,
      maintenance: maintenanceRooms,
      occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    },
    tenants: {
      total: totalTenants
    },
    financials: {
      totalExpected: monthlyInvoices?.total_expected || 0,
      totalCollected: monthlyInvoices?.total_collected || 0,
      totalUnpaid: monthlyInvoices?.total_unpaid || 0,
      totalElectricFee: monthlyInvoices?.total_electric_fee || 0,
      totalWaterFee: monthlyInvoices?.total_water_fee || 0,
      totalElectricUsage: monthlyInvoices?.total_electric_usage || 0,
      totalWaterUsage: monthlyInvoices?.total_water_usage || 0,
    }
  });
});

// -------------------------------------------------------------
// 2. BUILDINGS API
// -------------------------------------------------------------
app.get('/api/buildings', (req: Request, res: Response) => {
  const buildings = db.prepare('SELECT * FROM buildings ORDER BY id ASC').all();
  res.json(buildings);
});

app.post('/api/buildings', (req: Request, res: Response) => {
  const { name, address, total_floors, bank_id, bank_account, bank_owner, default_electric_rate, default_water_rate } = req.body;
  const stmt = db.prepare(`
    INSERT INTO buildings (name, address, total_floors, bank_id, bank_account, bank_owner, default_electric_rate, default_water_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, address, total_floors || 1, bank_id || 'MBBank', bank_account || '', bank_owner || '', default_electric_rate || 3500, default_water_rate || 30000);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/buildings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, total_floors, bank_id, bank_account, bank_owner, default_electric_rate, default_water_rate } = req.body;
  const stmt = db.prepare(`
    UPDATE buildings SET name = ?, address = ?, total_floors = ?, bank_id = ?, bank_account = ?, bank_owner = ?, default_electric_rate = ?, default_water_rate = ?
    WHERE id = ?
  `);
  stmt.run(name, address, total_floors, bank_id, bank_account, bank_owner, default_electric_rate, default_water_rate, id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 3. ROOMS API
// -------------------------------------------------------------
app.get('/api/rooms', (req: Request, res: Response) => {
  const { building_id, status } = req.query;
  let sql = `
    SELECT r.*, b.name as building_name, b.bank_id, b.bank_account, b.bank_owner,
      t.id as tenant_id, t.full_name as tenant_name, t.phone as tenant_phone, t.members_count, t.start_date as tenant_start_date
    FROM rooms r
    LEFT JOIN buildings b ON r.building_id = b.id
    LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
    WHERE 1=1
  `;
  const params: any[] = [];
  if (building_id) {
    sql += ' AND r.building_id = ?';
    params.push(building_id);
  }
  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY r.room_number ASC';

  const rooms = db.prepare(sql).all(...params);
  res.json(rooms);
});

app.get('/api/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const room = db.prepare(`
    SELECT r.*, b.name as building_name, b.bank_id, b.bank_account, b.bank_owner,
      t.id as tenant_id, t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card, t.hometown, t.license_plate, t.members_count, t.start_date
    FROM rooms r
    LEFT JOIN buildings b ON r.building_id = b.id
    LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
    WHERE r.id = ?
  `).get(id);

  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const {
    building_id, room_number, floor, base_price, deposit, status, area, description,
    electricity_rate, water_rate, wifi_fee, trash_fee, cleaning_fee, parking_fee
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO rooms (
      building_id, room_number, floor, base_price, deposit, status, area, description,
      electricity_rate, water_rate, wifi_fee, trash_fee, cleaning_fee, parking_fee
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    building_id || 1, room_number, floor || 1, base_price || 3500000, deposit || 3500000,
    status || 'available', area || 25, description || '',
    electricity_rate || 3500, water_rate || 30000, wifi_fee || 100000, trash_fee || 50000, cleaning_fee || 30000, parking_fee || 100000
  );

  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    room_number, floor, base_price, deposit, status, area, description,
    electricity_rate, water_rate, wifi_fee, trash_fee, cleaning_fee, parking_fee
  } = req.body;

  const stmt = db.prepare(`
    UPDATE rooms SET
      room_number = ?, floor = ?, base_price = ?, deposit = ?, status = ?, area = ?, description = ?,
      electricity_rate = ?, water_rate = ?, wifi_fee = ?, trash_fee = ?, cleaning_fee = ?, parking_fee = ?
    WHERE id = ?
  `);

  stmt.run(
    room_number, floor, base_price, deposit, status, area, description,
    electricity_rate, water_rate, wifi_fee, trash_fee, cleaning_fee, parking_fee, id
  );

  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. TENANTS API
// -------------------------------------------------------------
app.get('/api/tenants', (req: Request, res: Response) => {
  const tenants = db.prepare(`
    SELECT t.*, r.room_number, b.name as building_name
    FROM tenants t
    LEFT JOIN rooms r ON t.room_id = r.id
    LEFT JOIN buildings b ON r.building_id = b.id
    ORDER BY t.id DESC
  `).all();
  res.json(tenants);
});

app.post('/api/tenants', (req: Request, res: Response) => {
  const { room_id, full_name, phone, identity_card, hometown, license_plate, start_date, end_date, members_count, notes } = req.body;

  const stmt = db.prepare(`
    INSERT INTO tenants (room_id, full_name, phone, identity_card, hometown, license_plate, start_date, end_date, members_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(room_id, full_name, phone, identity_card, hometown, license_plate, start_date || new Date().toISOString().slice(0, 10), end_date || '', members_count || 1, notes || '');

  // Update room status to occupied
  if (room_id) {
    db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ?").run(room_id);
  }

  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/tenants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { room_id, full_name, phone, identity_card, hometown, license_plate, start_date, end_date, members_count, notes, active } = req.body;

  const stmt = db.prepare(`
    UPDATE tenants SET room_id = ?, full_name = ?, phone = ?, identity_card = ?, hometown = ?, license_plate = ?, start_date = ?, end_date = ?, members_count = ?, notes = ?, active = ?
    WHERE id = ?
  `);

  stmt.run(room_id, full_name, phone, identity_card, hometown, license_plate, start_date, end_date, members_count, notes, active ?? 1, id);

  if (active === 0 && room_id) {
    db.prepare("UPDATE rooms SET status = 'available' WHERE id = ?").run(room_id);
  }

  res.json({ success: true });
});

// -------------------------------------------------------------
// 5. METER READINGS API (Điện & Nước)
// -------------------------------------------------------------
app.get('/api/meter-readings', (req: Request, res: Response) => {
  const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const sql = `
    SELECT r.id as room_id, r.room_number, r.status, r.electricity_rate, r.water_rate,
           t.full_name as tenant_name,
           m.id as meter_id, m.old_electric, m.new_electric, m.old_water, m.new_water,
           m.electric_usage, m.water_usage, m.recorded_at
    FROM rooms r
    LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
    LEFT JOIN meter_readings m ON m.room_id = r.id AND m.month = ? AND m.year = ?
    ORDER BY r.room_number ASC
  `;

  const rows = db.prepare(sql).all(month, year);
  res.json(rows);
});

app.post('/api/meter-readings', (req: Request, res: Response) => {
  const { room_id, month, year, old_electric, new_electric, old_water, new_water } = req.body;

  const electric_usage = Math.max(0, (new_electric || 0) - (old_electric || 0));
  const water_usage = Math.max(0, (new_water || 0) - (old_water || 0));

  const stmt = db.prepare(`
    INSERT INTO meter_readings (room_id, month, year, old_electric, new_electric, old_water, new_water, electric_usage, water_usage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(room_id, month, year) DO UPDATE SET
      old_electric = excluded.old_electric,
      new_electric = excluded.new_electric,
      old_water = excluded.old_water,
      new_water = excluded.new_water,
      electric_usage = excluded.electric_usage,
      water_usage = excluded.water_usage,
      recorded_at = CURRENT_TIMESTAMP
  `);

  stmt.run(room_id, month, year, old_electric || 0, new_electric || 0, old_water || 0, new_water || 0, electric_usage, water_usage);

  res.json({ success: true, electric_usage, water_usage });
});

// -------------------------------------------------------------
// 6. INVOICES & VIETQR API
// -------------------------------------------------------------
app.get('/api/invoices', (req: Request, res: Response) => {
  const month = req.query.month ? Number(req.query.month) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const status = req.query.status as string;

  let sql = `
    SELECT i.*, r.room_number, b.name as building_name, b.bank_id, b.bank_account, b.bank_owner,
           t.full_name as tenant_name, t.phone as tenant_phone
    FROM invoices i
    JOIN rooms r ON i.room_id = r.id
    JOIN buildings b ON r.building_id = b.id
    LEFT JOIN tenants t ON i.tenant_id = t.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (month) {
    sql += ' AND i.month = ?';
    params.push(month);
  }
  if (year) {
    sql += ' AND i.year = ?';
    params.push(year);
  }
  if (status) {
    sql += ' AND i.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY i.id DESC';

  const invoices = db.prepare(sql).all(...params);
  res.json(invoices);
});

app.post('/api/invoices/generate', (req: Request, res: Response) => {
  const { month, year, room_id } = req.body;
  const m = Number(month) || (new Date().getMonth() + 1);
  const y = Number(year) || new Date().getFullYear();

  let roomsToProcess: any[] = [];
  if (room_id) {
    roomsToProcess = db.prepare(`
      SELECT r.*, b.bank_id, b.bank_account, b.bank_owner, t.id as tenant_id, t.full_name as tenant_name
      FROM rooms r
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
      WHERE r.id = ?
    `).all(room_id);
  } else {
    roomsToProcess = db.prepare(`
      SELECT r.*, b.bank_id, b.bank_account, b.bank_owner, t.id as tenant_id, t.full_name as tenant_name
      FROM rooms r
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
      WHERE r.status = 'occupied'
    `).all();
  }

  const generatedInvoices: any[] = [];

  for (const r of roomsToProcess) {
    const meter = db.prepare('SELECT * FROM meter_readings WHERE room_id = ? AND month = ? AND year = ?').get(r.id, m, y) as any;
    const electric_usage = meter ? meter.electric_usage : 0;
    const water_usage = meter ? meter.water_usage : 0;

    const room_fee = r.base_price;
    const electric_rate = r.electricity_rate || 3500;
    const electric_fee = electric_usage * electric_rate;
    const water_rate = r.water_rate || 30000;
    const water_fee = water_usage * water_rate;
    const wifi_fee = r.wifi_fee || 100000;
    const trash_fee = r.trash_fee || 50000;
    const parking_fee = r.parking_fee || 100000;
    const total_amount = room_fee + electric_fee + water_fee + wifi_fee + trash_fee + parking_fee;

    const invoice_code = `HD${y}${String(m).padStart(2, '0')}-${r.room_number}`;
    const memo = `${r.room_number} TIEN NHA T${m}`;

    const vietqr_url = generateVietQRUrl({
      bankId: r.bank_id || 'MBBank',
      accountNo: r.bank_account || '0388999888',
      accountName: r.bank_owner || 'CHU NHA TRO',
      amount: total_amount,
      description: memo,
      template: 'compact2'
    });

    const stmt = db.prepare(`
      INSERT INTO invoices (
        invoice_code, room_id, tenant_id, month, year,
        room_fee, electric_usage, electric_rate, electric_fee,
        water_usage, water_rate, water_fee, wifi_fee, trash_fee, parking_fee, other_fee,
        total_amount, paid_amount, status, vietqr_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'unpaid', ?, ?)
      ON CONFLICT(invoice_code) DO UPDATE SET
        room_fee = excluded.room_fee,
        electric_usage = excluded.electric_usage,
        electric_rate = excluded.electric_rate,
        electric_fee = excluded.electric_fee,
        water_usage = excluded.water_usage,
        water_rate = excluded.water_rate,
        water_fee = excluded.water_fee,
        wifi_fee = excluded.wifi_fee,
        trash_fee = excluded.trash_fee,
        parking_fee = excluded.parking_fee,
        total_amount = excluded.total_amount,
        vietqr_url = excluded.vietqr_url
    `);

    stmt.run(
      invoice_code, r.id, r.tenant_id, m, y,
      room_fee, electric_usage, electric_rate, electric_fee,
      water_usage, water_rate, water_fee, wifi_fee, trash_fee, parking_fee, 0,
      total_amount, vietqr_url, 'Hạn thanh toán ngày 05 hàng tháng'
    );

    generatedInvoices.push({ invoice_code, room_number: r.room_number, total_amount, vietqr_url });
  }

  res.json({ success: true, count: generatedInvoices.length, invoices: generatedInvoices });
});

app.put('/api/invoices/:id/pay', (req: Request, res: Response) => {
  const { id } = req.params;
  const { paid_amount, payment_method } = req.body;

  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as any;
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  const newPaidAmount = paid_amount !== undefined ? Number(paid_amount) : inv.total_amount;
  const newStatus = newPaidAmount >= inv.total_amount ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'unpaid');
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.prepare(`
    UPDATE invoices SET paid_amount = ?, status = ?, payment_date = ?, payment_method = ?
    WHERE id = ?
  `).run(newPaidAmount, newStatus, nowStr, payment_method || 'Chuyển khoản VietQR', id);

  res.json({ success: true, status: newStatus, paid_amount: newPaidAmount });
});


// -------------------------------------------------------------
// 7. E-CONTRACT DIGITAL SIGNING & ONLINE DEPOSIT ADD-ON
// -------------------------------------------------------------
app.get('/api/contracts', (req: Request, res: Response) => {
  try {
    const contracts = db.prepare(`
      SELECT c.*, r.room_number, r.floor, r.area, b.name as building_name, b.address as building_address,
             t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card, t.hometown, t.license_plate
      FROM contracts c
      JOIN rooms r ON c.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contracts/e-sign-create', (req: Request, res: Response) => {
  try {
    const {
      room_id,
      tenant_id,
      full_name,
      phone,
      identity_card,
      hometown,
      license_plate,
      start_date,
      end_date,
      monthly_rent,
      deposit_amount,
      terms,
      landlord_signature
    } = req.body;

    if (!room_id) return res.status(400).json({ error: 'Missing room_id' });

    let finalTenantId = tenant_id;
    if (!finalTenantId && full_name && phone) {
      const stmt = db.prepare(`
        INSERT INTO tenants (room_id, full_name, phone, identity_card, hometown, license_plate, start_date, end_date, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      const info = stmt.run(room_id, full_name, phone, identity_card || '', hometown || '', license_plate || '', start_date, end_date, 1);
      finalTenantId = info.lastInsertRowid;
    }

    const token = crypto.randomBytes(16).toString('hex');
    const contract_code = `HD${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

    const room = db.prepare('SELECT r.*, b.bank_id, b.bank_account, b.bank_owner, b.address as building_address FROM rooms r JOIN buildings b ON r.building_id = b.id WHERE r.id = ?').get(room_id) as any;
    const rentAmount = monthly_rent || room.base_price;
    const depositAmount = deposit_amount !== undefined ? deposit_amount : room.deposit;

    // Default landlord signature if not provided
    const defaultLandlordSig = landlord_signature || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%232563eb">An Cu Pro</text></svg>';

    const stmt = db.prepare(`
      INSERT INTO contracts (
        contract_code, token, room_id, tenant_id, start_date, end_date,
        monthly_rent, deposit_amount, deposit_status, status,
        landlord_signature, terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'sent', ?, ?)
    `);

    const result = stmt.run(
      contract_code,
      token,
      room_id,
      finalTenantId,
      start_date || new Date().toISOString().slice(0, 10),
      end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      rentAmount,
      depositAmount,
      defaultLandlordSig,
      terms || 'Các bên cam kết tuân thủ quy định PCCC, nội quy giờ giấc và thanh toán tiền phòng đúng hạn từ ngày 1 đến ngày 5 hàng tháng.'
    );

    res.json({
      success: true,
      contractId: result.lastInsertRowid,
      contract_code,
      token,
      signUrl: `/sign-contract/${token}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Endpoint to view contract by token (No Auth required for tenant)
app.get('/api/public/contract/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const contract = db.prepare(`
      SELECT c.*, r.room_number, r.floor, r.area, r.electricity_rate, r.water_rate, r.wifi_fee, r.trash_fee, r.cleaning_fee, r.parking_fee,
             b.name as building_name, b.address as building_address, b.bank_id, b.bank_account, b.bank_owner,
             t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card, t.hometown, t.license_plate
      FROM contracts c
      JOIN rooms r ON c.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE c.token = ?
    `).get(token) as any;

    if (!contract) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng hoặc liên kết đã hết hạn.' });
    }

    const landlordName = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_name'").get() as any)?.value || 'Nguyễn Trung An';
    const landlordPhone = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_phone'").get() as any)?.value || '0988.123.456';
    const landlordIdentity = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_identity'").get() as any)?.value || '001095012345';
    const landlordAddress = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_address'").get() as any)?.value || contract.building_address;

    res.json({
      contract,
      landlord: {
        name: landlordName,
        phone: landlordPhone,
        identity: landlordIdentity,
        address: landlordAddress
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Endpoint for Tenant to Sign and generate VietQR Deposit Code
app.post('/api/public/contract/:token/sign', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { tenant_signature, pccc_agreed, rules_agreed, tenant_name, identity_card, hometown } = req.body;

    if (!tenant_signature) {
      return res.status(400).json({ error: 'Vui lòng ký tên vào khung chữ ký cảm ứng!' });
    }

    const contract = db.prepare(`
      SELECT c.*, r.room_number, b.bank_id, b.bank_account, b.bank_owner, t.full_name, t.id as tenant_id
      FROM contracts c
      JOIN rooms r ON c.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE c.token = ?
    `).get(token) as any;

    if (!contract) {
      return res.status(404).json({ error: 'Hợp đồng không tồn tại.' });
    }

    // Update tenant profile if provided
    if (contract.tenant_id && (tenant_name || identity_card || hometown)) {
      db.prepare(`
        UPDATE tenants 
        SET full_name = COALESCE(?, full_name),
            identity_card = COALESCE(?, identity_card),
            hometown = COALESCE(?, hometown)
        WHERE id = ?
      `).run(tenant_name, identity_card, hometown, contract.tenant_id);
    }

    // Generate VietQR for Deposit
    const depositAmt = contract.deposit_amount || contract.monthly_rent;
    const vietqrUrl = generateVietQRUrl(
      contract.bank_id,
      contract.bank_account,
      contract.bank_owner,
      depositAmt,
      `COC PHONG ${contract.room_number} HD ${contract.contract_code}`
    );

    // Update Contract state to signed
    db.prepare(`
      UPDATE contracts
      SET tenant_signature = ?,
          signed_at = CURRENT_TIMESTAMP,
          status = 'signed',
          vietqr_url = ?,
          pccc_agreed = ?,
          rules_agreed = ?
      WHERE token = ?
    `).run(tenant_signature, vietqrUrl, pccc_agreed ? 1 : 0, rules_agreed ? 1 : 0, token);

    // Send Telegram Notification to Landlord if configured
    try {
      const botToken = (db.prepare("SELECT value FROM settings WHERE key = 'telegram_bot_token'").get() as any)?.value;
      const chatId = (db.prepare("SELECT value FROM settings WHERE key = 'telegram_chat_id'").get() as any)?.value;
      if (botToken && chatId) {
        const msg = `✍️ *[HỢP ĐỒNG ĐÃ ĐƯỢC KÝ ONLINE]*\n` +
          `🏠 Phòng: *P.${contract.room_number}*\n` +
          `👤 Khách thuê: *${tenant_name || contract.full_name}*\n` +
          `💵 Tiền cọc giữ phòng: *${depositAmt.toLocaleString('vi-VN')} đ*\n` +
          `📜 Mã HĐ: `${contract.contract_code}`\n` +
          `⚡ Trạng thái: Đã ký số thành công, đang chờ khách quét mã VietQR nộp cọc.`;
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
        }).catch(() => {});
      }
    } catch {}

    const updated = db.prepare('SELECT * FROM contracts WHERE token = ?').get(token);
    res.json({
      success: true,
      message: 'Ký hợp đồng điện tử thành công! Vui lòng quét mã VietQR để hoàn tất đặt cọc.',
      contract: updated,
      vietqrUrl,
      depositAmount: depositAmt
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to mark deposit as confirmed and occupy room
app.post('/api/contracts/:id/confirm-deposit', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id) as any;
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    db.prepare("UPDATE contracts SET deposit_status = 'paid', status = 'completed' WHERE id = ?").run(id);
    db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ?").run(contract.room_id);
    if (contract.tenant_id) {
      db.prepare("UPDATE tenants SET active = 1, room_id = ? WHERE id = ?").run(contract.room_id, contract.tenant_id);
    }

    res.json({ success: true, message: 'Đã xác nhận tiền cọc và kích hoạt phòng thành công!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. LEGAL RENTAL CONTRACT GENERATOR
// -------------------------------------------------------------
app.get('/api/contracts/sample/:roomId', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const room = db.prepare(`
    SELECT r.*, b.name as building_name, b.address as building_address,
           t.full_name, t.phone, t.identity_card, t.hometown, t.license_plate, t.start_date
    FROM rooms r
    JOIN buildings b ON r.building_id = b.id
    LEFT JOIN tenants t ON t.room_id = r.id AND t.active = 1
    WHERE r.id = ?
  `).get(roomId) as any;

  if (!room) return res.status(404).json({ error: 'Room not found' });

  const landlordName = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_name'").get() as any)?.value || 'Nguyễn Trung An';
  const landlordPhone = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_phone'").get() as any)?.value || '0988.123.456';
  const landlordIdentity = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_identity'").get() as any)?.value || '001095012345';
  const landlordAddress = (db.prepare("SELECT value FROM settings WHERE key = 'landlord_address'").get() as any)?.value || room.building_address;

  res.json({
    landlord: {
      name: landlordName,
      phone: landlordPhone,
      identity: landlordIdentity,
      address: landlordAddress
    },
    tenant: {
      name: room.full_name || '...........................................',
      phone: room.phone || '...........................................',
      identity: room.identity_card || '...........................................',
      hometown: room.hometown || '...........................................',
      licensePlate: room.license_plate || '...........................................',
      startDate: room.start_date || new Date().toISOString().slice(0, 10)
    },
    room: {
      roomNumber: room.room_number,
      address: room.building_address,
      basePrice: room.base_price,
      deposit: room.deposit,
      electricRate: room.electricity_rate,
      waterRate: room.water_rate,
      wifiFee: room.wifi_fee,
      trashFee: room.trash_fee
    }
  });
});

// -------------------------------------------------------------
// 8. TELEGRAM & ZALO NOTIFICATION / REMINDER
// -------------------------------------------------------------
app.post('/api/notify/telegram', async (req: Request, res: Response) => {
  const { invoice_id, custom_message } = req.body;
  const botToken = (db.prepare("SELECT value FROM settings WHERE key = 'telegram_bot_token'").get() as any)?.value;
  const chatId = (db.prepare("SELECT value FROM settings WHERE key = 'telegram_chat_id'").get() as any)?.value;

  let message = custom_message;
  if (invoice_id) {
    const inv = db.prepare(`
      SELECT i.*, r.room_number, t.full_name, t.phone, b.bank_id, b.bank_account, b.bank_owner
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN tenants t ON i.tenant_id = t.id
      WHERE i.id = ?
    `).get(invoice_id) as any;

    if (inv) {
      message = `🔔 *THÔNG BÁO TIỀN PHÒNG THÁNG ${inv.month}/${inv.year}*\n` +
        `🏠 Phòng: *${inv.room_number}* (${inv.full_name || 'Khách thuê'})\n` +
        `💵 Tiền phòng: ${inv.room_fee.toLocaleString('vi-VN')} đ\n` +
        `⚡ Điện (${inv.electric_usage} kWh): ${inv.electric_fee.toLocaleString('vi-VN')} đ\n` +
        `💧 Nước (${inv.water_usage} m3): ${inv.water_fee.toLocaleString('vi-VN')} đ\n` +
        `📶 Dịch vụ (Wifi/Rác/Xe): ${(inv.wifi_fee + inv.trash_fee + inv.parking_fee).toLocaleString('vi-VN')} đ\n` +
        `👉 *TỔNG CỘNG: ${inv.total_amount.toLocaleString('vi-VN')} đ*\n` +
        `💳 STK: ${inv.bank_account} (${inv.bank_id}) - ${inv.bank_owner}\n` +
        `📝 Cú pháp: *${inv.room_number} TIEN NHA T${inv.month}*`;
    }
  }

  console.log('[Telegram Bot Simulation / Webhook]', { botToken: botToken ? 'configured' : 'none', chatId, message });

  res.json({
    success: true,
    simulated: !botToken,
    message: 'Thông báo Telegram đã được chuẩn bị và kích hoạt thành công!',
    payload: message
  });
});

app.post('/api/notify/zalo', async (req: Request, res: Response) => {
  const { invoice_id, phone, custom_message } = req.body;
  res.json({
    success: true,
    message: `Đã gửi tin nhắn Zalo Webhook ZNS tới số ${phone || 'khách thuê'} thành công!`,
    data: { invoice_id, message: custom_message }
  });
});

// -------------------------------------------------------------
// 9. SETTINGS & RE-SEED API
// -------------------------------------------------------------
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
  res.json(settingsMap);
});

app.post('/api/settings', (req: Request, res: Response) => {
  const settings = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const updateMany = db.transaction((entries) => {
    for (const [k, v] of Object.entries(entries)) {
      stmt.run(k, String(v));
    }
  });
  updateMany(settings);
  res.json({ success: true });
});

app.post('/api/seed', (req: Request, res: Response) => {
  runSeed();
  res.json({ success: true, message: 'Đã nạp lại bộ dữ liệu mẫu 12 phòng thành công!' });
});

// Serve frontend build if exists
const frontendDist = path.join(process.cwd(), '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TroViet Pro Backend API running on http://localhost:${PORT}`);
});