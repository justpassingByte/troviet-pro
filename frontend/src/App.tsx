import React, { useState, useEffect } from 'react';
import {
  Home,
  Building2,
  Users,
  Zap,
  Receipt,
  FileText,
  Settings,
  Plus,
  Printer,
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  DollarSign,
  PenTool,
  Copy,
  ExternalLink,
  Flame
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { MeterRow } from './MeterRow';
import { InvoiceModal } from './InvoiceModal';
import { PosReceiptModal } from './PosReceiptModal';
import { CreateContractModal } from './CreateContractModal';

const API_BASE = '/api';

interface Stats {
  month: number;
  year: number;
  rooms: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancyRate: number;
  };
  tenants: {
    total: number;
  };
  financials: {
    totalExpected: number;
    totalCollected: number;
    totalUnpaid: number;
    totalElectricFee: number;
    totalWaterFee: number;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'tenants' | 'meters' | 'invoices' | 'contracts' | 'settings'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [meters, setMeters] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Public Tenant E-Sign Mode
  const [publicSignToken, setPublicSignToken] = useState<string | null>(null);
  const [publicContractData, setPublicContractData] = useState<any>(null);
  const [publicSignSuccess, setPublicSignSuccess] = useState<any>(null);

  // Modals state
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<any>(null);
  const [showPosReceiptModal, setShowPosReceiptModal] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signToken = params.get('sign_token') || params.get('token');
    if (signToken) {
      setPublicSignToken(signToken);
      fetchPublicContract(signToken);
    }
  }, []);

  const fetchPublicContract = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/public/contract/${token}`);
      if (res.ok) {
        const data = await res.json();
        setPublicContractData(data);
      } else {
        showToast('Không tìm thấy hợp đồng hoặc liên kết đã hết hạn!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    try {
      const [resStats, resRooms, resTenants, resMeters, resInvoices, resContracts, resSettings] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/rooms`).then(r => r.json()),
        fetch(`${API_BASE}/tenants`).then(r => r.json()),
        fetch(`${API_BASE}/meters?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/invoices?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/contracts`).then(r => r.json()),
        fetch(`${API_BASE}/settings`).then(r => r.json())
      ]);

      setStats(resStats);
      setRooms(Array.isArray(resRooms) ? resRooms : []);
      setTenants(Array.isArray(resTenants) ? resTenants : []);
      setMeters(Array.isArray(resMeters) ? resMeters : []);
      setInvoices(Array.isArray(resInvoices) ? resInvoices : []);
      setContracts(Array.isArray(resContracts) ? resContracts : []);
      setSettings(resSettings || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth, selectedYear]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const handleSaveMeter = async (roomId: number, oldE: number, newE: number, oldW: number, newW: number) => {
    try {
      const res = await fetch(`${API_BASE}/meters/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          month: selectedMonth,
          year: selectedYear,
          old_electric: oldE,
          new_electric: newE,
          old_water: oldW,
          new_water: newW
        })
      });
      if (res.ok) {
        showToast('Đã lưu chỉ số điện nước thành công!');
        fetchAllData();
      }
    } catch (err) {
      showToast('Lỗi khi lưu chỉ số.');
    }
  };

  const handleGenerateInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/invoices/generate-monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Đã sinh thành công ${data.count} hóa đơn tiền phòng!`);
        setActiveTab('invoices');
        fetchAllData();
      }
    } catch (err) {
      showToast('Lỗi khi sinh hóa đơn.');
    }
  };

  const handlePayInvoice = async (invoiceId: number, amount: number) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, payment_method: 'VietQR' })
      });
      if (res.ok) {
        showToast('Đã xác nhận thanh toán thành công!');
        setShowInvoiceModal(null);
        fetchAllData();
      }
    } catch (err) {
      showToast('Lỗi khi cập nhật thanh toán.');
    }
  };

  const handleSendTelegram = async (invoiceId: number) => {
    try {
      const res = await fetch(`${API_BASE}/notify/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã gửi thông báo tiền phòng qua Telegram!');
      } else {
        showToast(data.message || 'Chưa cấu hình Telegram Bot.');
      }
    } catch (err) {
      showToast('Lỗi khi gửi thông báo.');
    }
  };

  const handleCreateContractSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const payload = {
        room_id: Number(formData.get('room_id')),
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        identity_card: formData.get('identity_card'),
        hometown: formData.get('hometown'),
        license_plate: formData.get('license_plate'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        monthly_rent: Number(formData.get('monthly_rent')),
        deposit_amount: Number(formData.get('deposit_amount')),
        terms: formData.get('terms')
      };

      const res = await fetch(`${API_BASE}/contracts/e-sign-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Đã tạo Hợp đồng điện tử thành công!');
        setShowCreateContractModal(false);
        fetchAllData();
      } else {
        showToast('Không thể tạo hợp đồng.');
      }
    } catch (err) {
      showToast('Lỗi khi tạo hợp đồng.');
    }
  };

  const handleCopySigningLink = (token: string) => {
    const fullUrl = `${window.location.origin}?sign_token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Đã sao chép liên kết ký hợp đồng! Hãy gửi cho khách qua Zalo/SMS.');
  };

  const handleConfirmDeposit = async (contractId: number) => {
    if (!confirm('Xác nhận đã nhận đủ tiền cọc và chuyển phòng sang trạng thái ĐANG THUÊ?')) return;
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/confirm-deposit`, { method: 'POST' });
      if (res.ok) {
        showToast('Đã xác nhận cọc & kích hoạt phòng thành công!');
        fetchAllData();
      }
    } catch {
      showToast('Lỗi khi xác nhận cọc.');
    }
  };

  const handleTenantSignSubmit = async (token: string, sigDataUrl: string, pcccAgreed: boolean, rulesAgreed: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/public/contract/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_signature: sigDataUrl,
          pccc_agreed: pcccAgreed,
          rules_agreed: rulesAgreed
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPublicSignSuccess(data);
        showToast('Ký hợp đồng thành công! Vui lòng quét mã VietQR để nộp tiền cọc.');
        fetchAllData();
      } else {
        showToast('Không thể hoàn tất ký hợp đồng.');
      }
    } catch (err) {
      showToast('Lỗi khi gửi chữ ký.');
    }
  };

  // -------------------------------------------------------------
  // PUBLIC TENANT SIGNING VIEW
  // -------------------------------------------------------------
  if (publicSignToken && publicContractData) {
    const { contract, landlord } = publicContractData;
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white text-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center border-b pb-4">
            <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              Hợp Đồng Thuê Nhà Điện Tử · E-Sign Online
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-2">
              KÝ HỢP ĐỒNG THUÊ PHÒNG P.{contract.room_number}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{contract.building_name} — {contract.building_address}</p>
          </div>

          {publicSignSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Ký Hợp Đồng Thành Công!</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Chữ ký số của bạn đã được ghi nhận vào Hợp đồng số <strong>#{contract.contract_code}</strong>.
                </p>
              </div>

              <div className="bg-indigo-50/80 border-2 border-dashed border-indigo-300 rounded-3xl p-6 max-w-sm mx-auto space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-bold text-xs uppercase">
                  <QrCode className="w-4 h-4" /> Quét mã VietQR nộp tiền cọc giữ phòng
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
                  <img src={publicSignSuccess.vietqrUrl} alt="VietQR Deposit" className="w-64 h-64 mx-auto rounded-xl" />
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <p>Số tiền cọc: <strong className="text-base text-indigo-700 font-black">{formatVND(publicSignSuccess.depositAmount)}</strong></p>
                  <p className="text-[11px] font-mono text-slate-500 bg-white/80 p-1.5 rounded">
                    STK: <strong>{contract.bank_account}</strong> ({contract.bank_id}) - {contract.bank_owner}
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In / Lưu Hợp Đồng PDF
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-xs text-slate-700">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Bên cho thuê (Chủ nhà):</span>
                    <p className="font-bold text-slate-900">{landlord.name} ({landlord.phone})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Khách thuê phòng:</span>
                    <p className="font-bold text-slate-900">{contract.tenant_name || 'Khách thuê'} ({contract.tenant_phone})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Giá thuê phòng:</span>
                    <p className="font-extrabold text-indigo-700 text-sm">{formatVND(contract.monthly_rent)}/tháng</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tiền đặt cọc giữ chỗ:</span>
                    <p className="font-extrabold text-amber-700 text-sm">{formatVND(contract.deposit_amount)}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  Thời hạn thuê: Từ <strong>{contract.start_date}</strong> đến <strong>{contract.end_date}</strong>.
                </div>
              </div>

              <div className="space-y-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" /> Cam Kết PCCC & Nội Quy Phòng Trọ
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>Tuyệt đối không sạc xe điện qua đêm tại khu vực hành lang chung.</li>
                  <li>Không tàng trữ chất dễ cháy nổ, bình gas công nghiệp trong phòng.</li>
                  <li>Thanh toán tiền phòng đúng hạn từ ngày 01 đến ngày 05 hàng tháng qua VietQR.</li>
                  <li>Giữ gìn vệ sinh chung và trật tự sau 23:00 đêm.</li>
                </ul>
              </div>

              <div className="pt-2">
                <SignaturePad
                  onSave={(dataUrl: string) => handleTenantSignSubmit(publicSignToken, dataUrl, true, true)}
                  title="Khách thuê dùng ngón tay ký tên xác nhận vào ô bên dưới:"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN LANDLORD DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
              TV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">TroViet</span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Quản Lý Nhà Trọ & Ký Hợp Đồng VietQR</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'rooms' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Phòng trọ
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Khách thuê
            </button>
            <button
              onClick={() => setActiveTab('meters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'meters' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Chốt Điện Nước
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> Hóa đơn VietQR
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'contracts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Hợp Đồng Điện Tử
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Cài đặt
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-400">{selectedYear}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Tỷ Lệ Lấp Đầy</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{stats.rooms.occupancyRate}%</span>
                  <span className="text-xs text-slate-400">({stats.rooms.occupied}/{stats.rooms.total} phòng)</span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Tổng Thu Dự Kiến</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {formatVND(stats.financials.totalExpected)}
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Tiền Trọ Chưa Thu</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-black text-rose-400">
                  {formatVND(stats.financials.totalUnpaid)}
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Hợp Đồng Điện Tử</span>
                  <PenTool className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{contracts.length}</span>
                  <span className="text-xs text-amber-400">({contracts.filter(c => c.status === 'signed').length} đã ký)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Sơ Đồ Phòng Trực Quan (Chung Cư Mini An Cư Pro)
                </h3>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  Xem Hợp Đồng Ký Online <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-2xl border transition text-center space-y-1.5 ${
                      r.status === 'occupied'
                        ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <div className="font-black text-sm">{r.room_number}</div>
                    <div className="text-[10px] truncate font-medium text-slate-400">{r.tenant_name || 'Phòng trống'}</div>
                    <div className="text-[11px] font-bold text-indigo-400">{formatVND(r.base_price)}</div>
                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      r.status === 'occupied' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-emerald-900/60 text-emerald-300'
                    }`}>
                      {r.status === 'occupied' ? 'Đang ở' : 'Trống'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOMS */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(r => (
                <div key={r.id} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-lg text-white">Phòng {r.room_number}</span>
                      <p className="text-xs text-slate-400">Tầng {r.floor} • {r.area} m²</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      r.status === 'occupied' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-emerald-900/60 text-emerald-300'
                    }`}>
                      {r.status === 'occupied' ? 'Đang Thuê' : 'Trống'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p>Giá thuê: <strong className="text-indigo-400">{formatVND(r.base_price)}/th</strong></p>
                    <p>Tiền cọc: <strong>{formatVND(r.deposit)}</strong></p>
                    <p>Khách thuê: <strong>{r.tenant_name || 'Chưa có'}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TENANTS */}
        {activeTab === 'tenants' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-4">Phòng</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Số CCCD</th>
                    <th className="p-4">Quê quán</th>
                    <th className="p-4">Biển số xe</th>
                    <th className="p-4">Ngày bắt đầu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition">
                      <td className="p-4 font-black text-indigo-400">{t.room_number}</td>
                      <td className="p-4 font-bold text-white">{t.full_name}</td>
                      <td className="p-4">{t.phone}</td>
                      <td className="p-4 font-mono">{t.identity_card}</td>
                      <td className="p-4">{t.hometown}</td>
                      <td className="p-4 font-mono">{t.license_plate}</td>
                      <td className="p-4">{t.start_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: METERS */}
        {activeTab === 'meters' && (
          <div className="space-y-4">
            <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl flex justify-between items-center text-xs text-amber-200">
              <span>Chốt chỉ số Điện (kWh) và Nước (m³) tháng <strong>{selectedMonth}/{selectedYear}</strong>. Nhập số mới, hệ thống tự tính số tiêu thụ.</span>
              <button
                onClick={handleGenerateInvoices}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
              >
                ⚡ Đồng bộ sang Hóa đơn VietQR
              </button>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-4">Phòng</th>
                      <th className="p-4">Khách thuê</th>
                      <th className="p-4 text-center">Điện Cũ</th>
                      <th className="p-4 text-center">Điện Mới</th>
                      <th className="p-4 text-center">Tiêu Thụ (kWh)</th>
                      <th className="p-4 text-center">Nước Cũ</th>
                      <th className="p-4 text-center">Nước Mới</th>
                      <th className="p-4 text-center">Tiêu Thụ (m³)</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {meters.map(m => (
                      <MeterRow key={m.room_id} item={m} onSave={handleSaveMeter} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INVOICES & VIETQR */}
        {activeTab === 'invoices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-sm hover:border-slate-600 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-lg text-white">Phòng {inv.room_number}</span>
                    <p className="text-[11px] font-mono text-slate-400">Mã: {inv.invoice_code}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    inv.status === 'paid' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                  }`}>
                    {inv.status === 'paid' ? 'Đã Thu' : 'Chưa Thu'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Tiền phòng:</span>
                    <span className="font-semibold text-white">{formatVND(inv.room_fee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Điện ({inv.electric_usage} kWh):</span>
                    <span className="font-semibold text-white">{formatVND(inv.electric_fee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Nước ({inv.water_usage} m³):</span>
                    <span className="font-semibold text-white">{formatVND(inv.water_fee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dịch vụ khác:</span>
                    <span className="font-semibold text-white">{formatVND(inv.wifi_fee + inv.trash_fee + inv.parking_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700/60 text-sm font-black text-indigo-400">
                    <span>TỔNG CỘNG:</span>
                    <span>{formatVND(inv.total_amount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => setShowInvoiceModal(inv)}
                    className="flex items-center justify-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 py-2 rounded-xl text-xs font-bold border border-indigo-500/30 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" /> VietQR
                  </button>
                  <button
                    onClick={() => setShowPosReceiptModal(inv)}
                    className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-xl text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> In POS
                  </button>
                  <button
                    onClick={() => handleSendTelegram(inv.id)}
                    className="flex items-center justify-center gap-1 bg-sky-950/50 hover:bg-sky-900/60 text-sky-300 py-2 rounded-xl text-xs font-bold border border-sky-500/30 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Nhắc Nợ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: E-CONTRACT DIGITAL SIGNING */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">Quản Lý Hợp Đồng Thuê Nhà & Ký Điện Tử (E-Sign)</h3>
                  <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Add-on Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Gửi link qua Zalo cho khách ký cảm ứng trên điện thoại và tự động sinh mã VietQR nộp cọc giữ phòng.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateContractModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Plus className="w-4 h-4" /> + Tạo Hợp Đồng & Lấy Link Ký
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-800/40 rounded-3xl border border-slate-700/40">
                  Chưa có hợp đồng điện tử nào. Hãy bấm "+ Tạo Hợp Đồng & Lấy Link Ký" ở trên.
                </div>
              ) : (
                contracts.map((c) => (
                  <div key={c.id} className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-5 space-y-4 hover:border-slate-600 transition shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-black text-white">Phòng {c.room_number}</span>
                        <p className="text-[11px] font-mono text-slate-400">Mã: {c.contract_code}</p>
                      </div>
                      <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        c.status === 'signed' || c.status === 'completed'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.status === 'completed' ? 'Hoàn tất' : c.status === 'signed' ? 'Đã ký số' : 'Chờ khách ký'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Khách thuê:</span>
                        <strong className="text-white">{c.tenant_name || 'Khách mới'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số điện thoại:</span>
                        <span>{c.tenant_phone || '---'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá thuê:</span>
                        <strong className="text-indigo-400">{formatVND(c.monthly_rent)}/th</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tiền cọc:</span>
                        <strong className="text-amber-400">{formatVND(c.deposit_amount)}</strong>
                      </div>
                    </div>

                    {c.tenant_signature && (
                      <div className="bg-white/95 text-slate-900 p-2.5 rounded-xl border border-slate-700 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Chữ ký điện tử của khách:</span>
                        <img src={c.tenant_signature} alt="Chữ ký" className="h-10 mx-auto" />
                        <span className="text-[9px] text-slate-400 block mt-0.5">Ký lúc: {c.signed_at || 'Mới đây'}</span>
                      </div>
                    )}

                    <div className="space-y-2 pt-1 border-t border-slate-700/60 text-xs font-bold">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCopySigningLink(c.token)}
                          className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-indigo-500/30 transition"
                        >
                          <Copy className="w-3.5 h-3.5" /> Link Zalo
                        </button>

                        <button
                          onClick={() => {
                            window.open(`?sign_token=${c.token}`, '_blank');
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Mở Ký
                        </button>
                      </div>

                      {c.deposit_status !== 'paid' && (
                        <button
                          onClick={() => handleConfirmDeposit(c.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Đã Nhận Cọc
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 max-w-2xl mx-auto space-y-6">
            <h3 className="text-base font-bold text-white">Cấu Hình Thông Tin Chủ Nhà & Cổng VietQR</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tên Chủ Nhà / Đơn Vị Quản Lý</label>
                <input
                  type="text"
                  defaultValue={settings.landlord_name || 'Nguyễn Trung An'}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại Chủ Nhà</label>
                <input
                  type="text"
                  defaultValue={settings.landlord_phone || '0988.123.456'}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số Tài Khoản Nhận Tiền VietQR</label>
                <input
                  type="text"
                  defaultValue="0388999888"
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ngân Hàng (Napas 247)</label>
                <input
                  type="text"
                  defaultValue="MBBank (Quân Đội)"
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => showToast('Đã lưu cấu hình hệ thống thành công!')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
            >
              Lưu Thay Đổi
            </button>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showCreateContractModal && (
        <CreateContractModal
          rooms={rooms}
          onClose={() => setShowCreateContractModal(false)}
          onSubmit={handleCreateContractSubmit}
          formatVND={formatVND}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          invoice={showInvoiceModal}
          onClose={() => setShowInvoiceModal(null)}
          onPay={handlePayInvoice}
          formatVND={formatVND}
        />
      )}

      {showPosReceiptModal && (
        <PosReceiptModal
          receipt={showPosReceiptModal}
          onClose={() => setShowPosReceiptModal(null)}
          formatVND={formatVND}
        />
      )}
    </div>
  );
}
