import React, { useState, useEffect } from 'react';
import {
  Home,
  Building2,
  Users,
  Zap,
  Droplets,
  Receipt,
  FileText,
  Settings,
  Plus,
  Printer,
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Phone,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Download
} from 'lucide-react';

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
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear] = useState<number>(new Date().getFullYear());

  // Modals state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<any>(null);
  const [showContractModal, setShowContractModal] = useState<any>(null);
  const [showPosReceiptModal, setShowPosReceiptModal] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states
  const [roomFilterStatus, setRoomFilterStatus] = useState<string>('all');
  const [tenantSearchQuery, setTenantSearchQuery] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resStats, resRooms, resTenants, resMeters, resInvoices, resSettings] = await Promise.all([
        fetch(`/api/dashboard/stats?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()).catch(() => null),
        fetch('/api/rooms').then(r => r.json()).catch(() => []),
        fetch('/api/tenants').then(r => r.json()).catch(() => []),
        fetch(`/api/meter-readings?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()).catch(() => []),
        fetch(`/api/invoices?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()).catch(() => []),
        fetch('/api/settings').then(r => r.json()).catch(() => ({}))
      ]);

      if (resStats) setStats(resStats);
      if (Array.isArray(resRooms)) setRooms(resRooms);
      if (Array.isArray(resTenants)) setTenants(resTenants);
      if (Array.isArray(resMeters)) setMeters(resMeters);
      if (Array.isArray(resInvoices)) setInvoices(resInvoices);
      if (resSettings) setSettings(resSettings);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth, selectedYear]);



  const handleGenerateInvoices = async () => {
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      const data = await res.json();
      showToast(`Đã sinh thành công ${data.count} hóa đơn tháng ${selectedMonth}/${selectedYear} kèm mã VietQR!`);
      fetchAllData();
    } catch (e) {
      showToast('Lỗi khi sinh hóa đơn.');
    }
  };

  const handlePayInvoice = async (invoiceId: number, fullAmount: number) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_amount: fullAmount })
      });
      if (res.ok) {
        showToast('Đã xác nhận thanh toán thành công!');
        fetchAllData();
        if (showInvoiceModal) {
          setShowInvoiceModal({ ...showInvoiceModal, status: 'paid', paid_amount: fullAmount });
        }
      }
    } catch (e) {
      showToast('Lỗi xác nhận thanh toán.');
    }
  };

  const handleSendTelegram = async (invoiceId: number) => {
    try {
      const res = await fetch('/api/notify/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId })
      });
      const data = await res.json();
      showToast(data.message || 'Đã kích hoạt gửi tin nhắn Telegram thành công!');
    } catch (e) {
      showToast('Lỗi gửi Telegram.');
    }
  };

  const handleSaveMeter = async (roomId: number, oldE: number, newE: number, oldW: number, newW: number) => {
    try {
      await fetch('/api/meter-readings', {
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
      showToast('Đã lưu chỉ số điện nước thành công!');
      fetchAllData();
    } catch (e) {
      showToast('Lỗi lưu chỉ số.');
    }
  };

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 no-print">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-lg">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1">
              TroViet <span className="text-xs bg-indigo-500/30 text-indigo-400 border border-indigo-400/30 px-1.5 py-0.5 rounded font-bold">PRO</span>
            </h1>
            <p className="text-xs text-slate-400">SmartRental VN System</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Home className="w-4 h-4" /> Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'rooms' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Building2 className="w-4 h-4" /> Danh sách Phòng
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Khách thuê
          </button>
          <button
            onClick={() => setActiveTab('meters')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'meters' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Zap className="w-4 h-4 text-amber-400" /> Chốt Điện & Nước
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Receipt className="w-4 h-4 text-emerald-400" /> Hóa đơn & VietQR
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'contracts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Hợp đồng Thuê nhà
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> Cài đặt & Tích hợp
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-[11px] text-center text-slate-500">
            COSS Vietnam © 2025 TroViet Pro
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'rooms' && 'Quản Lý Danh Sách Phòng'}
              {activeTab === 'tenants' && 'Quản Lý Danh Sách Khách Thuê'}
              {activeTab === 'meters' && 'Chốt Chỉ Số Điện & Nước Hàng Tháng'}
              {activeTab === 'invoices' && 'Quản Lý Hóa Đơn & Thanh Toán VietQR'}
              {activeTab === 'contracts' && 'Mẫu Hợp Đồng Thuê Nhà Pháp Lý'}
              {activeTab === 'settings' && 'Cấu Hình Hệ Thống & Tích Hợp'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tòa nhà: <span className="font-semibold text-indigo-600">Chung Cư Mini An Cư Pro - Cầu Giấy, Hà Nội</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="px-2 py-1 text-slate-600 font-medium">Tháng:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer pr-2"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>Tháng {m}/{selectedYear}</option>
                ))}
              </select>
            </div>

            {activeTab === 'invoices' && (
              <button
                onClick={handleGenerateInvoices}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Zap className="w-3.5 h-3.5" /> Tính Tiền & Sinh Hóa Đơn
              </button>
            )}

            {activeTab === 'rooms' && (
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Phòng Mới
              </button>
            )}

            {activeTab === 'tenants' && (
              <button
                onClick={() => setShowAddTenantModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Khách Thuê
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Body Views */}
        <div className="p-6 space-y-6 flex-1">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Số Phòng</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.rooms.total}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {stats.rooms.occupancyRate}% Đã Thuê
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.rooms.occupied} đang thuê • {stats.rooms.available} còn trống
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dự Kiến Thu Tháng {selectedMonth}</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{formatVND(stats.financials.totalExpected)}</p>
                    <p className="text-xs text-slate-400 mt-1">Gồm tiền phòng + điện nước dịch vụ</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã Thu Thực Tế</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{formatVND(stats.financials.totalCollected)}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {stats.financials.totalExpected > 0 ? Math.round((stats.financials.totalCollected / stats.financials.totalExpected) * 100) : 0}% hoàn thành
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chưa Thu (Công Nợ)</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{formatVND(stats.financials.totalUnpaid)}</p>
                    <p className="text-xs text-slate-400 mt-1">Cần gửi nhắc nợ qua VietQR</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Room Grid Matrix */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Sơ Đồ Phòng Trực Quan (12 Phòng)</h3>
                    <p className="text-xs text-slate-500">Màu xanh: Đang thuê | Màu xám: Trống | Màu cam: Sửa chữa</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Đang thuê ({stats.rooms.occupied})</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Còn trống ({stats.rooms.available})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => { setActiveTab('rooms'); }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        r.status === 'occupied'
                          ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 hover:shadow-md'
                          : r.status === 'maintenance'
                          ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base text-slate-800">{r.room_number}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          r.status === 'occupied' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Tầng {r.floor}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-indigo-700 mt-2">{formatVND(r.base_price)}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {r.tenant_name ? `👤 ${r.tenant_name}` : '🚪 Phòng trống'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Lọc theo trạng thái:</span>
                  <button
                    onClick={() => setRoomFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roomFilterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Tất cả ({rooms.length})
                  </button>
                  <button
                    onClick={() => setRoomFilterStatus('occupied')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roomFilterStatus === 'occupied' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Đang thuê ({rooms.filter(r => r.status === 'occupied').length})
                  </button>
                  <button
                    onClick={() => setRoomFilterStatus('available')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roomFilterStatus === 'available' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Trống ({rooms.filter(r => r.status === 'available').length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms
                  .filter(r => roomFilterStatus === 'all' || r.status === roomFilterStatus)
                  .map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{r.room_number}</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">Tầng {r.floor}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Diện tích: {r.area} m²</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          r.status === 'occupied' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status === 'occupied' ? 'Đang thuê' : 'Trống'}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Giá thuê:</span>
                          <span className="font-bold text-indigo-700">{formatVND(r.base_price)}/tháng</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tiền cọc:</span>
                          <span className="font-semibold text-slate-800">{formatVND(r.deposit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Đơn giá Điện / Nước:</span>
                          <span className="text-slate-700">{formatVND(r.electricity_rate)}/kWh • {formatVND(r.water_rate)}/m³</span>
                        </div>
                        {r.tenant_name ? (
                          <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-600" /> {r.tenant_name} ({r.members_count || 1} người)
                            </p>
                            <p className="text-[11px] text-indigo-700 mt-0.5">📞 {r.tenant_phone}</p>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                            Chưa có khách thuê
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setShowContractModal(r);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> Mẫu Hợp Đồng
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: TENANTS */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm khách theo Tên, Số điện thoại, CCCD, Biển số xe hoặc Số phòng..."
                  value={tenantSearchQuery}
                  onChange={(e) => setTenantSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800"
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="p-4">Phòng</th>
                        <th className="p-4">Họ và Tên</th>
                        <th className="p-4">Số Điện Thoại</th>
                        <th className="p-4">Số CCCD</th>
                        <th className="p-4">Quê Quán</th>
                        <th className="p-4">Biển Số Xe</th>
                        <th className="p-4">Số Người</th>
                        <th className="p-4">Ngày Vào</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenants
                        .filter(t => {
                          const q = tenantSearchQuery.toLowerCase();
                          return (
                            (t.full_name || '').toLowerCase().includes(q) ||
                            (t.phone || '').toLowerCase().includes(q) ||
                            (t.identity_card || '').toLowerCase().includes(q) ||
                            (t.room_number || '').toLowerCase().includes(q)
                          );
                        })
                        .map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4 font-black text-indigo-700 text-sm">{t.room_number || '---'}</td>
                            <td className="p-4 font-bold text-slate-900">{t.full_name}</td>
                            <td className="p-4 font-medium text-slate-700">{t.phone}</td>
                            <td className="p-4 font-mono text-slate-600">{t.identity_card || '---'}</td>
                            <td className="p-4 text-slate-600">{t.hometown || '---'}</td>
                            <td className="p-4 font-semibold text-slate-800">{t.license_plate || '---'}</td>
                            <td className="p-4 text-center font-bold text-slate-800">{t.members_count}</td>
                            <td className="p-4 text-slate-500">{t.start_date || '---'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: METERS (Chốt Điện Nước) */}
          {activeTab === 'meters' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Chốt chỉ số Điện (kWh) và Nước (m³) tháng <strong>{selectedMonth}/{selectedYear}</strong>. Nhập số mới, hệ thống tự tính số tiêu thụ và chi phí.</span>
                </div>
                <button
                  onClick={handleGenerateInvoices}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                >
                  ⚡ Đồng bộ sang Hóa đơn
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
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
                    <tbody className="divide-y divide-slate-100">
                      {meters.map(m => (
                        <MeterRow
                          key={m.room_id}
                          item={m}
                          onSave={handleSaveMeter}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INVOICES & VIETQR */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map(inv => (
                  <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-lg text-slate-900">{inv.room_number}</span>
                        <p className="text-xs text-slate-500">Mã: {inv.invoice_code}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thu'}
                      </span>
                    </div>

                    <div className="my-4 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Tiền phòng:</span>
                        <span className="font-semibold">{formatVND(inv.room_fee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Điện ({inv.electric_usage} kWh):</span>
                        <span className="font-semibold">{formatVND(inv.electric_fee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Nước ({inv.water_usage} m³):</span>
                        <span className="font-semibold">{formatVND(inv.water_fee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Dịch vụ (Wifi, Rác, Xe):</span>
                        <span className="font-semibold">{formatVND(inv.wifi_fee + inv.trash_fee + inv.parking_fee)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-indigo-700">
                        <span>TỔNG CỘNG:</span>
                        <span>{formatVND(inv.total_amount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowInvoiceModal(inv)}
                        className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-xs font-bold transition"
                      >
                        <QrCode className="w-3.5 h-3.5" /> VietQR
                      </button>
                      <button
                        onClick={() => setShowPosReceiptModal(inv)}
                        className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> In POS
                      </button>
                      <button
                        onClick={() => handleSendTelegram(inv.id)}
                        className="flex items-center justify-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 py-2 rounded-lg text-xs font-bold transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Nhắc Nợ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LEGAL CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b pb-4 no-print">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mẫu Hợp Đồng Thuê Phòng Trọ Chuẩn Pháp Lý Việt Nam</h3>
                  <p className="text-xs text-slate-500">Tự động điền theo thông tin phòng & chủ nhà trọ</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition"
                >
                  <Printer className="w-4 h-4" /> In Hợp Đồng A4
                </button>
              </div>

              {/* Printable Legal Contract A4 */}
              <div id="printable-area" className="text-slate-800 text-xs leading-relaxed space-y-4 p-4 font-serif">
                <div className="text-center space-y-1">
                  <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-semibold text-xs underline">Độc lập - Tự do - Hạnh phúc</p>
                  <h2 className="text-base font-bold pt-4">HỢP ĐỒNG THUÊ PHÒNG TRỌ / CĂN HỘ MINI</h2>
                  <p className="italic text-[11px]">(Số: HĐ-2025/ANCUPRO)</p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-bold">Hôm nay, ngày ..... tháng ..... năm 2025, tại địa chỉ Số 18 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội. Chúng tôi gồm:</p>
                  
                  <div className="bg-slate-50 p-3 rounded border">
                    <p className="font-bold text-slate-900">BÊN CHO THUÊ (BÊN A):</p>
                    <p>• Họ và tên: <strong>{settings.landlord_name || 'Nguyễn Trung An'}</strong></p>
                    <p>• CCCD/CMND: {settings.landlord_identity || '001095012345'}</p>
                    <p>• Số điện thoại: {settings.landlord_phone || '0988.123.456'}</p>
                    <p>• Địa chỉ: {settings.landlord_address || 'Số 18 Ngõ 165 Cầu Giấy, Cầu Giấy, Hà Nội'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border">
                    <p className="font-bold text-slate-900">BÊN THUÊ (BÊN B):</p>
                    <p>• Họ và tên: ............................................................................</p>
                    <p>• Số CCCD/CMND: ................................... Ngày cấp: .................. Nơi cấp: ..................</p>
                    <p>• Số điện thoại: ........................................... Quê quán: ...........................................</p>
                    <p>• Biển số xe máy: ........................................ Số người ở thực tế: .................................</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ</p>
                    <p>1. Bên A đồng ý cho Bên B thuê phòng số: <strong>P101 / Căn hộ mini An Cư Pro</strong>.</p>
                    <p>2. Thời hạn thuê: 12 tháng kể từ ngày ký hợp đồng.</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">ĐIỀU 2: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</p>
                    <p>1. Giá thuê phòng cơ bản: <strong>3.800.000 đ/tháng</strong> (Ba triệu tám trăm nghìn đồng).</p>
                    <p>2. Tiền đặt cọc giữ phòng và tài sản: <strong>3.800.000 đ</strong>.</p>
                    <p>3. Chi phí dịch vụ: Tiền điện: 3.800 đ/kWh, Tiền nước: 30.000 đ/m³, Wifi: 100.000 đ/phòng, Vệ sinh rác: 50.000 đ/phòng.</p>
                    <p>4. Thanh toán định kỳ từ ngày 01 đến ngày 05 hàng tháng qua mã VietQR chuyển khoản ngân hàng.</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">ĐIỀU 3: TRÁCH NHIỆM HAI BÊN</p>
                    <p>• Bên B cam kết giữ gìn vệ sinh chung, phòng cháy chữa cháy an toàn, không tàng trữ chất cấm, không gây ồn ào sau 23h đêm.</p>
                    <p>• Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
                  </div>

                  <div className="grid grid-cols-2 text-center pt-8 font-bold">
                    <div>
                      <p>ĐẠI DIỆN BÊN B</p>
                      <p className="text-[10px] font-normal italic">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div>
                      <p>ĐẠI DIỆN BÊN A</p>
                      <p className="text-[10px] font-normal italic">(Ký và ghi rõ họ tên)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-6">
              <h3 className="text-base font-bold text-slate-900">Cấu hình Thông tin Chủ nhà & Tích hợp Bot</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên Chủ Nhà / Đơn Vị Quản Lý</label>
                  <input
                    type="text"
                    defaultValue={settings.landlord_name || 'Nguyễn Trung An'}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại Chủ Nhà</label>
                  <input
                    type="text"
                    defaultValue={settings.landlord_phone || '0988.123.456'}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Tài Khoản Nhận Tiền VietQR</label>
                  <input
                    type="text"
                    defaultValue="0388999888"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngân Hàng (Napas 247)</label>
                  <input
                    type="text"
                    defaultValue="MBBank (Quân Đội)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" /> Tích hợp Telegram Bot & Zalo Webhook Nhắc Nợ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">Telegram Bot Token (tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="123456789:ABCdef..."
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Telegram Group Chat ID</label>
                    <input
                      type="text"
                      placeholder="-100123456789"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => showToast('Đã lưu cấu hình hệ thống thành công!')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: VIETQR DETAIL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Thanh Toán VietQR Phòng {showInvoiceModal.room_number}</span>
              <button onClick={() => setShowInvoiceModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={showInvoiceModal.vietqr_url}
                alt="VietQR Pro"
                className="w-full h-auto rounded-xl shadow-sm"
              />
            </div>

            <div className="text-xs space-y-1">
              <p className="text-slate-500">Số tiền cần thanh toán:</p>
              <p className="text-xl font-black text-indigo-700">{formatVND(showInvoiceModal.total_amount)}</p>
              <p className="text-[11px] font-mono text-slate-600 bg-slate-100 p-1.5 rounded mt-1">
                Nội dung: <strong>{showInvoiceModal.room_number} TIEN NHA T{showInvoiceModal.month}</strong>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {showInvoiceModal.status !== 'paid' && (
                <button
                  onClick={() => handlePayInvoice(showInvoiceModal.id, showInvoiceModal.total_amount)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow transition"
                >
                  ✓ Xác Nhận Đã Thu
                </button>
              )}
              <button
                onClick={() => setShowInvoiceModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POS 80MM RECEIPT */}
      {showPosReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b no-print">
              <span className="font-bold text-xs text-slate-800">Phiếu Thu POS 80mm</span>
              <button onClick={() => setShowPosReceiptModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            {/* Receipt Body */}
            <div id="printable-area" className="pos-receipt mx-auto text-center text-xs font-mono text-slate-900 space-y-2 p-2 border border-dashed border-slate-300">
              <p className="font-bold text-sm">CHUNG CƯ MINI AN CƯ PRO</p>
              <p className="text-[10px]">165 Cầu Giấy, Hà Nội • ĐT: 0988.123.456</p>
              <p className="font-bold text-xs pt-1 border-t border-dashed">PHIẾU THU TIỀN NHÀ</p>
              <p className="text-[10px] text-slate-500">Tháng {showPosReceiptModal.month}/{showPosReceiptModal.year} - {showPosReceiptModal.room_number}</p>
              
              <div className="text-left text-[11px] space-y-1 pt-2 border-t border-dashed">
                <div className="flex justify-between">
                  <span>Tiền phòng:</span>
                  <span>{formatVND(showPosReceiptModal.room_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Điện ({showPosReceiptModal.electric_usage} kWh):</span>
                  <span>{formatVND(showPosReceiptModal.electric_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nước ({showPosReceiptModal.water_usage} m³):</span>
                  <span>{formatVND(showPosReceiptModal.water_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ khác:</span>
                  <span>{formatVND(showPosReceiptModal.wifi_fee + showPosReceiptModal.trash_fee + showPosReceiptModal.parking_fee)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t font-bold text-xs">
                  <span>TỔNG TIỀN:</span>
                  <span>{formatVND(showPosReceiptModal.total_amount)}</span>
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
                onClick={() => setShowPosReceiptModal(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Meter Reading Row
function MeterRow({ item, onSave }: { item: any; onSave: any }) {
  const [oldE, setOldE] = useState(item.old_electric || 0);
  const [newE, setNewE] = useState(item.new_electric || 0);