import { db, initDB } from './db.js';
import { generateVietQRUrl } from './vietqr.js';

export async function runSeed() {
  await initDB();

  console.log('⚡ Clearing old data...');
  db.exec(`
    DELETE FROM contracts;
    DELETE FROM invoices;
    DELETE FROM meter_readings;
    DELETE FROM tenants;
    DELETE FROM rooms;
    DELETE FROM buildings;
    DELETE FROM settings;
  `);

  console.log('🏢 Creating Building: Chung Cư Mini An Cư Pro - Cầu Giấy, Hà Nội...');
  const insertBuilding = db.prepare(`
    INSERT INTO buildings (name, address, total_floors, bank_id, bank_account, bank_owner, default_electric_rate, default_water_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const buildingResult = insertBuilding.run(
    'Chung Cư Mini An Cư Pro - Cầu Giấy, Hà Nội',
    'Số 18 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội',
    4,
    'MBBank',
    '0388999888',
    'NGUYEN TRUNG AN',
    3800,
    30000
  );

  const buildingId = buildingResult.lastInsertRowid;

  // Insert Default Settings
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('app_name', 'TroViet Pro - SmartRental VN');
  insertSetting.run('landlord_name', 'Nguyễn Trung An');
  insertSetting.run('landlord_phone', '0988.123.456');
  insertSetting.run('landlord_identity', '001095012345');
  insertSetting.run('landlord_address', 'Số 18 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội');
  insertSetting.run('telegram_bot_token', '');
  insertSetting.run('telegram_chat_id', '');
  insertSetting.run('zalo_webhook_url', '');

  // 12 Rooms: 8 occupied, 4 available
  const roomsData = [
    // Floor 1
    { room_number: 'P101', floor: 1, base_price: 3800000, deposit: 3800000, status: 'occupied', area: 25, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P102', floor: 1, base_price: 3600000, deposit: 3600000, status: 'occupied', area: 22, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P103', floor: 1, base_price: 4200000, deposit: 4200000, status: 'available', area: 28, wifi: 100000, trash: 50000, parking: 100000 },
    // Floor 2
    { room_number: 'P201', floor: 2, base_price: 4000000, deposit: 4000000, status: 'occupied', area: 26, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P202', floor: 2, base_price: 4000000, deposit: 4000000, status: 'occupied', area: 26, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P203', floor: 2, base_price: 4500000, deposit: 4500000, status: 'available', area: 30, wifi: 100000, trash: 50000, parking: 100000 },
    // Floor 3
    { room_number: 'P301', floor: 3, base_price: 4200000, deposit: 4200000, status: 'occupied', area: 28, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P302', floor: 3, base_price: 4200000, deposit: 4200000, status: 'occupied', area: 28, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P303', floor: 3, base_price: 3900000, deposit: 3900000, status: 'available', area: 24, wifi: 100000, trash: 50000, parking: 100000 },
    // Floor 4
    { room_number: 'P401', floor: 4, base_price: 4500000, deposit: 4500000, status: 'occupied', area: 30, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P402', floor: 4, base_price: 4500000, deposit: 4500000, status: 'occupied', area: 30, wifi: 100000, trash: 50000, parking: 100000 },
    { room_number: 'P403', floor: 4, base_price: 3500000, deposit: 3500000, status: 'available', area: 20, wifi: 100000, trash: 50000, parking: 100000 },
  ];

  const insertRoom = db.prepare(`
    INSERT INTO rooms (building_id, room_number, floor, base_price, deposit, status, area, electricity_rate, water_rate, wifi_fee, trash_fee, parking_fee)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTenant = db.prepare(`
    INSERT INTO tenants (room_id, full_name, phone, identity_card, hometown, license_plate, start_date, members_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMeter = db.prepare(`
    INSERT INTO meter_readings (room_id, month, year, old_electric, new_electric, old_water, new_water, electric_usage, water_usage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      invoice_code, room_id, tenant_id, month, year,
      room_fee, electric_usage, electric_rate, electric_fee,
      water_usage, water_rate, water_fee, wifi_fee, trash_fee, parking_fee, other_fee,
      total_amount, paid_amount, status, vietqr_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tenantsData = [
    { room: 'P101', name: 'Trần Văn Minh', phone: '0912.345.678', cccd: '034098001122', town: 'Nam Định', plate: '18B2-987.65', count: 2, date: '2024-01-15' },
    { room: 'P102', name: 'Lê Thị Thu Thảo', phone: '0987.654.321', cccd: '036199002233', town: 'Thái Bình', plate: '17A1-123.45', count: 1, date: '2024-02-01' },
    { room: 'P201', name: 'Nguyễn Hoàng Nam', phone: '0903.112.233', cccd: '001097003344', town: 'Hà Nội', plate: '29E1-567.89', count: 2, date: '2024-01-01' },
    { room: 'P202', name: 'Phạm Quỳnh Nga', phone: '0977.889.900', cccd: '022198004455', town: 'Quảng Ninh', plate: '14P1-888.99', count: 2, date: '2024-03-10' },
    { room: 'P301', name: 'Vũ Đức Toàn', phone: '0936.445.566', cccd: '030095005566', town: 'Hải Dương', plate: '34K1-345.67', count: 1, date: '2023-11-20' },
    { room: 'P302', name: 'Đặng Mai Phương', phone: '0968.776.655', cccd: '026196006677', town: 'Bắc Ninh', plate: '99F1-222.33', count: 2, date: '2024-02-15' },
    { room: 'P401', name: 'Hoàng Anh Tuấn', phone: '0945.123.789', cccd: '038094007788', town: 'Thanh Hóa', plate: '36B5-678.90', count: 2, date: '2023-10-01' },
    { room: 'P402', name: 'Bùi Diệu Linh', phone: '0919.283.746', cccd: '019199008899', town: 'Hải Phòng', plate: '15B1-999.88', count: 1, date: '2024-04-01' },
  ];

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  let tenantIdx = 0;
  for (const r of roomsData) {
    const roomRes = insertRoom.run(
      buildingId, r.room_number, r.floor, r.base_price, r.deposit,
      r.status, r.area, 3800, 30000, r.wifi, r.trash, r.parking
    );
    const roomId = roomRes.lastInsertRowid;

    if (r.status === 'occupied') {
      const t = tenantsData[tenantIdx++];
      const tenantRes = insertTenant.run(
        roomId, t.name, t.phone, t.cccd, t.town, t.plate, t.date, t.count, 'Hợp đồng 12 tháng, giữ gìn vệ sinh chung'
      );
      const tenantId = tenantRes.lastInsertRowid;

      // Create Meter reading
      const oldE = 1200 + tenantIdx * 30;
      const newE = oldE + 85 + (tenantIdx % 3) * 20;
      const usageE = newE - oldE;

      const oldW = 40 + tenantIdx * 5;
      const newW = oldW + 4 + (tenantIdx % 2) * 2;
      const usageW = newW - oldW;

      insertMeter.run(roomId, currentMonth, currentYear, oldE, newE, oldW, newW, usageE, usageW);

      // Create Invoice
      const roomFee = r.base_price;
      const elecFee = usageE * 3800;
      const waterFee = usageW * 30000;
      const wifiFee = r.wifi;
      const trashFee = r.trash;
      const parkingFee = r.parking * t.count;
      const totalAmount = roomFee + elecFee + waterFee + wifiFee + trashFee + parkingFee;

      const invoiceCode = `HD${currentYear}${String(currentMonth).padStart(2, '0')}-${r.room_number}`;
      const qrMemo = `${r.room_number} TIEN NHA T${currentMonth}`;

      const vietqrUrl = generateVietQRUrl({
        bankId: 'MBBank',
        accountNo: '0388999888',
        accountName: 'NGUYEN TRUNG AN',
        amount: totalAmount,
        description: qrMemo,
        template: 'compact2'
      });

      const isPaid = tenantIdx % 3 === 0 ? 'paid' : 'unpaid';
      const paidAmt = isPaid === 'paid' ? totalAmount : 0;

      insertInvoice.run(
        invoiceCode, roomId, tenantId, currentMonth, currentYear,
        roomFee, usageE, 3800, elecFee,
        usageW, 30000, waterFee, wifiFee, trashFee, parkingFee, 0,
        totalAmount, paidAmt, isPaid, vietqrUrl, 'Hạn thanh toán ngày 05 hàng tháng'
      );
    }
  }

  console.log('✅ Seed completed successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed();
}