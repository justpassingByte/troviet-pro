import React from 'react';
import { Building2 } from 'lucide-react';

interface AddRoomModalProps {
  buildings: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AddRoomModal({ buildings, onClose, onSubmit }: AddRoomModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm text-white">Thêm Phòng Trọ / Căn Hộ Mới</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Thuộc Tòa Nhà / Dãy Trọ *</label>
            <select name="building_id" required className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500">
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.address})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số Phòng *</label>
              <input
                type="text"
                name="room_number"
                required
                placeholder="VD: P104"
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white font-bold outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tầng Số</label>
              <input
                type="number"
                name="floor"
                defaultValue={1}
                min={1}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Diện Tích (m²)</label>
              <input
                type="number"
                name="area"
                defaultValue={25}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Giá Thuê Tháng (VNĐ) *</label>
              <input
                type="number"
                name="base_price"
                defaultValue={3800000}
                step={100000}
                required
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white font-bold text-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiền Cọc (VNĐ) *</label>
              <input
                type="number"
                name="deposit"
                defaultValue={3800000}
                step={100000}
                required
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white font-bold text-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiền Wifi (đ/phòng)</label>
              <input
                type="number"
                name="wifi_fee"
                defaultValue={100000}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiền Rác / Vệ sinh</label>
              <input
                type="number"
                name="trash_fee"
                defaultValue={50000}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiền Gửi Xe (đ/xe)</label>
              <input
                type="number"
                name="parking_fee"
                defaultValue={100000}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Trạng Thái Phòng Ban Đầu</label>
            <select name="status" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none">
              <option value="available">🟢 Phòng Trống (Chưa có người ở)</option>
              <option value="occupied">🔵 Đang Thuê (Đã có khách)</option>
              <option value="maintenance">🟡 Đang Sửa Chữa / Bảo Trì</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition">
              + Thêm Phòng Trọ
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
