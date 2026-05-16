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

Bảng so sánh chia thành 3 cột chính:
1. **Tên Hạng mục (Config Parameter)**: Tên thông số cấu hình của các module (SLA, Threshold...).
2. **Giá trị của Tenant A**.
3. **Giá trị của Tenant B**.

### Hiệu ứng Highlight Khác biệt (Diff Highlighting)
Để người dùng không phải căng mắt tìm điểm khác biệt:
- **Hàng có giá trị giống nhau (Identical)**: Hiển thị nền trắng hoặc xám nhạt bình thường.
- **Hàng có giá trị khác nhau (Differences - `[≠]`)**: Được highlight tự động bằng nền màu vàng nhạt (Amber-50) hoặc viền cam, kèm theo biểu tượng `[≠]` trực quan.
- **Dữ liệu thiếu/trống**: Nếu Tenant A có Custom Field nhưng Tenant B không có, ô của Tenant B hiển thị dấu gạch ngang mờ `(None)` màu đỏ nhạt.

## 3. Tối ưu Trải nghiệm (UX Features)
- **Toggle "Show Differences Only"**: Một công tắc bật/tắt để ẩn đi tất cả các hàng có giá trị giống nhau, chỉ hiển thị những điểm khác biệt. Tính năng này vô cùng đắt giá khi các Tenant có cấu hình dài hàng trăm mục.
