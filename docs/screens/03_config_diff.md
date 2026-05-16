# Màn hình 3: So sánh Cấu hình (Config Diff UI/UX)

Màn hình **Config Diff** là công cụ kiểm toán trực quan (Visual Audit), cho phép so sánh song song (Side-by-side) giữa 2 Tenant hoặc 2 phiên bản cấu hình khác nhau, giúp phát hiện nhanh các sai lệch trong quy tắc bồi thường.

```text
+-------------------------------------------------------------------------------------------------+
|  Configuration Comparison                                                        [ Swap 🔄 ]    |
+-------------------------------------------------------------------------------------------------+
|  Select Tenant A: [ SafeGuard Insurance (v3) | v ]    Select Tenant B: [ HealthFirst Retail | v ]|
+-------------------------------------------------------------------------------------------------+
|  CONFIGURATION MODULE     |  TENANT A (SafeGuard)              |  TENANT B (HealthFirst)        |
+---------------------------+------------------------------------+--------------------------------+
|  Branding                 |  Primary: #1e40af (Blue)           |  Primary: #16a34a (Green) [≠]  |
|  Claim Types Supported    |  OUTPATIENT, INPATIENT, DENTAL     |  OUT, IN, DENTAL, MATERNITY[≠] |
|  Auto-Approval Threshold  |  $ 20,000                          |  $ 5,000                   [≠] |
|  Approval Tiers           |  3 Tiers (Assessor, Lead, Dir)     |  2 Tiers (Assessor, Mgr)   [≠] |
|  Notification Channels    |  Email Only                        |  Email + SMS               [≠] |
|  Outpatient SLA Target    |  5 working days                    |  7 working days            [≠] |
|  Required Custom Fields   |  Employee ID                       |  (None)                    [≠] |
+-------------------------------------------------------------------------------------------------+
```

## 1. Cơ chế Chọn và Tự động Tải (Selection & Auto-load)

### Chọn thủ công qua Dropdown
- Giao diện cung cấp 2 ô chọn Dropdown (Có hỗ trợ gõ tìm kiếm - Searchable Select) để chọn Tenant A và Tenant B.
- Nút **`Compare 🚀`** kích hoạt việc tải dữ liệu so sánh.
- Nút **`Swap 🔄`**: Đảo vị trí 2 Tenant A và B cho nhau trên bảng so sánh.

### Tự động tải từ tham số (Auto-load via Query Params)
Khi người dùng bấm nút "So sánh" từ màn hình *Danh sách Tenant* (đã tích chọn 2 dòng), hệ thống truyền tham số vào URL:
```text
/tenants/diff?id1=1&id2=2
```
Khi phát hiện có tham số `id1` và `id2`, HTMX tự động chọn sẵn 2 Tenant này trong Dropdown và tải ngay bảng dữ liệu so sánh mà không bắt người dùng phải bấm nút Compare lần nữa.

## 2. Bảng Trực quan hóa Khác biệt (Side-by-Side Diff Table)

Bảng so sánh chia thành 3 cột chính và được tổ chức mạch lạc thành **7 phân hệ (Modules)** tường minh tương tự giao diện Thêm mới / Chỉnh sửa:
1. **🏢 General Information & Identity**: Tên doanh nghiệp, định danh `Slug`.
2. **🎨 Branding & Visual Aesthetics**: So sánh màu sắc Primary/Secondary với hộp màu trực quan.
3. **📑 Claim Types & Required Documentation**: Đối chiếu 5 loại hình bảo hiểm (OUTPATIENT, INPATIENT, DENTAL, MATERNITY, OPTICAL) kèm trạng thái (Bật/Tắt) và danh sách tài liệu Bắt buộc/Tùy chọn.
4. **🛡️ Approval Rules & Hierarchy Matrix**: So sánh hạn mức duyệt tự động và cấu trúc Tiers phân cấp.
5. **📢 Lifecycle Notification Hooks**: Đối chiếu các kênh hoạt động (Email, SMS, Webhook) và thiết lập Template (Default vs Custom Endpoint).
6. **⏳ SLA Resolution & Escalations**: Ngày làm việc hợp lệ trong tuần, mục tiêu xử lý (Target Days) và lộ trình tự động leo thang (Escalations).
7. **🧩 Custom Metadata Schema Verification**: So sánh các trường siêu dữ liệu tùy chỉnh.

### Hiệu ứng Highlight Khác biệt (Diff Highlighting)
- **Hàng có giá trị giống nhau (Identical)**: Hiển thị nền trắng bình thường.
- **Hàng có giá trị khác nhau (Differences - `[≠]`)**: Được highlight tự động bằng nền màu vàng nhạt (Amber-50/90), viền vàng cam kèm theo biểu tượng `[≠] Diff` trực quan.
- **Tiêu đề phân hệ (Section Headers)**: Có dải phân cách xám nhạt với tiêu đề in đậm giúp người dùng dễ dàng định vị vị trí cấu hình.

## 3. Tối ưu Trải nghiệm (UX Features)
- **Toggle "Show Differences Only"**: Một nút bấm thông minh (`⚡ Filter Differences Only [≠]`) cho phép lập tức ẩn đi tất cả các thông số giống nhau, chỉ giữ lại các hàng có điểm khác biệt và các thanh Tiêu đề phân hệ (Section Headers) tương ứng.
