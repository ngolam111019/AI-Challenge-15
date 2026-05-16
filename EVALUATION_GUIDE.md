# 🏆 Báo cáo Nghiệm thu & Hướng dẫn Đánh giá (Evaluation & Submission Guide)

**Kính gửi Hội đồng Đánh giá Kỹ thuật (Hiring Managers & Tech Leads),**

Tài liệu này được thiết kế tối ưu hóa để giúp quý vị kiểm chứng và đánh giá toàn bộ các yêu cầu nghiệp vụ (Requirements) và tiêu chí nghiệm thu (Evaluation Criteria) của bài toán **AI Challenge 15 — Multi-Tenant Configuration Platform** một cách nhanh chóng, trực quan và trọn vẹn nhất.

---

## 🌐 1. Địa chỉ Trải nghiệm Trực tuyến (Live Demo URL)

> [!IMPORTANT]
> **🚀 Live Admin UI & Preview Sandbox:** [https://ai-challenge-15.onrender.com/](https://ai-challenge-15.onrender.com/)  
> *Hệ thống đã được kết nối tự động với cơ sở dữ liệu PostgreSQL Serverless (Neon.tech) và tích hợp sẵn 3 Tenant mẫu theo đúng đặc tả đề bài.*

**💡 Tính năng Độc quyền cho Hội đồng (Demo SafeGuard):**  
Trong quá trình trải nghiệm (thử tạo mới, sửa, xóa các Tenant), nếu quý vị muốn đưa hệ thống trở về trạng thái gốc hoàn hảo ban đầu, chỉ cần nhấp vào nút **`🔄 Reset Demo Sample Tenants`** trên thanh công cụ của trang chủ Quản lý Tenant. Hệ thống sẽ lập tức dọn sạch dữ liệu rác và khôi phục nguyên trạng 3 Tenant mẫu ban đầu trong chưa đầy 1 giây!

---

## 📊 2. Hướng dẫn Kiểm chứng Nhanh theo Tiêu chí Đánh giá (Quick Verification by Evaluation Criteria)

Quý vị có thể kiểm chứng trọn vẹn 8 tiêu chí nghiệm thu khắt khe của đề bài chỉ với các thao tác trực quan sau:

### 🎯 Tiêu chí 1 & 7: 3 Tenant cho ra 3 kết quả xử lý hoàn toàn khác biệt trên cùng 1 bộ hồ sơ
👉 **Cách kiểm tra (30 giây):**
1. Truy cập vào trang mô phỏng: [https://ai-challenge-15.onrender.com/tenants/preview](https://ai-challenge-15.onrender.com/tenants/preview)
2. Nhập các thông số chung cho hồ sơ bồi thường:
   - **Claim Amount**: `$10,000`
   - **Claim Type**: `OUTPATIENT` (Điều trị ngoại trú)
   - **Custom Fields**: Nhập dữ liệu hợp lệ vào các ô hiển thị (ví dụ: `EMP123`, `IT Dept`, `BUDGET2026`).
3. Chuyển đổi qua lại giữa 3 Tenant trong danh sách Dropdown để quan sát kết quả xử lý tức thì:

| Tham số Đầu ra | 🛡️ SafeGuard Insurance (Corporate) | 🏥 HealthFirst (Retail) | 🏛️ GovHealth (Government) |
| :--- | :--- | :--- | :--- |
| **Phân luồng Duyệt (Approval)** | **`Auto-Approve ⚡`** (Vì $10k <= $20k ngưỡng tự động) | **`Tiered Approval: assessor`** (Vì $10k vượt ngưỡng $5k) | **`Tiered Approval: director`** (Ngưỡng $0, bắt buộc duyệt tay) |
| **Giấy tờ Bắt buộc (Docs)** | `ID Card` và `Medical Bill` | Chỉ cần `ID Card` | `Gov ID Card` và `Standard Bill` |
| **Kênh Thông báo (Notifications)** | Chỉ kích hoạt cổng **Email** Gateway | Kích hoạt đồng thời **Email** và **SMS Gateway** | Kích hoạt cổng **Email** và cổng **HTTP Webhook** (ERP) |
| **Hạn chót Xử lý (SLA Deadline)** | Đúng **5 ngày làm việc** (Không tính T7, CN) | Đúng **7 ngày làm việc** (Tính cả Thứ 7) | Đúng **15 ngày làm việc** (Không tính T7, CN) |

### 🛡️ Tiêu chí 2: Admin UI kiểm soát chặt chẽ và ngăn chặn các cấu hình không hợp lệ
👉 **Cách kiểm tra:**
1. Tại trang Danh sách Tenant (`/tenants`), nhấp vào nút **`✏️ Edit`** của Tenant bất kỳ.
2. Kiểm tra các rào cản Validation:
   - **Auto-approval Threshold**: Chuyển sang Tab `Approval Rules`, thử gõ số âm `-5000`. Form lập tức báo lỗi và không cho nhập số âm (`min="0"`).
   - **Claim Types**: Chuyển sang Tab `Claim Types`, thử tắt (disable) toàn bộ 5 loại hình bảo hiểm. Hệ thống sẽ cảnh báo bắt buộc phải bật ít nhất 1 loại hình.
   - **SLA Days**: Chuyển sang Tab `SLA`, thử nhập số ngày âm. Form từ chối lưu.
   - **Mandatory Change Note**: Thử sửa một thông số và nhấp **`Save Config`**. Một hộp thoại chuyên nghiệp sẽ xuất hiện yêu cầu quản trị viên bắt buộc phải nhập lý do thay đổi để lưu vào nhật ký kiểm toán.

### 🧪 Tiêu chí 3: Chế độ Sandbox (Preview Mode) dự đoán chính xác kết quả thực thi
👉 **Cách kiểm tra:**
1. Mở trang [Preview Mode](/tenants/preview).
2. Chọn Tenant `GovHealth` (Đơn vị yêu cầu bắt buộc phải có `Department` và `Budget Code`).
3. Cố tình để trống ô nhập liệu của 2 trường này và nhấp **`Simulate Pipeline`**.
4. Quý vị sẽ thấy đường ống thực thi lập tức dừng lại, đồng thời xuất hiện một dải Banner đỏ nhấp nháy báo lỗi: **`Validation Error: Required Metadata Missing`**, chứng minh API Runtime kiểm soát dữ liệu cực kỳ chuẩn xác.

### ⚖️ Tiêu chí 4: Config Diff nhận diện chính xác sự khác biệt giữa 2 Tenant
👉 **Cách kiểm tra:**
1. Mở trang Danh sách Tenant (`/tenants`).
2. Tích chọn vào đúng 2 ô Checkbox (Ví dụ: `SafeGuard` và `GovHealth`). Nút **`⚖️ Compare (2/2)`** sẽ chuyển sang màu tím sáng (Nếu chọn 1 hoặc 3 dòng, nút sẽ bị khóa).
3. Nhấp nút Compare, màn hình So sánh Song song (Side-by-side) sẽ hiển thị ma trận đối chiếu 7 chiều tham số, tự động bôi màu (Highlight) các khác biệt giữa 2 bên.

### 🕒 Tiêu chí 5: Config History và cơ chế Rollback hoạt động trơn tru
👉 **Cách kiểm tra:**
1. Nhấp nút **`🕒 History`** trên một Tenant.
2. Bảng lịch sử sẽ hiển thị danh sách các phiên bản (`v1`, `v2`...) với đầy đủ thời gian và Ghi chú cam kết (`Change Note`).
3. Nhấp nút **`🔄 Rollback`** tại phiên bản cũ `v1`. Hệ thống áp dụng nguyên tắc quản lý phiên bản bất biến (Immutable Audit Trail theo chuẩn Git): không xóa dữ liệu cũ mà tạo ra một phiên bản mới nhất kế thừa toàn bộ cấu hình của `v1`, đảm bảo tuyệt đối tính minh bạch cho quy trình thanh tra bảo hiểm.

### 🚀 Tiêu chí 6: Thêm mới Tenant thứ 4 (Zero-Code Onboarding)
👉 **Cách kiểm tra:**
1. Tại trang chủ, nhấp nút **`+ New Tenant`**.
2. Nhập thông tin: `AAA Insurance` (Slug: `aaa-ins`), cấu hình các module theo ý muốn và nhấp Save.
3. Ngay lập tức mở trang Preview Sandbox hoặc trang Diff: `AAA Insurance` lập tức xuất hiện trong danh sách và sẵn sàng xử lý bồi thường thực tế mà không cần khởi động lại server hay can thiệp bất kỳ dòng code nào!

### 🧩 Tiêu chí 8: Kiến trúc mã nguồn Mô-đun hóa (Modular Architecture)
- Kiến trúc hệ thống được phân tách tường minh: nếu trong tương lai doanh nghiệp cần bổ sung chiều cấu hình mới (ví dụ: `Currency Settings` hoặc `Fraud Detection AI`), kỹ sư phần mềm chỉ cần thêm 1 khai báo vào file `services/moduleRegistry.js` và tạo 1 file giao diện Nunjucks nhỏ tương ứng. Toàn bộ hệ thống lưu trữ JSONB tự động mở rộng mà không cần thay đổi lược đồ database!

---

## 🛠️ 3. Kiểm định trên Máy Local (Local Clone & Terminal Verification)

Nếu quý vị muốn rà soát trực tiếp mã nguồn hoặc chạy thử trên máy cá nhân (Localhost) mà không cần cài đặt Docker hay cấu hình Database phức tạp, chúng tôi đã chuẩn bị sẵn đường truyền kết nối Cloud trực tiếp:

### Bước 1: Clone kho lưu trữ và cài đặt thư viện
```bash
git clone https://github.com/ngolam111019/AI-Challenge-15.git
cd "AI Challenge 15"
npm install
```

### Bước 2: Cấu hình Cơ sở dữ liệu Cloud trực tiếp (Zero Setup)
Tạo một file `.env` tại thư mục gốc và dán chuỗi kết nối trực tiếp đến cơ sở dữ liệu Neon Cloud của hệ thống:
```env
DATABASE_URL=postgresql://neondb_owner:npg_be9Jl7UvQsPk@ep-rapid-dust-aolx22mg.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Bước 3: Chạy Kịch bản Nghiệm thu API Runtime Lõi
```bash
node demo_runtime.js
```
Hệ thống sẽ kết nối trực tiếp lên Cloud, mô phỏng gửi 3 hồ sơ vào SafeGuard, HealthFirst, GovHealth và in ra chuỗi JSON đặc tả trọn vẹn 5 thông số đầu ra.

### Bước 4: Khởi chạy Giao diện Web Quản trị
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: `http://localhost:3000/tenants`

---
**Trân trọng cảm ơn Quý vị đã dành thời gian xem xét và đánh giá giải pháp!**
