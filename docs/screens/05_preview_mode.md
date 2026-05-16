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
2. Tải và hiển thị cấu trúc lược đồ tham số (Schema): Loại hình Claim (`Claim Treatment Type`) và các trường *Custom Metadata* cần thiết của SafeGuard (Ví dụ: `Employee ID`).

## 2. Nút Bấm Thực Thi & Kiểm Tra Bắt Buộc (Explicit Execution Button & Validation)

Để tránh cảm giác giật lag khi gõ và đảm bảo tính trọn vẹn của dữ liệu mô phỏng, hệ thống sử dụng cơ chế thực thi qua nút bấm rõ ràng **`🚀 Execute Verification Pipeline`**.

### Quy trình Kiểm tra và Cảnh báo (Validation Alerts)
Khi người dùng bấm nút thực thi, hệ thống sẽ kiểm tra nghiêm ngặt:
1. **Target Insurance Tenant**: Bắt buộc phải chọn một Tenant. Nếu thiếu, hiện thông báo cảnh báo SweetAlert2.
2. **Total Claim Amount**: Bắt buộc phải lớn hơn 0.
3. **Mandatory Custom Metadata**: Nếu Tenant có các trường dữ liệu tùy chỉnh đánh dấu bắt buộc (`* Required`), hệ thống sẽ kiểm tra. Nếu bỏ trống, xuất hiện popup báo lỗi rõ ràng yêu cầu điền đầy đủ dữ liệu trước khi chạy pipeline.

## 3. Luồng Kết quả Thực thi (Visual Execution Pipeline)
Sau khi toàn bộ dữ liệu đầu vào vượt qua kiểm tra hợp lệ, hệ thống truyền tải dữ liệu đến `RuntimeEngine` (`/api/preview/simulate`) và hiển thị kết quả trực quan ở bảng bên phải (Right Panel):
- **Chuẩn hóa Giao thức Truyền tải (JSON Serialization)**: Luồng thực thi sử dụng `fetch` với định dạng `application/json` để đảm bảo các đối tượng siêu dữ liệu lồng nhau (như `customFields`) được truyền chính xác tới Backend mà không bị lỗi ép kiểu sang `[object Object]`.
- **Bảng tên & Hạn mức (Execution Banner)**: Hiển thị tên Tenant, loại hình và số tiền đang chạy thử nghiệm.
- **Kiểm tra Ngưỡng Phê duyệt (Approval Matrix Routing)**: Tự động tính toán luồng duyệt là `Auto-Approve ⚡` hay cần qua các cấp `assessor`, `team_lead`, `director`.
- **Tính toán Hạn chót Xử lý (SLA Working-Day Iteration)**: Thuật toán mô phỏng sử dụng vòng lặp đếm ngày tuần tự, tự động bỏ qua các ngày nghỉ và chỉ tính chính xác các ngày thuộc danh sách làm việc hoạt động (`Active Working Days in Week`) theo cấu hình SLA của từng Tenant. Kèm theo lộ trình tự động leo thang (Escalations).
- **Kênh và Sự kiện Thông báo (Comprehensive Notification Hooks)**: Hiển thị toàn diện tất cả các sự kiện vòng đời (`claim_submitted`, `claim_approved`, `claim_rejected`, v.v.) cùng với các kênh kích hoạt tương ứng (Email, SMS, Webhook) và chi tiết mẫu thông báo.
- **Xác thực Lược đồ (Metadata Verification)**: Hiển thị trạng thái kiểm chứng hợp lệ của từng trường dữ liệu.
