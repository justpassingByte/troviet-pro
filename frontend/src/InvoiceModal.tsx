import React from 'react';

interface InvoiceModalProps {
  invoice: any;
  onClose: () => void;
  onPay: (id: number, amount: number) => void;
  formatVND: (val: number) => string;
}

export function InvoiceModal({ invoice, onClose, onPay, formatVND }: InvoiceModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="font-bold text-sm text-white">Thanh Toán VietQR Phòng {invoice.room_number}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <img
            src={invoice.vietqr_url}
            alt="VietQR Pro"
            className="w-full h-auto rounded-xl"
          />
        </div>

        <div className="text-xs space-y-1">
          <p className="text-slate-400">Số tiền thanh toán:</p>
          <p className="text-xl font-black text-indigo-400">{formatVND(invoice.total_amount)}</p>
          <p className="text-[11px] font-mono text-slate-300 bg-slate-800 p-2 rounded-xl mt-1">
            Nội dung: <strong>{invoice.room_number} TIEN NHA T{invoice.month}</strong>
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          {invoice.status !== 'paid' && (
            <button
              onClick={() => onPay(invoice.id, invoice.total_amount)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow transition"
            >
              ✓ Xác Nhận Đã Thu
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
