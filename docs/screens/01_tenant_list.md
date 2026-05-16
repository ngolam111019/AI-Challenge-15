# Màn hình 1: Danh sách Tenant (Tenant List UI/UX)

Màn hình Danh sách Tenant là trung tâm điều khiển (Control Center) cho toàn bộ hệ thống Multi-tenant, cho phép quản lý vòng đời và điều hướng nhanh tới các chức năng nâng cao.

```text
+-----------------------------------------------------------------------------------------------+
|  Tenants Management                      [ + New Tenant ] [ 🗑️ Delete Selected ] [ ⚖️ Compare ] |
+-----------------------------------------------------------------------------------------------+
|  [x] | STT | Slug        | Name                | Created Date | Actions                       |
+------+-----+-------------+---------------------+--------------+-------------------------------+
|  [x] |  1  | safeguard   | SafeGuard Insurance | 2026-05-15   | [✏️ Edit] [👁️ Preview] [🕒 Hist] |
|  [x] |  2  | healthfirst | HealthFirst Retail  | 2026-05-15   | [✏️ Edit] [👁️ Preview] [🕒 Hist] |
|  [ ] |  3  | govhealth   | GovHealth Committee | 2026-05-16   | [✏️ Edit] [👁️ Preview] [🕒 Hist] |
+-----------------------------------------------------------------------------------------------+
```

## 1. Thanh Công cụ Hành động (Action Bar)
Nằm ở phía trên cùng bên phải, bao gồm các nút:
- **`+ New Tenant`**: Chuyển hướng người dùng sang trang `/tenants/new`.
- **`🗑️ Delete Selected`**:
  - Trạng thái mặc định: Bị vô hiệu hóa (`disabled: true`).
  - Trạng thái kích hoạt: Khi có ít nhất 1 checkbox trên lưới được tích chọn.
  - Tương tác: Nhấn vào sẽ hiển thị Modal / SweetAlert yêu cầu xác nhận. Khi đồng ý, HTMX thực hiện gọi API `DELETE /api/tenants/batch` và làm mới bảng dữ liệu tức thì với hiệu ứng fade-out.
- **`⚖️ Compare Selected`**:
  - Trạng thái mặc định: Bị vô hiệu hóa.
  - Trạng thái kích hoạt: Khi có **chính xác 2 checkbox** hoặc **ít nhất 1 checkbox** được chọn.
  - Tương tác: Khi nhấn vào, hệ thống trích xuất các ID đã chọn và chuyển hướng tới màn hình so sánh với query params: `/tenants/diff?id1=1&id2=2`.

## 2. Lưới Dữ liệu (Data Grid)
Bảng hiển thị theo phong cách hiện đại (Clean Table) với các cột:
- **Checkbox Header**: Tích vào để chọn tất cả (Select All) hoặc bỏ chọn tất cả.
- **STT**: Số thứ tự dòng.
- **Slug**: Mã định danh duy nhất (ví dụ: `safeguard`), được tạo hiệu ứng font mono nhỏ gọn.
- **Name**: Tên hiển thị công ty, in đậm làm nổi bật.
- **Ngày tạo (Created Date)**: Format theo chuẩn định dạng dễ nhìn (ví dụ: `15 May 2026, 14:30`).
- **Cột Actions (Hành động dòng)**:
  - **`✏️ Sửa (Edit)`**: Link sang `/tenants/1/edit`. Truyền ID để mở form ở chế độ chỉnh sửa.
  - **`👁️ Mô phỏng (Preview)`**: Link sang `/tenants/preview?tenantId=1`. Hệ thống tự động chọn sẵn Tenant này trên form mô phỏng.
  - **`🕒 Lịch sử (Config History)`**: Link sang `/tenants/1/history`. Mở màn hình danh sách các phiên bản cấu hình cũ.
  - **`🗑️ Xóa (Delete)`**: Nút xóa đơn lẻ. Hiện thông báo cảnh báo và xóa bằng HTMX (`hx-delete`).

## 3. Tối ưu UX & Hiệu ứng (Micro-interactions)
- **Hover Row**: Khi di chuột qua mỗi dòng, dòng đó sáng lên nhẹ (bg-slate-50).
- **Sticky Header**: Tiêu đề bảng được ghim dính khi cuộn trang danh sách dài.
- **Zero JS Framework**: Toàn bộ logic lọc, tích checkbox kích hoạt nút được xử lý bằng Alpine.js siêu nhẹ hoặc Vanilla JS gắn kèm HTMX.
