# Màn hình 5: Chế độ Mô phỏng (Preview Mode UI/UX)

Màn hình **Preview Mode** là không gian mô phỏng (Sandbox) thời gian thực, cho phép kiểm nghiệm trước cách hệ thống xử lý một hồ sơ claim dựa trên cấu hình của Tenant đã chọn. Màn hình này tuân thủ các quy tắc kiến trúc và giao diện quy định tại `preview_mode_spec.md`.

```text
+-------------------------------------------------------------------------------------------------+
|  [ Tenant Simulator ]  Select Tenant: [ SafeGuard Insurance (v3) | v ]    [ Reset Simulation ]  |
+----------------------------------------+--------------------------------------------------------+
|  SIMULATION INPUT PARAMETERS           |  EXECUTION ENGINE PIPELINE RESULTS                     |
|                                        |                                                        |
|  Claim Type:   [ OUTPATIENT     | v ]  |  [ BRANDING ] SafeGuard Insurance (Color: #1e40af)     |
|  Claim Amount: [ $ 15,000           ]  |  ----------------------------------------------------  |
|  Submit Date:  [ 2026-05-16         ]  |  📄 Required Documents:                                |
|                                        |     [ ID Card (Req) ]  [ Bill Receipt (Req) ]          |
|  Dynamic Custom Fields:                |                                                        |
|  Employee ID*: [ EMP-10293          ]  |  ⚡ Approval Routing:                                  |
|                                        |     [ Auto-Approve ⚡ ] (Amount <= $20k threshold)     |
|                                        |                                                        |
|  [ RUN SIMULATION (Auto-triggers) ]    |  🔔 Notifications Fired:                               |
|                                        |     - [Email] Event: claim_submitted (corporate_tpl)   |
|                                        |                                                        |
|                                        |  ⏱️ SLA Deadline:                                      |
|                                        |     [ May 21, 2026 ] (Target: 5 working days)          |
+----------------------------------------+--------------------------------------------------------+
```

## 1. Cơ chế Tự động Tải Tenant (Auto-load via Navigation)

### Tải từ tham số truyền vào
Khi người dùng đang ở trang *Danh sách Tenant* và nhấn vào nút **`👁️ Preview`** trên dòng của **SafeGuard Insurance** (ID: 1), hệ thống chuyển hướng sang trang mô phỏng với tham số URL:
```text
/tenants/preview?tenantId=1
```

Khi phát hiện tham số `tenantId=1`, HTMX lập tức tự động:
1. Đặt giá trị mặc định của Dropdown chọn Tenant thành SafeGuard Insurance.
2. Tải và hiển thị ngay lập tức các trường *Custom Field* cần thiết của SafeGuard (Ví dụ: `Employee ID`).
3. Kích hoạt chạy thử một kịch bản claim mẫu và hiển thị kết quả ở bên phải.

## 2. Kết nối Chặt chẽ với Luồng Logic (Logic Connectivity)

Phần kết quả hiển thị bên phải (Right Panel) phản ánh 100% logic đã được lập trình trong `RuntimeService.processClaim()`:

- **Kiểm tra Ngưỡng Phê duyệt (Approval Logic)**:
  - Thử nghiệm gõ số tiền `$15,000` -> Kết quả lập tức hiện `Auto-Approve ⚡` (Vì nhỏ hơn auto-approve 20,000 của SafeGuard).
  - Thử nghiệm kéo thanh trượt lên `$50,000` -> Kết quả lập tức chuyển sang `Tiered Approval: assessor`.
- **Phản ứng Custom Fields**:
  - Nếu người dùng để trống ô *Employee ID* và gõ các thông số khác, hệ thống ngay lập tức bôi đỏ ô input và hiển thị lỗi ở phần kết quả: `❌ Validation Error: Employee ID is required`.
- **Tính toán SLA**:
  - Dựa vào ngày nộp hồ sơ (Submit Date) và cấu hình SLA của từng loại claim, ngày hạn chót được tự động cộng thêm và hiển thị nổi bật.
