# ⚡ Enterprise Multi-Tenant InsurTech Configuration Engine

![Architecture: Node.js + PostgreSQL JSONB + HTMX](https://img.shields.io/badge/Architecture-Multi--Tenant_SaaS-blue?style=for-the-badge)
![Tech Stack: Express & Nunjucks](https://img.shields.io/badge/Backend-Node.js_%7C_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL: JSONB Engine](https://img.shields.io/badge/Database-PostgreSQL_JSONB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Frontend: HTMX & Alpine.js](https://img.shields.io/badge/Frontend-HTMX_%7C_Alpine.js_%7C_Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Một nền tảng quản trị và thực thi cấu hình bảo hiểm đa khách hàng (Multi-Tenant SaaS) tiêu chuẩn doanh nghiệp. Được thiết kế với mục tiêu **Zero-Code Onboarding**, cho phép các đối tác bảo hiểm tùy biến toàn bộ quy tắc phê duyệt, định tuyến bồi thường, tính toán SLA, và kênh thông báo hoàn toàn thông qua giao diện UI trực quan mà không cần can thiệp bất kỳ dòng mã nguồn nào.

> [!IMPORTANT]
> **🌟 ĐÁNH GIÁ & NGHIỆM THU (DÀNH CHO NHÀ TUYỂN DỤNG / TECH LEADS):**
> - **🔗 Ứng dụng Trực tuyến (Live Demo):** [https://ai-challenge-15.onrender.com/](https://ai-challenge-15.onrender.com/)
> - **📖 Hướng dẫn Đánh giá Chi tiết (Evaluation Walkthrough):** Xem file **[EVALUATION_GUIDE.md](./EVALUATION_GUIDE.md)** để rà soát và kiểm chứng trọn vẹn toàn bộ 8 tiêu chí nghiệm thu của đề bài chỉ trong chưa đầy 5 phút!

---

## 🌟 Điểm nhấn Kiến trúc Kỹ thuật (Key Engineering Highlights)

### 1. 🚀 Zero-Code Tenant Onboarding
- Thêm mới một đối tác bảo hiểm thứ 4, thứ 5 hay thứ 100 hoàn toàn trên giao diện UI. Hệ thống tự động thiết lập phân vùng dữ liệu và ngay lập tức khả dụng trên đường ống xử lý bồi thường (Runtime Engine).
- **Kiến trúc dữ liệu Hybrid**: Kết hợp sức mạnh truy vấn quan hệ của PostgreSQL cho thông tin định danh và sự linh hoạt vô hạn của trường `JSONB` cho lược đồ cấu hình đa chiều.

### 2. 🛡️ Quản lý Phiên bản Bất biến (Immutable Versioning & Git-style Rollback)
- Mỗi lượt lưu cấu hình đều tạo ra một bản chụp lịch sử (snapshot) bất biến với mã phiên bản tuần tự (`v1`, `v2`, `v3`...) kèm bắt buộc nhập ghi chú cam kết (`Change Note`).
- **Cơ chế Rollback Additive**: Khi thực hiện khôi phục về phiên bản cũ, hệ thống không bao giờ ghi đè hay xóa lịch sử, mà tạo ra một phiên bản mới nhất kế thừa toàn bộ tham số của mốc được khôi phục, đảm bảo tính minh bạch tuyệt đối cho quy trình kiểm toán (Audit Trail).

### 3. ⚖️ So sánh Ma trận Song song (Side-by-Side Configuration Diff)
- Thuật toán phân tích cấu hình cho phép so sánh đối chiếu trực tiếp giữa 2 Tenant bất kỳ trên 7 chiều tham số: Branding, Giấy tờ yêu cầu, Phân cấp phê duyệt, Kênh thông báo, SLA ngày làm việc, và Custom Metadata.
- Hệ thống tự động làm nổi bật các điểm khác biệt (Highlight Diff) giúp quản trị viên dễ dàng rà soát lỗi cấu hình.

### 4. 🧪 Chế độ Sandbox Mô phỏng Thời gian thực (Live Preview Simulation Sandbox)
- Không gian kiểm thử chuyên nghiệp cho phép gửi các hồ sơ bồi thường giả định và quan sát cách hệ thống đưa ra quyết định theo thời gian thực.
- Tự động hiển thị huy hiệu luồng duyệt (`Auto-Approve ⚡` hoặc `Tiered Approval`), liệt kê 4 mốc sự kiện vòng đời kèm kênh kích hoạt tương ứng (`email`, `sms`, `webhook`), và tính toán chính xác hạn chót xử lý bồi thường.
- **Thuật toán SLA Working-Day Iteration**: Tự động loại trừ các ngày nghỉ cuối tuần, chỉ đếm các ngày thuộc danh sách làm việc hoạt động (`Active Working Days`) đã đăng ký trong cấu hình SLA của từng Tenant.

---

## 📂 Hệ thống Tài liệu Đặc tả Kỹ thuật (Technical Documentation Architecture)

Hệ thống tài liệu được tổ chức chặt chẽ theo chuẩn kỹ sư phần mềm chuyên nghiệp:

- **[Kiểm soát Tiến độ & Nghiệm thu (CHECKLIST.md)](./CHECKLIST.md)**: Ma trận 7 giai đoạn phát triển và toàn bộ bộ Test Case kiểm định.
- **[Kiến trúc Tổng thể (Architecture)](./docs/architecture.md)**: Sơ đồ tương tác, Tech Stack và thiết kế hệ thống.
- **[Lược đồ Cơ sở dữ liệu (Database Schema)](./docs/database_schema.md)**: Chi tiết bảng `tenants` và bảng kiểm toán `tenant_configs`.

### 🖥️ Các Màn hình Quản trị (Admin Screens)
1. [Quản lý Danh sách (Tenant List UI)](./docs/screens/01_tenant_list.md): Lưới dữ liệu, thao tác xóa nhóm/so sánh với logic chọn đúng 2 dòng.
2. [Bộ Chỉnh sửa Tab Dọc (Tenant Editor UI)](./docs/screens/02_tenant_editor.md): Giao diện 6 module với validation nghiêm ngặt.
3. [Kiểm toán Khác biệt (Config Diff UI)](./docs/screens/03_config_diff.md): Ma trận so sánh cấu hình trực quan.
4. [Lịch sử & Phục hồi (Config History UI)](./docs/screens/04_config_history.md): Lưới lịch sử và xác nhận Rollback an toàn.
5. [Mô phỏng Đường ống (Preview Sandbox UI)](./docs/screens/05_preview_mode.md): Sandbox thực thi mô phỏng bồi thường.

### 🧩 6 Module Cấu hình Đa Khách hàng
1. [Branding](./docs/modules/branding.md): Màu sắc Primary/Secondary và định danh.
2. [Claim Types](./docs/modules/claim_types.md): 5 loại hình bồi thường và danh sách tài liệu bắt buộc/tùy chọn.
3. [Approval Rules](./docs/modules/approval_rules.md): Hạn mức tự động duyệt và vai trò phân cấp (`assessor`, `team_lead`, `director`).
4. [Notifications](./docs/modules/notifications.md): 4 móc sự kiện vòng đời và cổng gửi tin đa kênh.
5. [SLA & Deadlines](./docs/modules/sla.md): Đăng ký ngày làm việc và quy tắc leo thang.
6. [Custom Metadata](./docs/modules/custom_fields.md): Mở rộng lược đồ thuộc tính động.

---

## 🚀 Hướng dẫn Triển khai & Kiểm chứng (Quick Start & Demonstration)

### 1. Khởi chạy Môi trường Phát triển (Local Setup)
Yêu cầu hệ thống: Node.js v18+ và Docker.
```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy PostgreSQL database qua Docker Compose
docker-compose up -d

# Khởi tạo bảng và nạp dữ liệu mẫu (SafeGuard, HealthFirst, GovHealth)
node seed.js
```

### 2. 🎯 Chạy Kịch bản Kiểm chứng API Runtime Lõi (Demonstration Scenario)
Kiểm định tính chính xác của bộ máy bằng cách gửi **cùng một hồ sơ bồi thường** (Số tiền `$10,000`, loại `OUTPATIENT`, cung cấp đầy đủ Custom Metadata) vào các Tenant khác nhau:
```bash
node demo_runtime.js
```
**Kết quả minh chứng sự ưu việt của hệ thống:**
- 🛡️ **SafeGuard Insurance**: Hồ sơ tự động chuyển luồng `Auto-Approve ⚡` (vì `$10,000 <= $20,000` hạn mức tự động), yêu cầu giấy tờ `ID Card` và `Medical Bill`, tính hạn chót đúng 5 ngày làm việc.
- 🏥 **HealthFirst Retail**: Hồ sơ vượt hạn mức tự động `$5,000`, chuyển luồng phê duyệt cấp `Tiered Approval: assessor`, kích hoạt đồng thời thông báo Email và SMS Gateway.
- 🏛️ **GovHealth Committee**: Hồ sơ chuyển luồng duyệt cấp cao nhất `director`, yêu cầu xác thực các trường siêu dữ liệu đặc thù (`Department` và `Budget Code`), kích hoạt HTTP Webhook tích hợp hệ thống ERP chính phủ.

### 3. Khởi chạy Web Server Giao diện Quản trị (Admin UI Server)
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000/tenants`

---

## 🌐 Hướng dẫn Đưa lên Server Miễn phí (Free Tier Cloud Deployment)

Để nhà tuyển dụng hoặc khách hàng dễ dàng trải nghiệm trực tuyến, dự án được cấu trúc tối ưu để dễ dàng triển khai trên các nền tảng đám mây miễn phí:

### 1. Cơ sở dữ liệu (PostgreSQL Database)
Sử dụng các dịch vụ Postgres Serverless miễn phí như:
- **Neon Postgres** (https://neon.tech)
- **Supabase** (https://supabase.com)
*Lấy chuỗi kết nối URI và gán vào biến môi trường `DATABASE_URL`.*

### 2. Triển khai Ứng dụng Node.js (Web Application Hosting)
Triển khai mượt mà chỉ với 1 cú click (Connect GitHub repository) trên:
- **Render** (https://render.com) - Chọn *Web Service*, môi trường *Node*, lệnh chạy: `npm start`.
- **Railway** (https://railway.app) hoặc **Fly.io**.

### 3. Cấu hình Biến môi trường (`.env` trên Server)
```env
PORT=3000
DATABASE_URL=postgres://user:password@host.region.aws.neon.tech/dbname?sslmode=require
```

---
*Kiến trúc và Mã nguồn được phát triển với sự hỗ trợ của Antigravity AI Assistant.*
