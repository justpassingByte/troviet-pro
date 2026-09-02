import React from 'react';

interface PosReceiptModalProps {
  receipt: any;
  onClose: () => void;
  formatVND: (val: number) => string;
}

export function PosReceiptModal({ receipt, onClose, formatVND }: PosReceiptModalProps) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl space-y-4 text-slate-900">
        <div className="flex justify-between items-center pb-2 border-b no-print">
          <span className="font-bold text-xs text-slate-800">Phiếu Thu POS 80mm</span>
          <button onClick={onClose} className="text-slate-400 font-bold">✕</button>
        </div>

        <div id="printable-area" className="pos-receipt mx-auto text-center text-xs font-mono text-slate-900 space-y-2 p-2 border border-dashed border-slate-300">
          <p className="font-bold text-sm">CHUNG CƯ MINI AN CƯ PRO</p>
          <p className="text-[10px]">165 Cầu Giấy, Hà Nội • ĐT: 0988.123.456</p>
          <p className="font-bold text-xs pt-1 border-t border-dashed">PHIẾU THU TIỀN NHÀ</p>
          <p className="text-[10px] text-slate-500">Tháng {receipt.month}/{receipt.year} - {receipt.room_number}</p>
          
          <div className="text-left text-[11px] space-y-1 pt-2 border-t border-dashed">
            <div className="flex justify-between">
              <span>Tiền phòng:</span>
              <span>{formatVND(receipt.room_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Điện ({receipt.electric_usage} kWh):</span>
              <span>{formatVND(receipt.electric_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Nước ({receipt.water_usage} m³):</span>
              <span>{formatVND(receipt.water_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Dịch vụ khác:</span>
              <span>{formatVND(receipt.wifi_fee + receipt.trash_fee + receipt.parking_fee)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t font-bold text-xs">
              <span>TỔNG TIỀN:</span>
              <span>{formatVND(receipt.total_amount)}</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 italic">
            Cảm ơn quý khách! Chúc quý khách an cư lạc nghiệp!
          </div>
        </div>

        <div className="flex gap-2 pt-2 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold shadow"
          >
            In Phiếu (80mm)
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
