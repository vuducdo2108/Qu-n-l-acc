# ⚔️ AOV ACC MASTER - WEB QUẢN LÝ TÀI KHOẢN LIÊN QUÂN MOBILE

Hệ thống web chuyên nghiệp, hiện đại và bảo mật dành cho chủ shop, người bán nick, người cho thuê tài khoản hoặc game thủ quản lý kho tài khoản Liên Quân Mobile (Arena of Valor).

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 🎮 Quản Lý Kho Tài Khoản Toàn Diện (Card View & Table View)
- Xem dạng **Thẻ Gaming sống động** (Card View) hoặc **Bảng dữ liệu cô đọng** (Table View).
- Quản lý chi tiết từng thông số:
  - **Tên In-game, Bậc Rank** (Đồng ➡️ Thách Đấu kèm số sao), Rank cao nhất.
  - **Số Tướng, Số Trang phục (Skin), Tỉ lệ thắng (Win Rate), Điểm Uy tín, Bảng Ngọc**.
  - **Tag Trang phục Hot / Quý hiếm** (SSS, Thứ Nguyên Vệ Thần, Tuyệt Sắc, Anime Collab: Kimetsu no Yaiba, SAO, Bleach...).
  - **Tình trạng thông tin bảo mật**: Trắng thông tin 100%, Đổi được SĐT, Có email xác thực, Facebook...
  - **Tài khoản & Mật khẩu**: Nút sao chép nhanh 1-click, nút con mắt ẩn/hiện mật khẩu.
  - **Ảnh chụp màn hình (Screenshots)**: Hỗ trợ upload ảnh trực tiếp từ máy tính hoặc dán link ảnh online, xem ảnh phóng to bằng Lightbox.

### 2. ⚡ Thao Tác Bán Nhanh & Tạo Mẫu Bill Bàn Giao (Delivery Invoices)
- **1-Click Đánh Dấu Đã Bán**: Tự động tính toán doanh thu và lợi nhuận ròng.
- **Tạo Bill Bàn Giao Cho Khách**: Tự động sinh văn bản bàn giao tài khoản chuẩn đẹp, có hướng dẫn bảo mật cho người mua, sao chép 1-click gửi qua Zalo / Facebook Messenger.

### 3. ⏱️ Theo Dõi Thuê Nick Thời Gian Thực (Rental Tracker)
- Quản lý danh sách tài khoản đang cho thuê.
- Ghi nhận thông tin người thuê, số điện thoại / Zalo, tiền thuê và thời lượng thuê.
- **Đồng hồ đếm ngược từng giây** (realtime countdown) và **tự động cảnh báo khi hết giờ**.
- Nút "Nhận Lại Nick" chỉ với 1 click để đưa tài khoản về kho sẵn sàng bán.

### 4. 🚀 Nhập Hàng Loạt Siêu Tốc (Bulk Quick Import)
- Dán danh sách tài khoản dạng:
  ```text
  TàiKhoản|MậtKhẩu|BậcRank|GiáBán|TênInGame|SkinNổiBật
  ```
- Nhập cùng lúc 10 - 100 tài khoản trong vài giây.

### 5. 📊 Dashboard & Biểu Đồ Thống Kê
- Tổng vốn tồn kho, Tổng giá trị niêm yết, Tổng doanh thu đã bán, Lợi nhuận ròng thực tế.
- Biểu đồ cột phân bố Bậc Rank trong kho (Chart.js).
- Biểu đồ tròn phân loại tình trạng thông tin tài khoản.

### 6. 💾 Sao Lưu & Xuất Dữ Liệu An Toàn
- **Xuất file Excel / CSV**: Để tiện theo dõi trên Google Sheets hoặc Microsoft Excel.
- **Sao lưu JSON (Backup & Restore)**: Tải file backup về máy tính hoặc khôi phục dữ liệu bất cứ lúc nào.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY

### Cách 1: Chạy bằng file `start.bat` (Khuyên Dùng Trên Windows)
- Nhấp đúp chuột vào file `start.bat` trong thư mục `e:\PN232\ACC`.
- Trình duyệt sẽ tự động mở trang web tại địa chỉ: `http://localhost:3050`.

### Cách 2: Chạy bằng dòng lệnh Terminal
```bash
npm install
npm start
```
Mở trình duyệt truy cập: `http://localhost:3050`

---

## 📂 CẤU TRÚC DỰ ÁN
```
ACC/
├── server.js              # Express Backend & RESTful APIs
├── package.json           # Cấu hình dự án & dependencies
├── start.bat              # Script khởi động 1-click trên Windows
├── data/
│   └── accounts.json      # File lưu trữ cơ sở dữ liệu tài khoản
├── uploads/               # Thư mục lưu trữ ảnh chụp màn hình tải lên
└── public/
    ├── index.html         # Giao diện chính (SPA)
    ├── css/
    │   └── style.css      # Custom Gaming CSS & Rank Badges
    └── js/
        └── app.js         # Toàn bộ logic frontend, filter, charts, timers
```

