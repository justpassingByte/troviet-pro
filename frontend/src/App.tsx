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
  Flame,
  RotateCcw
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { MeterRow } from './MeterRow';
import { InvoiceModal } from './InvoiceModal';
import { PosReceiptModal } from './PosReceiptModal';
import { CreateContractModal } from './CreateContractModal';
import { AddBuildingModal } from './AddBuildingModal';
import { AddRoomModal } from './AddRoomModal';
import { AddTenantModal } from './AddTenantModal';

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
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(1);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [meters, setMeters] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear] = useState<number>(new Date().getFullYear());

  // Public Tenant E-Sign Mode
  const [publicSignToken, setPublicSignToken] = useState<string | null>(null);
  const [publicContractData, setPublicContractData] = useState<any>(null);
  const [publicSignSuccess, setPublicSignSuccess] = useState<any>(null);

  // Modals state
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
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
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/dashboard/stats?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/buildings`).then(r => r.json()),
        fetch(`${API_BASE}/rooms`).then(r => r.json()),
        fetch(`${API_BASE}/tenants`).then(r => r.json()),
        fetch(`${API_BASE}/meters?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/invoices?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
        fetch(`${API_BASE}/contracts`).then(r => r.json()),
        fetch(`${API_BASE}/settings`).then(r => r.json())
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value);
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
        setBuildings(results[1].value);
        if (results[1].value.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(results[1].value[0].id);
        }
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) setRooms(results[2].value);
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) setTenants(results[3].value);
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) setMeters(results[4].value);
      if (results[5].status === 'fulfilled' && Array.isArray(results[5].value)) setInvoices(results[5].value);
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) setContracts(results[6].value);
      if (results[7].status === 'fulfilled') setSettings(results[7].value || {});
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

  const handleSeedData = async () => {
    if (!confirm('Bạn có chắc chắn muốn nạp lại bộ dữ liệu mẫu 12 phòng Chung cư mini An Cư Pro?')) return;
    try {
      const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Đã nạp dữ liệu mẫu thành công!');
      fetchAllData();
    } catch {
      showToast('Lỗi khi nạp dữ liệu mẫu.');
    }
  };

  const handleAddBuildingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const payload = {
        name: formData.get('name'),
        address: formData.get('address'),
        total_floors: Number(formData.get('total_floors')),
        bank_id: formData.get('bank_id'),
        bank_account: formData.get('bank_account'),
        bank_owner: formData.get('bank_owner'),
        default_electric_rate: Number(formData.get('default_electric_rate')),
        default_water_rate: Number(formData.get('default_water_rate'))
      };
      const res = await fetch(`${API_BASE}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Đã thêm Tòa nhà / Dãy trọ mới thành công!');
        setShowAddBuildingModal(false);
        fetchAllData();
      } else {
        showToast('Không thể thêm tòa nhà.');
      }
    } catch {
      showToast('Lỗi khi thêm tòa nhà.');
    }
  };

  const handleAddRoomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const payload = {
        building_id: Number(formData.get('building_id')),
        room_number: formData.get('room_number'),
        floor: Number(formData.get('floor')),
        area: Number(formData.get('area')),
        base_price: Number(formData.get('base_price')),
        deposit: Number(formData.get('deposit')),
        wifi_fee: Number(formData.get('wifi_fee')),
        trash_fee: Number(formData.get('trash_fee')),
        parking_fee: Number(formData.get('parking_fee')),
        status: formData.get('status')
      };
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Đã thêm Phòng trọ mới thành công!');
        setShowAddRoomModal(false);
        fetchAllData();
      } else {
        showToast('Không thể thêm phòng trọ.');
      }
    } catch {
      showToast('Lỗi khi thêm phòng.');
    }
  };

  const handleAddTenantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const payload = {
        room_id: Number(formData.get('room_id')),
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        identity_card: formData.get('identity_card'),
        hometown: formData.get('hometown'),
        license_plate: formData.get('license_plate'),
        members_count: Number(formData.get('members_count')),
        start_date: formData.get('start_date'),
        notes: formData.get('notes')
      };
      const res = await fetch(`${API_BASE}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Đã thêm Khách thuê & Nhận phòng thành công!');
        setShowAddTenantModal(false);
        fetchAllData();
      } else {
        showToast('Không thể thêm khách thuê.');
      }
    } catch {
      showToast('Lỗi khi thêm khách thuê.');
    }
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      showToast('Lỗi khi gửi thông báo.');
    }
  };

  const handleCreateContractSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
    } catch {
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
    } catch {
      showToast('Lỗi khi gửi chữ ký.');
    }
  };

  // -------------------------------------------------------------
  // PUBLIC TENANT SIGNING VIEW (MOBILE-OPTIMIZED)
  // -------------------------------------------------------------
  if (publicSignToken && publicContractData) {
    const { contract, landlord } = publicContractData;
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#111726] text-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 space-y-6">
          <div className="text-center border-b border-white/10 pb-4">
            <span className="bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-indigo-500/20">
              Hợp Đồng Thuê Nhà Điện Tử · E-Sign Online
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white mt-2">
              Ký Hợp Đồng Thuê Phòng P.{contract.room_number}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{contract.building_name} — {contract.building_address}</p>
          </div>

          {publicSignSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Ký Hợp Đồng Thành Công!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Chữ ký số của bạn đã được lưu vào Hợp đồng số <strong>#{contract.contract_code}</strong>.
                </p>
              </div>

              <div className="bg-[#151d30] border-2 border-dashed border-indigo-500/40 rounded-3xl p-6 max-w-sm mx-auto space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-indigo-400 font-bold text-xs uppercase">
                  <QrCode className="w-4 h-4" /> Quét mã VietQR nộp tiền cọc giữ phòng
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
                  <img src={publicSignSuccess.vietqrUrl} alt="VietQR Deposit" className="w-64 h-64 mx-auto rounded-xl" />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>Số tiền cọc: <strong className="text-base text-indigo-400 font-black">{formatVND(publicSignSuccess.depositAmount)}</strong></p>
                  <p className="text-[11px] font-mono text-slate-400 bg-black/30 p-2 rounded-xl">
                    STK: <strong>{contract.bank_account}</strong> ({contract.bank_id}) - {contract.bank_owner}
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In / Lưu Hợp Đồng PDF
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-xs text-slate-300">
              <div className="bg-[#151d30] rounded-2xl p-4 border border-white/10 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Bên cho thuê (Chủ nhà):</span>
                    <p className="font-bold text-white text-sm">{landlord.name} ({landlord.phone})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Khách thuê phòng:</span>
                    <p className="font-bold text-white text-sm">{contract.tenant_name || 'Khách thuê'} ({contract.tenant_phone})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <span className="text-slate-400 font-medium">Giá thuê phòng:</span>
                    <p className="font-extrabold text-indigo-400 text-sm">{formatVND(contract.monthly_rent)}/tháng</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tiền đặt cọc giữ chỗ:</span>
                    <p className="font-extrabold text-amber-400 text-sm">{formatVND(contract.deposit_amount)}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  Thời hạn thuê: Từ <strong>{contract.start_date}</strong> đến <strong>{contract.end_date}</strong>.
                </div>
              </div>

              <div className="space-y-2 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" /> Cam Kết PCCC & Nội Quy Phòng Trọ
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
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
  // MAIN DASHBOARD (PREMIUM SIDEBAR LAYOUT)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-row font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-white/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (260PX) */}
      <aside className="w-64 bg-[#111726] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30 border border-white/15">
              TV
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-white">TroViet</span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Quản Lý Nhà Trọ 4.0</p>
            </div>
          </div>

          {/* Building Switcher Card */}
          <div className="bg-[#151d30] p-3 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
              <span>TÒA NHÀ QUẢN LÝ</span>
              <button
                onClick={() => setShowAddBuildingModal(true)}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                title="Thêm tòa nhà / dãy trọ mới"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
            
            {buildings.length > 0 ? (
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                className="w-full bg-[#0b101c] border border-white/10 text-white text-xs font-bold rounded-xl p-2 outline-none cursor-pointer"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setShowAddBuildingModal(true)}
                className="w-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl p-2 text-xs font-bold flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo Tòa Nhà Đầu Tiên
              </button>
            )}
          </div>

          {/* Vertical Menu Navigation */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" /> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'rooms' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" /> Danh sách phòng
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" /> Khách thuê
            </button>
            <button
              onClick={() => setActiveTab('meters')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'meters' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" /> Chốt điện & nước
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-400" /> Hóa đơn VietQR
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'contracts' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" /> Hợp đồng điện tử
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" /> Cài đặt & Tích hợp
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-white/10 space-y-3">
          <button
            onClick={handleSeedData}
            className="w-full bg-[#151d30] hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> Nạp dữ liệu mẫu
          </button>
          <div className="text-[10px] text-center text-slate-500">
            COSS Vietnam · TroViet Pro v1.0
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-[70px] bg-[#090d16]/80 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-base font-extrabold text-white">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Kinh Doanh'}
              {activeTab === 'rooms' && 'Quản Lý Sơ Đồ & Danh Sách Phòng'}
              {activeTab === 'tenants' && 'Quản Lý Hồ Sơ Khách Thuê'}
              {activeTab === 'meters' && 'Chốt Chỉ Số Điện (kWh) & Nước (m³)'}
              {activeTab === 'invoices' && 'Hóa Đơn Tiền Nhà & Thu Tiền VietQR'}
              {activeTab === 'contracts' && 'Hợp Đồng Thuê Nhà & Ký Số E-Sign'}
              {activeTab === 'settings' && 'Cấu Hình Chủ Nhà & Tích Hợp Bot'}
            </h2>
            <p className="text-xs text-slate-400">
              {buildings.find(b => b.id === selectedBuildingId)?.name || 'Chung Cư Mini An Cư Pro'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#151d30] border border-white/10 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 mr-2 font-medium">Kỳ thu:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-indigo-400 font-bold outline-none cursor-pointer pr-1"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">Tháng {m}</option>
                ))}
              </select>
              <span className="text-slate-400 font-bold">/{selectedYear}</span>
            </div>

            {activeTab === 'rooms' && (
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-4 h-4" /> Thêm Phòng
              </button>
            )}

            {activeTab === 'tenants' && (
              <button
                onClick={() => setShowAddTenantModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-4 h-4" /> Thêm Khách
              </button>
            )}

            {activeTab === 'contracts' && (
              <button
                onClick={() => setShowCreateContractModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-4 h-4" /> Tạo Hợp Đồng Ký Zalo
              </button>
            )}

            {activeTab === 'invoices' && (
              <button
                onClick={handleGenerateInvoices}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Zap className="w-4 h-4" /> Tính Tiền & Sinh Hóa Đơn
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 flex-1 max-w-7xl w-full">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-2 hover:border-indigo-500/40 transition">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                    <span>Tỷ Lệ Lấp Đầy</span>
                    <Building2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{stats.rooms.occupancyRate}%</span>
                    <span className="text-xs text-slate-400">({stats.rooms.occupied}/{stats.rooms.total} phòng)</span>
                  </div>
                </div>

                <div className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-2 hover:border-emerald-500/40 transition">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                    <span>Dự Kiến Thu Tháng {selectedMonth}</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatVND(stats.financials.totalExpected)}
                  </div>
                </div>

                <div className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-2 hover:border-rose-500/40 transition">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                    <span>Tiền Trọ Chưa Thu</span>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-rose-400">
                    {formatVND(stats.financials.totalUnpaid)}
                  </div>
                </div>

                <div className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-2 hover:border-amber-500/40 transition">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                    <span>Hợp Đồng Điện Tử</span>
                    <PenTool className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{contracts.length}</span>
                    <span className="text-xs text-amber-400">({contracts.filter(c => c.status === 'signed').length} đã ký)</span>
                  </div>
                </div>
              </div>

              {/* Room Grid Matrix */}
              <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" /> Sơ Đồ Danh Sách Khách & Phòng Trực Quan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Biết chính xác ai đang ở phòng nào và giá thuê tương ứng.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    Quản lý chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border transition text-center space-y-1.5 ${
                        r.status === 'occupied'
                          ? 'bg-[#151d30] border-white/10 text-slate-200'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <div className="font-black text-base">{r.room_number}</div>
                      <div className="text-xs font-bold truncate text-white">
                        {r.tenant_name ? `👤 ${r.tenant_name}` : '🟢 Phòng trống'}
                      </div>
                      <div className="text-[11px] font-bold text-indigo-400">{formatVND(r.base_price)}</div>
                      <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        r.status === 'occupied' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map(r => (
                  <div key={r.id} className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-4 hover:border-indigo-500/30 transition shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xl text-white">Phòng {r.room_number}</span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                            Tầng {r.floor} • {r.area} m²
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-400 mt-1">{formatVND(r.base_price)}<span className="text-[10px] text-slate-400 font-normal">/tháng</span></p>
                      </div>

                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                        r.status === 'occupied'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {r.status === 'occupied' ? '● Đang Thuê' : '○ Còn Trống'}
                      </span>
                    </div>

                    {r.status === 'occupied' ? (
                      <div className="bg-[#151d30] p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                            {r.tenant_name ? r.tenant_name.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-sm leading-tight">{r.tenant_name || 'Khách thuê'}</p>
                            <p className="text-[11px] text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                              📞 {r.tenant_phone || 'Chưa có SĐT'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div>
                            <span className="text-slate-400 block">Số người ở:</span>
                            <strong className="text-white">{r.members_count || 1} người</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tiền cọc giữ chỗ:</span>
                            <strong className="text-amber-400">{formatVND(r.deposit)}</strong>
                          </div>
                        </div>

                        {r.tenant_start_date && (
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                            Ngày bắt đầu ở: <strong className="text-slate-300">{r.tenant_start_date}</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 text-center space-y-2 text-xs">
                        <p className="text-emerald-300 font-bold">Phòng đang trống & sạch sẽ</p>
                        <p className="text-[11px] text-slate-400">Tiền cọc yêu cầu: {formatVND(r.deposit)}</p>
                        <button
                          onClick={() => setShowAddTenantModal(true)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm mt-1"
                        >
                          + Xếp Khách Vào Phòng Này
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-xs font-semibold">
                      <button
                        onClick={() => setActiveTab('invoices')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" /> Xem Hóa Đơn
                      </button>
                      <button
                        onClick={() => setActiveTab('contracts')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" /> Xem Hợp Đồng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TENANTS */}
          {activeTab === 'tenants' && (
            <div className="bg-[#111726] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#151d30] text-slate-400 font-bold uppercase border-b border-white/10">
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
                  <tbody className="divide-y divide-white/5">
                    {tenants.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition">
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
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-amber-200">
                <span>Chốt chỉ số Điện (kWh) và Nước (m³) tháng <strong>{selectedMonth}/{selectedYear}</strong>. Nhập số mới, hệ thống tự động tính số tiêu thụ.</span>
                <button
                  onClick={handleGenerateInvoices}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 inline mr-1" /> Đồng bộ sang Hóa đơn VietQR
                </button>
              </div>

              <div className="bg-[#111726] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#151d30] text-slate-400 font-bold uppercase border-b border-white/10">
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
                    <tbody className="divide-y divide-white/5">
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
                <div key={inv.id} className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-4 shadow-sm hover:border-white/20 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-lg text-white">Phòng {inv.room_number}</span>
                      <p className="text-[11px] font-mono text-slate-400">Mã: {inv.invoice_code}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {inv.status === 'paid' ? 'Đã Thu' : 'Chưa Thu'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-[#151d30] p-3 rounded-2xl border border-white/5">
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
                    <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-black text-indigo-400">
                      <span>TỔNG CỘNG:</span>
                      <span>{formatVND(inv.total_amount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                    <button
                      onClick={() => setShowInvoiceModal(inv)}
                      className="flex items-center justify-center gap-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 py-2 rounded-xl text-xs font-bold border border-indigo-500/30 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" /> VietQR
                    </button>
                    <button
                      onClick={() => setShowPosReceiptModal(inv)}
                      className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold transition border border-white/5"
                    >
                      <Printer className="w-3.5 h-3.5" /> In POS
                    </button>
                    <button
                      onClick={() => handleSendTelegram(inv.id)}
                      className="flex items-center justify-center gap-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 py-2 rounded-xl text-xs font-bold border border-sky-500/30 transition"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contracts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-[#111726] rounded-3xl border border-white/10">
                    Chưa có hợp đồng điện tử nào. Hãy bấm "Tạo Hợp Đồng Ký Zalo" ở góc trên bên phải.
                  </div>
                ) : (
                  contracts.map((c) => (
                    <div key={c.id} className="bg-[#111726] border border-white/10 rounded-3xl p-5 space-y-4 hover:border-white/20 transition shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-base font-black text-white">Phòng {c.room_number}</span>
                          <p className="text-[11px] font-mono text-slate-400">Mã: {c.contract_code}</p>
                        </div>
                        <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          c.status === 'signed' || c.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {c.status === 'completed' ? 'Hoàn tất' : c.status === 'signed' ? 'Đã ký số' : 'Chờ khách ký'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 bg-[#151d30] p-3 rounded-2xl border border-white/5">
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
                          <strong className="text-indigo-400">{formatVND(c.monthly_rent)}/tháng</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tiền cọc:</span>
                          <strong className="text-amber-400">{formatVND(c.deposit_amount)}</strong>
                        </div>
                      </div>

                      {c.tenant_signature && (
                        <div className="bg-white text-slate-900 p-2.5 rounded-xl border border-slate-700 text-center">
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">Chữ ký điện tử của khách:</span>
                          <img src={c.tenant_signature} alt="Chữ ký" className="h-10 mx-auto" />
                          <span className="text-[9px] text-slate-400 block mt-0.5">Ký lúc: {c.signed_at || 'Mới đây'}</span>
                        </div>
                      )}

                      <div className="space-y-2 pt-1 border-t border-white/10 text-xs font-bold">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCopySigningLink(c.token)}
                            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-indigo-500/30 transition"
                          >
                            <Copy className="w-3.5 h-3.5" /> Link Zalo
                          </button>

                          <button
                            onClick={() => {
                              window.open(`?sign_token=${c.token}`, '_blank');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl flex items-center justify-center gap-1.5 transition border border-white/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Mở Ký
                          </button>
                        </div>

                        {c.deposit_status !== 'paid' && (
                          <button
                            onClick={() => handleConfirmDeposit(c.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
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
            <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 max-w-2xl space-y-6">
              <h3 className="text-base font-bold text-white">Cấu Hình Thông Tin Chủ Nhà & Cổng VietQR</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tên Chủ Nhà / Đơn Vị Quản Lý</label>
                  <input
                    type="text"
                    defaultValue={settings.landlord_name || 'Nguyễn Trung An'}
                    className="w-full bg-[#151d30] border border-white/10 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại Chủ Nhà</label>
                  <input
                    type="text"
                    defaultValue={settings.landlord_phone || '0988.123.456'}
                    className="w-full bg-[#151d30] border border-white/10 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Tài Khoản Nhận Tiền VietQR</label>
                  <input
                    type="text"
                    defaultValue="0388999888"
                    className="w-full bg-[#151d30] border border-white/10 p-2.5 rounded-xl text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ngân Hàng (Napas 247)</label>
                  <input
                    type="text"
                    defaultValue="MBBank (Quân Đội)"
                    className="w-full bg-[#151d30] border border-white/10 p-2.5 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={() => showToast('Đã lưu cấu hình hệ thống thành công!')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ALL MODALS */}
      {showAddBuildingModal && (
        <AddBuildingModal
          onClose={() => setShowAddBuildingModal(false)}
          onSubmit={handleAddBuildingSubmit}
        />
      )}

      {showAddRoomModal && (
        <AddRoomModal
          buildings={buildings}
          onClose={() => setShowAddRoomModal(false)}
          onSubmit={handleAddRoomSubmit}
        />
      )}

      {showAddTenantModal && (
        <AddTenantModal
          rooms={rooms}
          onClose={() => setShowAddTenantModal(false)}
          onSubmit={handleAddTenantSubmit}
          formatVND={formatVND}
        />
      )}

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
