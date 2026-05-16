# 🧠 Bài kiểm tra Tư duy Kỹ thuật & Giải quyết Vấn đề (Problem Solving & Logic Questions)

**Họ và tên Ứng viên:** Ngô Lâm  
**Tài liệu đính kèm:** Báo cáo Kỹ thuật dự án **AI Challenge 15**  

---

## 🚪 1. Q14 — Thiết kế cánh cửa ra vào tốt nhất cho nhà vệ sinh Nam công cộng [O, D] (Chuyên sâu)

### 💡 Quyết định thiết kế lõi
Quyết định đầu tiên của tôi là sẽ **bỏ qua hoàn toàn ý tưởng lắp cửa đóng/mở truyền thống** cho nhà vệ sinh nam công cộng. Thay vào đó, tôi sẽ thiết kế lối vào dạng vách ngăn không cửa theo hình chữ **Z (zigzag)**.

```
       [Tường chắn ngoài]
   ───────┐
          │   ← Lối đi vào dạng chữ Z
   ┌──────┘
   │   [Khu vực vệ sinh bên trong]
```

### 🔍 Lập luận & Vì sao?
1. **Trải nghiệm thực tế:** Khi quan sát và sử dụng các nhà vệ sinh ở quán nhậu, trạm dừng chân, họ thường dùng cửa nhôm che tầm mắt mở 2 chiều hoặc dùng các tấm nhựa xếp lớp để làm màn. Trong môi trường công cộng, các cánh cửa hoặc màn che này luôn luôn ở tình trạng ẩm ướt, bám bẩn, tạo cảm giác rất e ngại khi người sử dụng phải chạm tay vào.
2. **Khử hoàn toàn điểm tiếp xúc (Touchless Experience):** Thiết kế vách ngăn dạng chữ Z giải quyết triệt để vấn đề không phải chạm tay vào cửa, tránh tình trạng lây nhiễm chéo vi khuẩn.
3. **Bảo đảm tuyệt đối sự riêng tư:** Góc gấp khúc của chữ Z che khuất hoàn toàn tầm nhìn từ bên ngoài vào khu vực bên trong.
4. **Tối ưu hóa thông lượng (High Throughput):** Luồng người có thể ra vào liên tục một cách mượt mà mà không mất thao tác chờ đẩy hay mở/đóng cửa.
5. **Tiết kiệm tối đa chi phí vận hành:** Đặc biệt thiết kế này **không tốn chi phí bảo trì**, vì hoàn toàn không có bản lề cơ học, không có tay nắm cửa hay chốt khóa để bị hỏng hóc theo thời gian.

---

## 🍉 2. Q15 — Chọn quầy "ngon, bổ, rẻ" ở chợ trái cây buổi trưa, không hỏi ai [O, Cr, P] (Chuyên sâu)

### 👁️ Phương pháp quan sát trực quan
Nếu bước vào một khu chợ trái cây buổi trưa và không có ai để hỏi thăm, phương pháp hiệu quả nhất là dùng kỹ năng quan sát thực tế để sàng lọc:

1. **Minh bạch về giá & Đo lường:** Đầu tiên, nhìn lướt qua xem quầy nào có trái cây tươi, giá cả được niêm yết công khai rõ ràng trên bảng, và đặc biệt là mặt đồng hồ cân quay ra hướng khách hàng. Đây là dấu hiệu của sự trung thực và kinh doanh uy tín.
2. **Dấu hiệu xoay vòng vốn / Hàng mới về:** Quan sát kỹ các manh mối xung quanh quầy kinh doanh để tìm dấu hiệu vừa mới nhập hàng. Ví dụ:
   - Các thùng giấy các-tông vừa xé nắp đậy.
   - Các khay nhựa, sọt nhựa xếp chồng gọn gàng ngay cạnh quầy.
3. **Kết luận:** Quầy có các dấu hiệu trên khả năng rất cao là họ kinh doanh đắt khách, tốc độ xoay vòng hàng nhanh và vừa mới khui lô hàng mới, bảo đảm chất lượng trái cây luôn tươi ngon nhất với giá sát gốc.

---

## ⛽ 3. Q12 — Viết hướng dẫn đổ xăng tại cây xăng nhanh nhất có thể [Cr, Q] (Chuyên sâu)

Tôi sẽ chọn phương tiện là **xe máy** để viết quy trình hướng dẫn tối ưu hóa tốc độ này, vì đây là phương tiện tôi sử dụng để di chuyển hằng ngày.

### ⏱️ Quy trình 4 bước tối ưu hóa thời gian (Time-Optimized Workflow)

```
[Bước 1: Chuẩn bị trước] ──> [Bước 2: Quan sát chọn hàng] ──> [Bước 3: Sẵn sàng & Hô giá] ──> [Bước 4: Thanh toán & Thoát]
```

- **Bước 1: Xác định trước ngân sách**
  Xác định chính xác số tiền muốn đổ ngay từ đầu. Nên chọn những mốc số chẵn quen thuộc như `50.000 VNĐ` hoặc `70.000 VNĐ`. Mục đích là triệt tiêu hoàn toàn thời gian chờ nhân viên thối lại tiền lẻ. *(Nếu chưa xác định được số tiền có trong ví, thao tác này sẽ gộp vào Bước 3).*

- **Bước 2: Quan sát & Sàng lọc hàng đợi**
  Trước khi rẽ vào cây xăng, hãy quan sát nhanh và **tránh đứng sau** các đối tượng sau:
  - Những xe đang chở đồ đạc cồng kềnh phía sau.
  - Người đã dừng xe tại trụ bơm nhưng trên tay vẫn đang lỉnh kỉnh cầm đồ.
  - Những người mặc áo chống nắng, áo mưa trùm kín mít (vì họ sẽ mất rất nhiều thời gian cởi đồ, mở ví).
  👉 **Lựa chọn tối ưu:** Hãy chọn đứng ngay sau những người đã cầm sẵn tiền trên tay, hoặc chọn những hàng có ít phương tiện đợi nhất.

- **Bước 3: Tối ưu thao tác trong lúc chờ (Parallel Processing)**
  Trong thời gian chờ phương tiện phía trước bơm xăng:
  - Mở bóp (ví) xem và lấy sẵn đúng số tiền chẵn `50k`, `70k` cầm ngay trên tay.
  - Mở sẵn khóa yên (cốp xe), xoay vặn mở hờ trước nắp bình xăng.
  - Duy trì tư thế sẵn sàng di chuyển xe tiến sát vào trụ bơm ngay khi người phía trước di chuyển ra.
  - Vừa dừng đúng điểm bơm, lập tức giao tiếp nhanh, rõ ràng với nhân viên: *"50 ngàn anh ơi!"*.

- **Bước 4: Thanh toán & Rời khu vực bơm nhanh chóng**
  Tay cầm sẵn nắp bình xăng. Ngay khi nhân viên rút vòi bơm: lập tức vặn đậy nắp bình xăng, đưa tiền thanh toán, đóng yên xe.
  👉 **Quy tắc thoát nhanh:** Lập tức dắt xe ra khỏi khu vực trụ bơm để nhường chỗ cho người phía sau tiến lên. Khi đã ra đến không gian trống thoáng phía ngoài, lúc đó mới thong thả cất bóp (ví) vào túi hoặc đeo lại khẩu trang.

---

## 🧗 4. Q2 — Một con người nói chung tìm kiếm gì ở sự nghiệp? [S] (Khởi động)

Bản chất của sự nghiệp là một **cuộc giao dịch lớn của đời người**: nơi ta đánh đổi thời gian, sức khỏe và năng lượng để nhận lại giá trị và sự công nhận. Trong cuộc giao dịch này, tôi nhận thấy con người nói chung tìm kiếm 3 trụ cột giá trị vô cùng thực tế theo từng nấc thang phát triển:

```
[Nấc thang 1: TIỀN BẠC (Sự an toàn)] ──> [Nấc thang 2: VỊ THẾ (Sự công nhận)] ──> [Nấc thang 3: TỰ CHỦ (Sự tự do)]
```

### 💰 1. Tiền bạc — Mua đứt sự bất an (Sinh tồn an toàn)
- **Cốt lõi đầu tiên luôn là tiền.** Bởi vì tiền có khả năng giải quyết và "mua đứt" phần lớn sự bất an trong cuộc sống.
- Sự nghiệp trước hết phải tạo ra nền tảng tài chính vững chắc để con người không lo sợ hay gục ngã trước những rủi ro và biến cố bất ngờ.
- Ở giai đoạn này, người ta khao khát tìm kiếm sự ổn định và sẵn sàng đánh đổi sự nhàm chán, mệt mỏi trong công việc, miễn là phần thưởng tài chính đủ để duy trì một cuộc sống sinh tồn an toàn cho bản thân và gia đình.

### 👑 2. Vị thế — Đòn bẩy tiếng nói (Sự công nhận & Tôn trọng)
- Khi đã đạt được ngưỡng sinh tồn an toàn, nhu cầu của con người sẽ nâng cấp lên khao khát về danh tiếng và sự công nhận xã hội.
- Họ nỗ lực phấn đấu để trở thành người xuất sắc trong chuyên môn, nắm giữ những vai trò quan trọng, then chốt và khó bị thay thế trong tổ chức.
- Vị thế chuyên môn và chức danh lúc này chính là một "đòn bẩy quyền lực", giúp họ có tiếng nói trọng lượng, được tôn trọng và không bao giờ bị chèn ép trong môi trường làm việc.

### 🕊️ 3. Quyền Tự chủ — Đích đến cao nhất (Sự tự do)
- Đích đến cuối cùng và cao nhất của sự nghiệp mà con người nỗ lực vươn tới chính là dùng sự nghiệp để **mua lại sự tự do** cho chính mình.
- Đó là quyền tự chủ tuyệt đối: tự do quyết định thời gian làm việc, tự do lựa chọn không gian, tự do lựa chọn những dự án và công việc mình thực sự yêu thích.
- Và quyền lực tối thượng nhất của sự tự do chính là: **có đặc quyền nói lời từ chối với những điều mình không thích** mà không phải bận tâm hay lo sợ bất kỳ rào cản nào.

---
*Tài liệu được biên soạn và trình bày hoàn chỉnh để đính kèm hồ sơ năng lực gửi đến Quý Công ty.*
