## ĐỀ XUẤT TECH STACK – WEBSITE ĐẶT ĐỒ ĂN (1 CỬA HÀNG, PWA)

### 1. Tổng quan giải pháp

Hệ thống được xây dựng theo hướng:

* Website mobile-first (ưu tiên trải nghiệm trên điện thoại)
* Có thể cài như app (PWA)
* Khách đặt hàng trực tiếp trên web
* Admin quản lý menu, đơn hàng
* Trạng thái đơn hàng được gửi thông báo qua WhatsApp

Thiết kế đảm bảo:

* Dễ sử dụng cho khách
* Dễ vận hành cho admin
* Có thể mở rộng sau này nếu cần

---

### 2. Frontend (User + Admin)

**Công nghệ đề xuất:**

* Next.js (App Router)
* TailwindCSS + ShadCN UI
* Zustand (quản lý state)
* React Query (fetch dữ liệu)

**Lý do:**

* Tối ưu mobile rất tốt (mượt, nhanh)
* SEO tốt (hiển thị menu trên Google)
* Code structure rõ ràng, dễ mở rộng
* Phù hợp làm PWA

---

### 3. PWA (Web như App)

**Tính năng:**

* Add to Home Screen (cài lên điện thoại)
* Load nhanh như app native
* Cache menu & hình ảnh
* Hoạt động ổn định trên mạng yếu

**Giải pháp:**

* Service Worker (next-pwa hoặc custom)

---

### 4. Backend

**Công nghệ đề xuất:**

* NestJS
* Prisma ORM
* PostgreSQL

**Lý do:**

* Backend mạnh, ổn định
* Dễ maintain, dễ scale
* Prisma xử lý tốt dữ liệu phức tạp (menu + topping)

---

### 5. Authentication

* HTTP-only Cookie
* Hash password bằng Argon2

**Ưu điểm:**

* Bảo mật cao
* Không dùng localStorage / bearer token
* F5 vẫn giữ trạng thái đăng nhập

---

### 6. Core Modules

#### 6.1 User

* Xem menu (không cần đăng nhập)
* Bắt buộc đăng nhập khi đặt hàng
* Đăng ký tài khoản với thông tin:

  * Email
  * Password
  * Số điện thoại
  * Vị trí (địa chỉ giao hàng)
  * WhatsApp (nếu có)
  * Telegram (nếu có)
* Theo dõi đơn hàng

---

#### 6.2 Menu

* Danh mục món
* Món ăn
* Hình ảnh
* Giá

---

#### 6.3 Topping (quan trọng)

* Nhóm topping (size, thêm topping…)
* Option trong nhóm
* Cho phép:

  * chọn 1 hoặc nhiều
  * cộng thêm giá

---

#### 6.4 Order

* Tạo đơn hàng
* Lưu chi tiết món + topping
* Trạng thái đơn:

```
PENDING → CONFIRMED → PREPARING → DELIVERING → COMPLETED / CANCELLED
```

---

#### 6.5 Admin

* Quản lý menu
* Quản lý topping
* Quản lý đơn hàng
* Cập nhật trạng thái đơn

---

### 7. WhatsApp Notification

**Giải pháp:**

* Tích hợp WhatsApp Business API (hoặc qua bên trung gian)

**Luồng hoạt động:**

* Khi tạo đơn:
  → gửi thông báo xác nhận
* Khi admin cập nhật trạng thái:
  → tự động gửi message tương ứng

**Ví dụ:**

* CONFIRMED → “Đơn hàng đã được xác nhận”
* PREPARING → “Đang chuẩn bị”
* DELIVERING → “Đang giao”

**Lưu ý:**

* WhatsApp API có chi phí theo tin nhắn
* Cần đăng ký business

---

### 8. Realtime / Tracking

**Giải pháp đề xuất:**

* User: polling 5–10s (đủ dùng, tiết kiệm chi phí)
* Admin: có thể thêm realtime (socket) nếu cần

---

### 9. Deploy

* Frontend: Vercel
* Backend: VPS (Docker)
* Database: PostgreSQL (VPS)

---

### 10. Định hướng mở rộng

Hệ thống có thể nâng cấp thêm:

* App mobile riêng (iOS / Android)
* Voucher / khuyến mãi
* Nhiều chi nhánh
* Tích hợp thanh toán online

---

### 11. Kết luận

Giải pháp này tập trung vào:

* Trải nghiệm đặt hàng nhanh, mượt trên mobile
* Quản lý đơn giản, dễ vận hành
* Chi phí hợp lý, không overbuild
* Có nền tảng để mở rộng khi cần

Phù hợp để triển khai nhanh và đưa vào vận hành thực tế.
