# Kế hoạch Thực thi & Nghiệm thu: Hệ thống Quản trị Tenant (Admin UI Roadmap & Checklist)

Kế hoạch này quy định lộ trình phát triển chi tiết cho 5 màn hình quản trị của nền tảng Multi-tenant. Mục tiêu là phát triển theo từng phân đoạn độc lập (Modular Milestone): khi hoàn thành một màn hình và vượt qua toàn bộ Test Case, màn hình đó sẽ đạt trạng thái hoàn chỉnh tuyệt đối (Production-ready) theo đúng các tài liệu đặc tả UI/UX.

---

## 🧭 Tổng quan Lộ trình (Milestones)

```text
[ Phase 1: Khung Giao diện & Layout ] ──> [ Phase 2: Màn hình 1 - Danh sách Tenant ]
                                                     │
[ Phase 4: Màn hình 3 - So sánh Diff ] <── [ Phase 3: Màn hình 2 - Thêm mới & Sửa ]
        │
        ▼
[ Phase 5: Màn hình 4 - Lịch sử & Rollback ] ──> [ Phase 6: Màn hình 5 - Sandbox Mô phỏng ]
```

---

## 🛠️ Phase 1: Thiết lập Khung Giao diện & Tiện ích Toàn cục (Global Framework)
**Mục tiêu**: Chuẩn bị hạ tầng UI chung (Layout, Navigation, AlpineJS, Modal Container, Toast Notifications).

- [x] **Hạng mục 1.1**: Cập nhật `views/layout.njk` tích hợp Alpine.js qua CDN (hỗ trợ quản lý trạng thái client-side nhẹ nhàng).
- [x] **Hạng mục 1.2**: Xây dựng component `Toast Notification` (Thông báo nổi góc màn hình khi thao tác thành công hoặc thất bại).
- [x] **Hạng mục 1.3**: Xây dựng container rỗng dành cho Modal (`#modal-container`) hỗ trợ tải các hộp thoại xác nhận qua HTMX.

---

## 📊 Phase 2: Màn hình 1 - Danh sách Tenant (Tenant List)
**Tài liệu tham chiếu**: [01_tenant_list.md](./docs/screens/01_tenant_list.md)

### Hạng mục Phát triển
- [x] **Backend API**:
  - `GET /tenants`: Trang danh sách chính.
  - `DELETE /api/tenants/:id`: Xóa đơn lẻ.
  - `DELETE /api/tenants/batch`: Xóa nhiều dòng (nhận mảng ID).
- [x] **Frontend Template (`views/tenants/list.njk`)**:
  - Render bảng danh sách với checkbox ở mỗi dòng và checkbox Master trên Header.
  - Tích hợp Alpine.js để theo dõi số lượng checkbox được chọn:
    - Bật nút `Delete Selected` khi số lượng > 0.
    - Bật nút `Compare Selected` khi số lượng >= 1 (Ưu tiên đúng 2 dòng).
- [x] **HTMX Interactions**:
  - Gắn `hx-delete` vào nút xóa đơn lẻ và nút xóa nhóm kèm SweetAlert/Confirm.

### Bộ Test Case Nghiệm thu (Acceptance Test Cases)
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi (Expected) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC1.1** | Trạng thái mặc định các nút | Truy cập `/tenants` khi chưa tích checkbox nào. | Nút *Delete Selected* và *Compare* bị mờ (disabled). | ✅ |
| **TC1.2** | Kích hoạt nút Delete Batch | Tích chọn 2 dòng trên bảng. | Nút *Delete Selected* sáng lên. | ✅ |
| **TC1.3** | Hủy xóa nhóm | Bấm *Delete Selected* -> Bấm *Hủy* trên popup confirm. | Bảng giữ nguyên, không có dữ liệu nào bị xóa. | ✅ |
| **TC1.4** | Xóa nhóm thành công | Bấm *Delete Selected* -> Bấm *Đồng ý*. | 2 dòng biến mất với hiệu ứng mượt, hiện thông báo thành công. | ✅ |
| **TC1.5** | Điều hướng nút Compare | Tích chọn 2 dòng (ID 1 và 2) -> Bấm *Compare Selected*. | Chuyển hướng sang `/tenants/diff?id1=1&id2=2`. | ✅ |
| **TC1.6** | Điều hướng nút Preview | Bấm nút *Preview* tại dòng của SafeGuard (ID 1). | Chuyển hướng sang `/tenants/preview?tenantId=1`. | ✅ |

---

## 📝 Phase 3: Màn hình 2 - Thêm mới & Sửa Tenant (Tenant Editor)
**Tài liệu tham chiếu**: [02_tenant_editor.md](./docs/screens/02_tenant_editor.md), [ui_ux_design_spec.md](./docs/ui_ux_design_spec.md)

### Hạng mục Phát triển
- [x] **Backend API**:
  - `GET /tenants/new`: Mở form ở chế độ Tạo mới.
  - `GET /tenants/:id/edit`: Mở form ở chế độ Chỉnh sửa (Tải dữ liệu từ `current_version_id`).
  - `POST /api/tenants`: Xử lý lưu mới Tenant & Config khởi tạo.
  - `PUT /api/tenants/:id`: Xử lý cập nhật (Tạo bản ghi version mới trong `tenant_configs`).
- [x] **Frontend Template (`views/tenants/edit.njk`)**:
  - Xây dựng bố cục Tab dọc bên trái (vòng lặp từ `moduleRegistry.js`).
  - Xây dựng 6 file template con cho 6 module trong thư mục `views/modules/`.
  - Logic phân biệt Mode: Nếu là Edit mode, hiển thị bắt buộc ô nhập *Change Note* và khóa ô *Slug*.
- [x] **HTMX & Alpine Interactions**:
  - Quản lý chuyển tab mượt mà không tải lại trang.
  - Tính năng tự động tạo Slug từ Name khi ở chế độ Create New.
  - Tính năng thêm/xóa dòng động cho Approval Tiers và Custom Fields.

### Bộ Test Case Nghiệm thu
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC2.1** | Tự động sinh Slug | Vào `/tenants/new`, gõ "Bao Hiem AAA" vào ô Tenant Name. | Ô Slug tự động điền `bao-hiem-aaa`. | ✅ |
| **TC2.2** | Khóa Slug khi Chỉnh sửa | Vào `/tenants/1/edit`. | Ô Slug bị mờ/khóa, không thể gõ đổi giá trị. | ✅ |
| **TC2.3** | Bắt buộc Change Note | Ở chế độ Sửa, để trống ô Change Note và bấm Save. | Hệ thống báo lỗi "Vui lòng nhập lý do thay đổi". | ✅ |
| **TC2.4** | Validation dữ liệu | Nhập SLA = -5 và bấm Save. | Ô SLA bôi đỏ báo lỗi "SLA phải lớn hơn 0". | ✅ |
| **TC2.5** | Lưu Version mới thành công | Nhập đầy đủ thông tin hợp lệ, ghi chú "Cập nhật SLA" -> Bấm Save. | Trả về thông báo thành công, version trên tiêu đề tăng từ v1 lên v2. | ✅ |

---

## ⚖️ Phase 4: Màn hình 3 - So sánh Cấu hình (Config Diff)
**Tài liệu tham chiếu**: [03_config_diff.md](./docs/screens/03_config_diff.md)

### Hạng mục Phát triển
- [ ] **Backend API**:
  - `GET /tenants/diff`: Trang giao diện so sánh.
  - `GET /api/tenants/diff-data?id1=X&id2=Y`: API trả về bảng HTML so sánh chi tiết.
- [ ] **Frontend Template (`views/tenants/diff.njk`)**:
  - 2 Dropdown chọn Tenant có tìm kiếm.
  - Bảng 3 cột: Tên tham số, Cột Tenant A, Cột Tenant B.
  - Logic xử lý Nunjucks: Đối chiếu từng key, nếu `valA !== valB`, gán class highlight nền vàng và thêm icon `[≠]`.
- [ ] **HTMX Interactions**:
  - Tự động tải bảng dữ liệu khi URL có tham số `id1` và `id2`.
  - Nút `Swap 🔄` đảo vị trí cột A và B.
  - Nút toggle `Show Differences Only` (Dùng Alpine ẩn các hàng không có class highlight).

### Bộ Test Case Nghiệm thu
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC3.1** | Tự động tải từ tham số | Truy cập `/tenants/diff?id1=1&id2=2`. | Dropdown A chọn SafeGuard, B chọn HealthFirst, bảng so sánh hiển thị ngay. | ⏳ |
| **TC3.2** | Highlight khác biệt | Quan sát dòng "Auto-Approval Threshold" giữa SafeGuard ($20k) và HealthFirst ($5k). | Dòng này có nền màu vàng nổi bật kèm biểu tượng `[≠]`. | ⏳ |
| **TC3.3** | Đảo vị trí cột | Bấm nút *Swap 🔄*. | Dữ liệu cột A và B đổi chỗ cho nhau ngay lập tức. | ⏳ |
| **TC3.4** | Bộ lọc Khác biệt | Bấm bật công tắc "Show Differences Only". | Các dòng giống nhau biến mất, bảng chỉ còn lại các dòng có sai lệch. | ⏳ |

---

## 🕒 Phase 5: Màn hình 4 - Lịch sử Cấu hình & Rollback (Config History)
**Tài liệu tham chiếu**: [04_config_history.md](./docs/screens/04_config_history.md)

### Hạng mục Phát triển
- [ ] **Backend API**:
  - `GET /tenants/:id/history`: Tải danh sách lịch sử của Tenant.
  - `GET /api/tenants/:id/versions/:versionId`: Trả về chi tiết JSON/HTML của một version cụ thể để hiển thị Modal.
  - `POST /api/tenants/:id/rollback`: Thực hiện Rollback về một version cụ thể.
- [ ] **Frontend Template (`views/tenants/history.njk`)**:
  - Bảng lịch sử các phiên bản sắp xếp mới nhất ở trên. Dòng Active có nhãn `Current ⭐`.
  - Ngăn kéo bên phải (Drawer Modal) hiển thị chi tiết cấu hình khi bấm nút *Details*.
- [ ] **HTMX Interactions**:
  - Nút *Rollback* hiển thị thông báo xác nhận trang trọng. Khi đồng ý, gọi API rollback và chèn version mới lên đầu bảng.

### Bộ Test Case Nghiệm thu
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC4.1** | Hiển thị dòng Active | Vào trang lịch sử của SafeGuard. | Phiên bản mới nhất có nhãn `Current ⭐` màu xanh lục. | ⏳ |
| **TC4.2** | Xem chi tiết version | Bấm nút *Details* tại dòng của phiên bản v1. | Ngăn kéo mở ra hiển thị đúng thông số cấu hình tại thời điểm tạo v1. | ⏳ |
| **TC4.3** | Hủy Rollback | Bấm *Rollback* tại dòng v1 -> Bấm *Hủy* trên thông báo xác nhận. | Bảng giữ nguyên, không có hành động nào xảy ra. | ⏳ |
| **TC4.4** | Rollback thành công | Bấm *Rollback* tại dòng v1 -> Bấm *Đồng ý*. | Bảng xuất hiện dòng mới trên cùng (v4) với ghi chú "Rollback from v1". v4 trở thành Active. | ⏳ |

---

## 👁️ Phase 6: Màn hình 5 - Sandbox Mô phỏng (Preview Mode)
**Tài liệu tham chiếu**: [05_preview_mode.md](./docs/screens/05_preview_mode.md), [preview_mode_spec.md](./docs/preview_mode_spec.md)

### Hạng mục Phát triển
- [ ] **Backend API**:
  - `GET /tenants/preview`: Trang mô phỏng.
  - `GET /api/tenants/:id/custom-fields`: Trả về danh sách form input Custom Fields động của Tenant.
  - `POST /api/preview/simulate`: Nhận `tenantId` và `claimData`, gọi `RuntimeService.processClaim()` và trả về HTML kết quả.
- [ ] **Frontend Template (`views/tenants/preview.njk`)**:
  - Bố cục Split-screen: Bên trái là Form nhập liệu, bên phải là Đường ống trực quan (Branding, Docs, Approval Badge, Notification List, SLA Tracker).
- [ ] **HTMX Interactions**:
  - Tự động chọn sẵn Tenant nếu URL có tham số `tenantId`.
  - Gắn `hx-post` với `hx-trigger="input changed delay:300ms"` vào các ô nhập liệu bên trái để cập nhật bên phải theo thời gian thực.

### Bộ Test Case Nghiệm thu
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC5.1** | Tự động tải từ tham số | Truy cập `/tenants/preview?tenantId=1` (SafeGuard). | Dropdown chọn SafeGuard, xuất hiện ô nhập *Employee ID* ở cột bên trái. | ⏳ |
| **TC5.2** | Tương tác Auto-Approve | Nhập số tiền $15,000 (Nhỏ hơn 20k của SafeGuard). | Cột bên phải lập tức hiện huy hiệu `Auto-Approve ⚡`. | ⏳ |
| **TC5.3** | Tương tác Tiered Approval | Kéo thanh trượt số tiền lên $50,000. | Cột bên phải chuyển mượt sang huy hiệu `Tiered Approval: assessor`. | ⏳ |
| **TC5.4** | Lỗi Custom Field | Xóa trống ô *Employee ID* và gõ các thông số khác. | Ô *Employee ID* bôi đỏ, bên phải báo lỗi "Employee ID is required". | ⏳ |
| **TC5.5** | Đổi Tenant động | Chuyển dropdown sang GovHealth. | Cột bên phải đổi màu sang Đỏ (#dc2626), bên trái đổi form hiện *Department* và *Budget Code*. | ⏳ |

---

## ⚙️ Phase 7: Kiểm định API Runtime Engine (Runtime Processing Verification)
**Mục tiêu**: Đảm bảo API lõi xử lý bồi thường hoạt động chính xác tuyệt đối dựa trên cấu hình đa dạng của các Tenant và phục vụ cho màn hình Preview cũng như các dịch vụ Core Insurance.

### Hạng mục Phát triển & Kiểm định
- [ ] **Hàm & API Lõi (`processClaim(tenantId, claimData)`)**:
  - Đảm bảo trả về chuẩn định dạng bao gồm 5 thông số:
    1. `requiredDocuments`: Danh sách giấy tờ bắt buộc theo `claimType`.
    2. `approvalRouting`: Cấp độ duyệt và vai trò tương ứng (Ví dụ: `assessor`, `director` hoặc `auto-approve`).
    3. `notifications`: Danh sách thông báo cần gửi (Sự kiện, kênh gửi `email/sms/webhook`, và mã template).
    4. `slaDeadline`: Ngày hạn chót tính theo công thức `Submit Date + SLA target working days`.
    5. `requiredCustomFields`: Danh sách các trường Custom Fields bắt buộc nhập và kết quả kiểm tra validation.

### Kịch bản Chứng minh (Demonstration Scenario)
Gửi cùng một hồ sơ bồi thường (Ví dụ: `Loại OUTPATIENT`, `Số tiền $10,000`, `Ngày nộp 2026-05-16`, điền đủ Custom Fields) vào 3 Tenant mẫu:

```text
[ HỒ SƠ CLAIM: $10,000 | OUTPATIENT ] ──┬──> Tenant A (SafeGuard) ──> Result A (Auto-Approve ⚡)
                                        ├──> Tenant B (HealthFirst) ──> Result B (Assessor 👥)
                                        └──> Tenant C (GovHealth)   ──> Result C (Committee 🏛️)
```

### Bộ Test Case Nghiệm thu
| Mã TC | Tên Test Case | Các bước thực hiện | Kết quả mong đợi (Expected) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC7.1** | SafeGuard Processing | Gửi Claim $10k, loại OUTPATIENT tới SafeGuard (ID 1). | `requiredDocs`: ['ID', 'Bill'], `routing`: Auto-approve (vì 10k < 20k), `notif`: Email only, `sla`: May 21 (5 days). | ⏳ |
| **TC7.2** | HealthFirst Processing | Gửi Claim $10k, loại OUTPATIENT tới HealthFirst (ID 2). | `requiredDocs`: ['ID'], `routing`: Assessor (vì 10k > 5k auto threshold), `notif`: Email + SMS, `sla`: May 23 (7 days). | ⏳ |
| **TC7.3** | GovHealth Processing | Gửi Claim $10k, loại OUTPATIENT tới GovHealth (ID 3). | `requiredDocs`: ['Gov ID', 'Standard Bill'], `routing`: Committee (0 auto threshold), `notif`: Email + Webhook, `sla`: May 31 (15 days). | ⏳ |
| **TC7.4** | SafeGuard Custom Field Error | Gửi tới SafeGuard nhưng thiếu tham số `employee_id`. | Trả về HTTP 400 hoặc Validation Error: `Employee ID is required`. | ⏳ |
| **TC7.5** | GovHealth Custom Field Error | Gửi tới GovHealth nhưng thiếu tham số `dept` và `budget_code`. | Trả về HTTP 400 hoặc Validation Error: `Department and Budget Code are required`. | ⏳ |

---
*Kế hoạch được giám sát và thực thi bởi Antigravity AI Assistant.*
