# 📖 SỔ TAY HƯỚNG DẪN SỬ DỤNG TROVIET PRO
> **Dành cho Chủ Nhà Trọ, Quản lý Tòa nhà & Căn hộ dịch vụ**

---

## BƯỚC 1: KHỞI ĐỘNG HỆ THỐNG
1. Nhấp đúp chuột vào file **`Mo-TroViet.bat`** hoặc biểu tượng **`TroViet Pro`** trên màn hình Desktop.
2. Trình duyệt Web sẽ tự động mở trang quản lý tại địa chỉ: `http://localhost:5173`.

---

## BƯỚC 2: QUẢN LÝ DANH SÁCH PHÒNG
- Nhấp vào mục **"Danh sách Phòng"** ở thanh bên trái.
- Bạn có thể xem toàn bộ các phòng theo màu sắc:
  - 🟢 **Màu Xanh:** Phòng đang có khách thuê.
  - ⚪ **Màu Xám:** Phòng còn trống sẵn sàng đón khách mới.
  - 🟡 **Màu Vàng:** Phòng đang sửa chữa hoặc bảo trì.
- Nhấp nút **"Thêm Phòng Mới"** để tạo phòng với đơn giá thuê, tiền cọc và đơn giá điện/nước tương ứng.

---

## BƯỚC 3: TIẾP NHẬN KHÁCH THUÊ & IN HỢP ĐỒNG
1. Nhấp vào mục **"Khách thuê"** -> Chọn **"Thêm Khách Thuê"**.
2. Nhập đầy đủ thông tin: Họ tên, Số điện thoại, Số CCCD, Quê quán, Biển số xe máy và Số người ở.
3. Chọn số phòng mà khách sẽ thuê. Hệ thống sẽ tự động chuyển phòng đó sang trạng thái **"Đang thuê"**.
4. Vào mục **"Hợp đồng Thuê nhà"** -> Kiểm tra thông tin -> Nhấn nút **"In Hợp Đồng A4"** để ký kết văn bản pháp lý với khách.

---

## BƯỚC 4: CHỐT SỐ ĐIỆN NƯỚC HÀNG THÁNG
1. Cuối tháng (từ ngày 28 đến ngày 02), vào mục **"Chốt Điện & Nước"**.
2. Nhập số công tơ Điện mới và Nước mới cho từng phòng.
3. Hệ thống sẽ tự động tính số KWh điện và m³ nước chênh lệch tiêu thụ.
4. Nhấn nút **"Lưu"** ở từng dòng hoặc nhấn **"⚡ Đồng bộ sang Hóa đơn"**.

---

## BƯỚC 5: XUẤT HÓA ĐƠN & THU TIỀN QUA VIETQR
1. Vào mục **"Hóa đơn & VietQR"** -> Nhấn nút **"Tính Tiền & Sinh Hóa Đơn"**.
2. Hệ thống sẽ tính tổng: `Tiền phòng + Tiền điện + Tiền nước + Wifi + Rác + Tiền xe`.
3. Nhấp vào nút **"VietQR"** của phòng tương ứng để hiển thị mã QR động:
   - Khách thuê chỉ cần mở App ngân hàng bất kỳ quét mã.
   - App ngân hàng sẽ tự điền chính xác số tiền và nội dung: `P101 TIEN NHA T05`.
4. Nếu khách trả tiền mặt, nhấn nút **"In POS"** để in phiếu thu nhiệt khổ 80mm gửi khách.
5. Sau khi nhận đủ tiền, nhấn nút **"✓ Xác Nhận Đã Thu"**.

---

## BƯỚC 6: CÀI ĐẶT THÔNG TIN TÀI KHOẢN NGÂN HÀNG
1. Vào mục **"Cài đặt & Tích hợp"**.
2. Điền thông tin Họ tên chủ nhà, Số điện thoại, Số tài khoản ngân hàng nhận tiền.
3. Nhấn **"Lưu Thay Đổi"** để toàn bộ mã VietQR sinh ra sẽ chuyển tiền thẳng về tài khoản của bạn.
