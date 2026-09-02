import React from 'react';
import { Building2 } from 'lucide-react';

interface AddBuildingModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AddBuildingModal({ onClose, onSubmit }: AddBuildingModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm text-white">Thêm Tòa Nhà / Dãy Trọ Mới</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Tên Tòa Nhà / Dãy Trọ *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="VD: Chung Cư Mini Cầu Giấy 2 / Dãy Trọ Hoàng Mai"
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Địa Chỉ Chi Tiết *</label>
            <input
              type="text"
              name="address"
              required
              placeholder="VD: Số 25 Ngõ 102 Trần Phú, Hà Đông, Hà Nội"
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tổng Số Tầng</label>
              <input
                type="number"
                name="total_floors"
                defaultValue={4}
                min={1}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Đơn Giá Điện (đ/kWh)</label>
              <input
                type="number"
                name="default_electric_rate"
                defaultValue={3800}
                step={100}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none font-bold text-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Đơn Giá Nước (đ/m³)</label>
              <input
                type="number"
                name="default_water_rate"
                defaultValue={30000}
                step={1000}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none font-bold text-sky-400"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <h4 className="font-bold text-xs text-indigo-400">Cấu Hình Tài Khoản Nhận Tiền VietQR Cho Tòa Này</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ngân Hàng (Napas247)</label>
                <select name="bank_id" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none">
                  <option value="MBBank">MBBank (Quân Đội)</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="TCB">Techcombank</option>
                  <option value="ICB">VietinBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="ACB">ACB</option>
                  <option value="VPB">VPBank</option>
                  <option value="TPB">TPBank</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số Tài Khoản</label>
                <input
                  type="text"
                  name="bank_account"
                  defaultValue="0388999888"
                  placeholder="0388999888"
                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
              <input
                type="text"
                name="bank_owner"
                defaultValue="NGUYEN TRUNG AN"
                placeholder="NGUYEN TRUNG AN"
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition">
              + Tạo Tòa Nhà / Dãy Trọ
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