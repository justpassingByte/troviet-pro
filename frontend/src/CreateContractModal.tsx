import React from 'react';

interface CreateContractModalProps {
  rooms: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formatVND: (val: number) => string;
}

export function CreateContractModal({ rooms, onClose, onSubmit, formatVND }: CreateContractModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="font-black text-sm text-white">Tạo Hợp Đồng Thuê Nhà & Lấy Link Ký Zalo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Chọn Phòng Trọ *</label>
            <select name="room_id" required className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none">
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Phòng {r.room_number} - {formatVND(r.base_price)}/tháng ({r.status === 'occupied' ? 'Đang có khách' : 'Trống'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Họ & Tên Khách Thuê *</label>
              <input type="text" name="full_name" required placeholder="Nguyễn Văn A" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại (Zalo) *</label>
              <input type="tel" name="phone" required placeholder="0988123456" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Số CCCD / CMND</label>
              <input type="text" name="identity_card" placeholder="001095012345" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Quê Quán</label>
              <input type="text" name="hometown" placeholder="Nam Định" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ngày Bắt Đầu Thuê</label>
              <input type="date" name="start_date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ngày Kết Thúc Thuê</label>
              <input type="date" name="end_date" defaultValue={new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Giá Thuê Tháng (VNĐ)</label>
              <input type="number" name="monthly_rent" defaultValue={3800000} step={100000} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiền Cọc Yêu Cầu (VNĐ)</label>
              <input type="number" name="deposit_amount" defaultValue={3800000} step={100000} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Điều Khoản Riêng & Cam Kết PCCC</label>
            <textarea name="terms" rows={2} defaultValue="Bên B cam kết tuân thủ nghiêm quy định PCCC, không sạc xe điện qua đêm tại lối thoát hiểm, giữ trật tự sau 23h." className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition">
              Tạo Hợp Đồng & Lấy Link Ký
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
