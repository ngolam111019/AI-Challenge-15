# Màn hình 4: Lịch sử Cấu hình & Khôi phục (Config History & Rollback UI/UX)

Màn hình **Config History** cung cấp cái nhìn toàn cảnh về quá trình biến đổi cấu hình của một Tenant theo thời gian, hoạt động như một hệ thống quản lý phiên bản (Version Control System) với khả năng truy vết và khôi phục (Rollback) hoàn hảo theo chuẩn GitHub.

```text
+-----------------------------------------------------------------------------------------------+
|  [< Back to Tenants]   Configuration History: SafeGuard Insurance            [ Active: v3 ⭐ ] |
+-----------------------------------------------------------------------------------------------+
|  Version | Date             | Author     | Change Note                 | Actions              |
+----------+------------------+------------+-----------------------------+----------------------+
|  v3 (Cur)| 16 May, 15:30    | Admin Lam  | Rollback from version v1    | [👁️ Details] (Active) |
|  v2      | 15 May, 10:00    | System QA  | Adjusted auto-approve $20k  | [👁️ Details] [🔄 Roll] |
|  v1      | 14 May, 09:15    | Initial    | Initial setup for corporate | [👁️ Details] [🔄 Roll] |
+-----------------------------------------------------------------------------------------------+
```

## 1. Tải Dữ liệu & Bố cục Lưới (Data Grid)

Màn hình tải dữ liệu dựa trên tham số ID của Tenant được truyền vào (ví dụ: `/tenants/1/history`). Lưới dữ liệu sắp xếp theo thứ tự thời gian giảm dần (Mới nhất ở trên cùng):
- **Version Badge**: Số phiên bản. Phiên bản đang hoạt động sẽ có nhãn `(Current ⭐)` nổi bật với nền màu xanh lục.
- **Ngày thực hiện (Date)**: Ngày giờ chính xác lưu cấu hình.
- **Ghi chú (Change Note)**: Nội dung mô tả lý do thay đổi. Nếu là phiên bản tạo ra do khôi phục, hệ thống tự động ghi: `Rollback from version vX`.
- **Cột Hành động (Actions)**: Nút khôi phục (`🔄 Rollback`) (chỉ hiển thị cho các phiên bản cũ, phiên bản hiện tại hiển thị nhãn `Active`).

## 2. Cơ Chế Khôi Phục & Xác Nhận (Rollback & Confirmation)

Khi người dùng nhấn vào nút **`🔄 Rollback`** tại dòng của phiên bản cũ (ví dụ: `v1`):

### Bước 1: Hiển thị Xác nhận (Alert Confirm)
Hiển thị một Modal cảnh báo trang trọng (SweetAlert / HTMX Confirm):
> **⚠️ Xác nhận Khôi phục Phiên bản**
> Bạn đang thực hiện khôi phục cấu hình của **SafeGuard Insurance** về phiên bản **v1**. Hệ thống sẽ không ghi đè dữ liệu cũ mà tạo ra một phiên bản mới (**v4**) chứa nội dung của v1. Bạn có chắc chắn muốn tiếp tục?
> [ Hủy ]  [ Đồng ý Khôi phục ]

### Bước 2: Xử lý Kỹ thuật (Additive Rollback Logic)
Khi nhấn "Đồng ý", HTMX gọi API:
```text
POST /api/tenants/1/rollback
Body: { "targetVersionId": 1 }
```
Backend xử lý theo đúng quy chuẩn `configService.rollback()`:
1. Đọc dữ liệu từ `v1`.
2. Tạo bản ghi mới `v4` với ghi chú: `"Rollback from version v1"`.
3. Cập nhật `current_version_id` của Tenant trỏ tới `v4`.

### Bước 3: Phản hồi UI
Bảng lịch sử tự động chèn thêm dòng `v4 (Current)` lên trên cùng kèm thông báo thành công. Mọi thứ diễn ra tuyến tính và minh bạch tuyệt đối.
