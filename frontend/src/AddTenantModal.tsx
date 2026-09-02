import React from 'react';
import { Users } from 'lucide-react';

interface AddTenantModalProps {
  rooms: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formatVND: (val: number) => string;
}

export function AddTenantModal({ rooms, onClose, onSubmit, formatVND }: AddTenantModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm text-white">Thêm Khách Thuê Phòng Mới</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Xếp Vào Phòng Trọ *</label>
            <select name="room_id" required className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500">
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Phòng {r.room_number} - {formatVND(r.base_price)}/tháng ({r.status === 'occupied' ? 'Đã có khách' : '🟢 Phòng Trống'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Họ và Tên Khách Thuê *</label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="VD: Nguyễn Văn Nam"
                className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại (Zalo) *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="VD: 0988123456"
                className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số CCCD / CMND</label>
              <input
                type="text"
                name="identity_card"
                placeholder="VD: 001097003344"
                className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Quê Quán</label>
              <input
                type="text"
                name="hometown"
                placeholder="VD: Thái Bình / Nam Định"
                className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Biển Số Xe</label>
              <input
                type="text"
                name="license_plate"
                placeholder="VD: 29E1-123.45"
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số Người Ở</label>
              <input
                type="number"
                name="members_count"
                defaultValue={1}
                min={1}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ngày Bắt Đầu Ở</label>
              <input
                type="date"
                name="start_date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Ghi Chú Thêm</label>
            <input
              type="text"
              name="notes"
              placeholder="VD: Đã nộp cọc 1 tháng, đóng tiền ngày 05"
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition">
              + Thêm & Nhận Phòng
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
