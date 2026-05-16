# Kiến trúc Hệ thống (System Architecture)

Tài liệu này mô tả cấu trúc tổng thể và các nguyên tắc thiết kế của hệ thống Cấu hình Tenant.

## 1. Nguyên tắc Thiết kế (Design Principles)

- **Configuration-as-Data**: Toàn bộ quy tắc kinh doanh được lưu trữ dưới dạng dữ liệu (JSON) thay vì code cứng, cho phép thay đổi hành vi hệ thống mà không cần deploy lại.
- **Versioning (Immutable Configs)**: Mỗi lần thay đổi cấu hình sẽ tạo ra một phiên bản mới (Immutable). Điều này đảm bảo tính toàn vẹn dữ liệu cho các hồ sơ claim cũ và hỗ trợ tính năng Rollback.
- **Modular Services**: Mỗi nhóm tính năng (SLA, Approval...) được thiết kế như một module độc lập, giao tiếp thông qua một Schema chung.
- **Thin Client (HTMX)**: Sử dụng HTMX để giữ logic giao diện ở phía Server, giảm thiểu sự phức tạp của Javascript ở phía Frontend.

## 2. Công nghệ sử dụng (Tech Stack)

- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database**: PostgreSQL (v15+) - Tận dụng sức mạnh của kiểu dữ liệu `JSONB`.
- **Template Engine**: Nunjucks (Cú pháp tương tự Jinja2).
- **Styling**: Tailwind CSS.
- **Frontend Interaction**: HTMX (Ajax-style transitions).

## 3. Luồng dữ liệu (Data Flow)

### Quản lý Cấu hình (Admin Flow)
1. Admin thực hiện thay đổi trên giao diện.
2. Server validate dữ liệu dựa trên Module Schema.
3. `ConfigService` tạo một bản ghi mới trong `tenant_configs` với `version_number` mới.
4. Cập nhật `current_version_id` trong bảng `tenants`.

### Xử lý Claim (Runtime Flow)
1. Client gửi `tenantId` và `claimData` tới API `processClaim`.
2. `RuntimeService` truy vấn phiên bản cấu hình **hiện tại** của Tenant.
3. Hệ thống chạy qua các Module Logic (SLA Engine, Approval Engine...) để tính toán kết quả.
4. Trả về Metadata hướng dẫn xử lý hồ sơ.

## 4. Cấu trúc Thư mục
```text
/
├── app.js              # Điểm khởi đầu ứng dụng
├── db/                 # Kết nối và scripts khởi tạo DB
├── docs/               # Tài liệu hướng dẫn (Bạn đang ở đây)
├── public/             # Assets tĩnh (CSS, JS)
├── routes/             # Định nghĩa các endpoints (Web & API)
├── services/           # Logic nghiệp vụ (Config, Runtime)
└── views/              # Giao diện Nunjucks (Templates)
## 5. Danh sách Tenant Mẫu (Sample Tenants)

Hệ thống được khởi tạo với 3 cấu hình mẫu tiêu biểu:

1. **SafeGuard Insurance (Corporate)**:
   - Tập trung vào khách hàng doanh nghiệp.
   - Ngưỡng tự động duyệt cao (20,000).
   - Quy trình 3 cấp (Assessor -> Team Lead -> Director).
   - Yêu cầu `Employee ID`.

2. **HealthFirst (Retail)**:
   - Tập trung vào khách hàng cá nhân.
   - Đa dạng loại hình (Maternity, Optical...).
   - Thông báo qua Email & SMS.

3. **GovHealth (Government)**:
   - Quy trình chặt chẽ, 100% duyệt thủ công bởi `Committee`.
   - SLA dài (15 ngày).
   - Yêu cầu nhiều thông tin quản lý (`Department`, `Budget Code`).
