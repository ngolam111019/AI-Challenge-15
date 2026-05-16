# Insurance Multi-tenant Configuration Platform

Hệ thống quản lý cấu hình đa khách hàng (Tenant) dành cho ngành bảo hiểm, cho phép tùy biến quy trình nghiệp vụ linh hoạt thông qua giao diện Admin mà không cần can thiệp vào mã nguồn.

## 📚 Tài liệu Hướng dẫn & Tiêu chuẩn

Để đảm bảo tính nhất quán trong phát triển và bảo trì, vui lòng tham khảo các tài liệu tiêu chuẩn sau:

- **[Checklist Quản lý Tiến độ (CHECKLIST.md)](./CHECKLIST.md)**: Danh sách kiểm việc, phân chia lộ trình (7 Phases) và bộ Test Case nghiệm thu sản phẩm.

### 🏗️ Kiến trúc & Hạ tầng
- [Kiến trúc Tổng thể (Architecture)](./docs/architecture.md): Nguyên tắc thiết kế, Tech Stack và luồng dữ liệu.
- [Cấu trúc Database](./docs/database_schema.md): Chi tiết về Versioning và lưu trữ JSONB.
- [Tiêu chuẩn UI/UX & Giao diện](./docs/ui_ux_design_spec.md): Kiến trúc Tab dọc, Schema-driven UI và quy chuẩn thiết kế.
- [Tiêu chuẩn UI/UX Màn hình Preview](./docs/preview_mode_spec.md): Bố cục Sandbox, tương tác thời gian thực và trực quan hóa luồng xử lý.

### 🖥️ Chi tiết Giao diện Quản trị (Admin UI Screens)
1. [Danh sách Tenant (Tenant List)](./docs/screens/01_tenant_list.md): Bảng quản lý, lọc dữ liệu, hành động đơn/nhóm và điều hướng.
2. [Thêm mới/Sửa Tenant (Tenant Editor)](./docs/screens/02_tenant_editor.md): Kiến trúc Tab dọc 6 module, quản lý 2 trạng thái Create & Edit.
3. [So sánh Cấu hình (Config Diff)](./docs/screens/03_config_diff.md): So sánh song song 2 tenant, highlight khác biệt tự động.
4. [Lịch sử & Khôi phục (Config History)](./docs/screens/04_config_history.md): Lưới lịch sử GitHub-style, modal chi tiết và xác nhận Rollback.
5. [Chế độ Mô phỏng (Preview Mode)](./docs/screens/05_preview_mode.md): Sandbox mô phỏng xử lý claim thời gian thực.

### 🧩 Chi tiết các Module Cấu hình
1. [Branding](./docs/modules/branding.md): Nhận diện thương hiệu (Màu sắc, Logo).
2. [Claim Types & Documents](./docs/modules/claim_types.md): Danh mục bảo hiểm và giấy tờ đi kèm.
3. [Approval Rules](./docs/modules/approval_rules.md): Quy tắc phê duyệt tự động và phân cấp.
4. [Notifications](./docs/modules/notifications.md): Quản lý sự kiện và kênh thông báo.
5. [SLA & Escalation](./docs/modules/sla.md): Thời gian cam kết và quy trình leo thang.
6. [Custom Fields](./docs/modules/custom_fields.md): Các trường dữ liệu mở rộng.

## 🚀 Hướng dẫn Chạy Thử (Quick Start)

### 1. Cài đặt môi trường
```bash
npm install
docker-compose up -d
```

### 2. Khởi tạo dữ liệu mẫu
```bash
node seed.js
```

### 3. Chạy Demo Runtime
Kiểm tra cách hệ thống xử lý cùng một bộ hồ sơ qua các Tenant khác nhau:
```bash
node demo_runtime.js
```

### 4. Chạy Web Server
```bash
npm run dev
```

---
*Phát triển bởi Antigravity AI Assistant.*
