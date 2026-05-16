# Màn hình 2: Thêm mới & Chỉnh sửa Tenant (Tenant Editor UI/UX)

Màn hình này chịu trách nhiệm cho cả 2 nghiệp vụ: Tạo mới một Tenant và Chỉnh sửa cấu hình của một Tenant đã tồn tại, tuân thủ chặt chẽ theo kiến trúc Tab dọc mô tả tại `ui_ux_design_spec.md`.

## 1. Hai Trạng thái Giao diện (2 Modes)

Hệ thống phân biệt trạng thái dựa trên URL và tham số ID truyền vào:

```text
[ Mode: CREATE NEW ] -> URL: /tenants/new
[ Mode: EDIT ]       -> URL: /tenants/1/edit (ID: 1)
```

### Trạng thái Tạo Mới (Create Mode)
- Tiêu đề trang: **`Create New Tenant`**.
- Input `Slug`: Bật khả năng nhập liệu (Enabled). Khi gõ Tên công ty (`Name`), hệ thống tự động sinh mã Slug tương ứng (ví dụ: gõ "SafeGuard Insure" -> slug: `safeguard-insure`).
- Các giá trị cấu hình mặc định: Khởi tạo các giá trị an toàn (SLA: 5 ngày, Threshold: 0, bật sẵn 1 Claim Type).
- Nút lưu: **`Create Tenant & Initialize Config`**.

### Trạng thái Chỉnh Sửa (Edit Mode)
- Tiêu đề trang: **`Configure Tenant: SafeGuard Insurance (v3)`**.
- Input `Slug`: Bị khóa (`readonly` hoặc `disabled`), vì Slug là định danh duy nhất dùng trong các giao dịch API, không được phép thay đổi để tránh đứt gãy hệ thống.
- Tải dữ liệu: Dữ liệu từ phiên bản cấu hình đang hoạt động (`current_version_id`) tự động điền vào tất cả các form của 6 module.
- Nút lưu: **`Save Version v4`** (Hiển thị trực quan việc lưu sẽ tạo ra một phiên bản mới theo chuẩn GitHub-style).

## 2. Bố cục Giao diện Tab Dọc (Vertical Tab Architecture)

```text
+------------------------------------------------------------------------------------+
|  [< Back to List]   Configure: SafeGuard Insurance             [ Save Version v4 ] |
+------------------------+-----------------------------------------------------------+
|  MODULE NAVIGATION     |  GENERAL INFORMATION FORM                                 |
|                        |                                                           |
|  * General Info    [✓] |  Tenant Name*: [ SafeGuard Insurance                 ]    |
|  > Branding        [✓] |  Slug Unique:  [ safeguard                           ] 🔒 |
|  > Claim Types     [✓] |                                                           |
|  > Approval Rules  [✓] |  Change Note*: [ Updated auto-approval threshold to $20k] |
|  > Notifications   [✓] |                                                           |
|  > SLA & Escalation[✓] |  [ Next: Branding & Identity -> ]                         |
|  > Custom Fields   [✓] |                                                           |
+------------------------+-----------------------------------------------------------+
```

## 3. Luồng Lưu Dữ liệu (Save & Commit Flow)
1. **Change Note (Ghi chú thay đổi)**: Màn hình chỉnh sửa luôn có một ô nhập *Change Note* (Bắt buộc hoặc khuyến nghị). Người dùng ghi lại lý do sửa (ví dụ: *"Điều chỉnh SLA cho Inpatient theo hợp đồng mới"*).
2. **Commit via HTMX**:
   - Khi bấm Save, toàn bộ dữ liệu từ các form module được tổng hợp thành một object JSON duy nhất.
   - Gọi API `PUT /api/tenants/1`.
   - Backend `configService.createNewVersion()` tạo bản ghi mới trong `tenant_configs` và cập nhật con trỏ `current_version_id`.
3. **Phản hồi Thành công**: Hiển thị Toast thông báo màu xanh và cập nhật số phiên bản trên tiêu đề mà không cần tải lại toàn trang.
