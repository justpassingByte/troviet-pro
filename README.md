# 🏢 TroViet Pro (SmartRental VN)
> **Phần mềm Quản lý Nhà Trọ, Căn hộ dịch vụ & Chung cư mini chuyên nghiệp 4.0**  
> Bản quyền phát triển & thương mại hóa: **COSS Vietnam**

---

## 🌟 Giới Thiệu Sản Phẩm
**TroViet Pro** là giải pháp phần mềm quản lý nhà trọ, phòng trọ, căn hộ mini khép kín và căn hộ dịch vụ được tối ưu hóa 100% cho thị trường và thói quen kinh doanh tại Việt Nam.

Hệ thống giúp chủ nhà trọ, quản lý tòa nhà tiết kiệm đến **90% thời gian** ghi chép chỉ số điện nước, tính toán hóa đơn, in phiếu thu và thu hồi công nợ tự động qua **VietQR Napas 247**.

---

## 🚀 Các Tính Năng Nổi Bật

| Tính năng | Mô tả chi tiết |
| :--- | :--- |
| 📊 **Bảng điều khiển trực quan** | Theo dõi tỷ lệ lấp đầy phòng, doanh thu tháng, số tiền đã thu, công nợ chưa thu theo thời gian thực. |
| 🏢 **Sơ đồ phòng ma trận trực quan** | Hiển thị màu sắc trạng thái (Xanh: Đang thuê, Xám: Trống, Vàng: Bảo trì). Quản lý giá phòng, tiền cọc, tầng. |
| 👥 **Quản lý Khách thuê & Hợp đồng** | Quản lý họ tên, số điện thoại, CCCD/CMND, quê quán, biển số xe, số người ở. In mẫu hợp đồng chuẩn pháp lý A4 1-Click. |
| ✍️ **Ký Hợp Đồng Điện Tử (E-Sign Add-on)** | Gửi link qua Zalo cho khách ở xa ký cảm ứng bằng ngón tay trên điện thoại, tự động sinh mã VietQR nộp cọc giữ phòng tức thì. |
| ⚡ **Chốt Điện & Nước Tự Động** | Nhập số cũ và số mới, tự động tính số KWh điện và m³ nước tiêu thụ, đối soát với tháng trước. |
| 💳 **Tích hợp VietQR Napas 247** | Tự động tạo mã QR động cho từng phòng, quét mã trên App ngân hàng tự điền đúng số tiền và nội dung chuyển khoản (VD: `P101 TIEN NHA T05`). |
| 🖨️ **In Phiếu Thu POS 80mm** | Hỗ trợ in nhiệt tiêu chuẩn POS 80mm ngay tại quầy hoặc xuất hóa đơn PDF. |
| 🤖 **Nhắc nợ Zalo & Telegram** | Tích hợp sẵn mẫu thông báo và webhook gửi nhắc nợ tiền phòng tự động kèm mã QR. |
| ⚡ **Cài đặt 1-Click & Siêu Nhẹ** | Chạy trực tiếp trên Windows (File .bat mở ngay) hoặc triển khai Docker VPS 24/7. |

---

## 💰 Bảng Giá Thương Mại Đề Xuất

| Gói Bản Quyền | Giá Đề Xuất | Quyền Lợi |
| :--- | :--- | :--- |
| **Gói Trọn Đời (Local Desktop 0đ)** | **1.490.000 VNĐ** *(Vĩnh viễn)* | Cài đặt 1-Click trên máy tính Windows, không phí duy trì hàng tháng, lưu trữ dữ liệu vĩnh viễn trên máy tính cá nhân. |
| **Gói Cloud VPS 24/7 (Đa thiết bị)** | **2.990.000 VNĐ** *(Vĩnh viễn)* | Cung cấp mã nguồn + Docker Compose chạy 24/7 trên VPS, truy cập từ mọi nơi bằng Điện thoại / iPad / Laptop. |
| **Gói Doanh Nghiệp / White-Label** | **5.990.000 VNĐ** | Đổi toàn bộ thương hiệu, Logo, Tên công ty, Tích hợp cổng Zalo ZNS / SMS Brandname riêng. |

---

## 🛠️ Hướng Dẫn Cài Đặt 1-Click

### 🖥️ Trên Windows (Dành cho Chủ Nhà Trọ)
1. Cài đặt **Node.js LTS** từ [https://nodejs.org](https://nodejs.org) (nếu máy chưa có).
2. Nhấp đúp chuột vào file `Tao-Shortcut-Desktop.bat` để tạo biểu tượng ra màn hình.
3. Nhấp đúp vào **TroViet Pro** trên Desktop hoặc chạy file `Mo-TroViet.bat` để sử dụng ngay!

### ☁️ Trên Linux VPS (Dành cho Triển Khai Cloud 24/7)
```bash
git clone <repo-url> troviet-pro
cd troviet-pro
chmod +x install.sh
./install.sh
```

---

## 📂 Cấu Trúc Mã Nguồn
```
troviet-pro/
├── backend/            # Express.js + TypeScript + SQLite Engine
│   ├── src/
│   │   ├── db.ts       # Database schema & SQLite Connection
│   │   ├── vietqr.ts   # VietQR Engine generator
│   │   ├── seed.ts     # Bộ dữ liệu mẫu 12 phòng An Cư Pro
│   │   └── index.ts    # REST API endpoints
│   └── package.json
├── frontend/           # React + Vite + Tailwind CSS + Lucide
│   ├── src/
│   │   ├── App.tsx     # Full Dashboard UI + Invoices + POS Print
│   │   └── index.css   # Print styles (POS 80mm & A4 Contract)
│   └── package.json
├── Mo-TroViet.bat      # 1-Click Windows Launcher
├── Tao-Shortcut-Desktop.bat # 1-Click Desktop Shortcut Generator
├── Nap-Du-Lieu-Mau.bat # 1-Click Seed Data Loader
├── Dockerfile          # Multi-stage production build
├── docker-compose.yml  # Docker compose orchestration
├── README.md           # Giới thiệu & Bảng giá
├── HUONG_DAN_SU_DUNG.md # Sổ tay chi tiết cho chủ nhà trọ
└── HUONG_DAN_CHO_NGUOI_MUA.md # Hướng dẫn bắt đầu trong 3 phút
```

---

## 📞 Hỗ Trợ Kỹ Thuật & Thương Mại
- **Đơn vị phát triển:** COSS Vietnam
- **Hotline / Zalo hỗ trợ:** 0988.xxx.xxx
- **Email:** support@coss.vn